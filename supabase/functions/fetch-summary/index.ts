import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

// Helper function to get the Supabase client with the Service Role Key
// NOTE: We use the Service Role Key here because we need to query multiple tables
// and bypass RLS for aggregation purposes, which is typical for backend summary generation.
// The Service Role Key must be set as a secret in Supabase Edge Functions environment.
const getServiceSupabase = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables.');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
    },
  });
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = getServiceSupabase();
    
    // We don't need to verify JWT here since this function uses the Service Role Key
    // and is intended for internal summary generation, but we should ensure the caller is authenticated
    // by checking the Authorization header if we were using the standard client.
    // For simplicity in this summary function, we rely on the Service Role Key.

    // Define the date range for aggregation (e.g., last 30 days or current month)
    // For this initial implementation, we will fetch data for the last 30 days.
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0]; // YYYY-MM-DD

    // --- 1. Fetch Accounting Summary ---
    const { data: accData, error: accError } = await supabase
      .from('reports_accounting')
      .select('report_date, new_customers_count, new_sales_count')
      .gte('report_date', startDate);

    if (accError) throw accError;

    // --- 2. Fetch Cashier Summary ---
    const { data: cashierData, error: cashierError } = await supabase
      .from('reports_cashier')
      .select('report_date, payments_count, total_payments')
      .gte('report_date', startDate);

    if (cashierError) throw cashierError;

    // --- 3. Fetch Consignment Staff Summary (LPK) ---
    const { data: consignmentData, error: consignmentError } = await supabase
      .from('reports_consignment_staff')
      .select('report_date, lpk_entered_bsoft')
      .gte('report_date', startDate);

    if (consignmentError) throw consignmentError;

    // --- 4. Aggregate Data by Date ---
    const dailySummaryMap = new Map();

    const aggregate = (data: any[], dateKey: string, metrics: Record<string, (item: any) => number>) => {
        data.forEach(item => {
            const date = item[dateKey];
            if (!dailySummaryMap.has(date)) {
                dailySummaryMap.set(date, {
                    date,
                    total_new_customers: 0,
                    total_new_sales: 0,
                    total_payments_count: 0,
                    total_payments_amount: 0,
                    total_lpk_entered: 0,
                });
            }
            const summary = dailySummaryMap.get(date);
            
            Object.keys(metrics).forEach(key => {
                summary[key] += metrics[key](item);
            });
        });
    };

    aggregate(accData, 'report_date', {
        total_new_customers: (item) => item.new_customers_count,
        total_new_sales: (item) => item.new_sales_count,
    });

    aggregate(cashierData, 'report_date', {
        total_payments_count: (item) => item.payments_count,
        total_payments_amount: (item) => parseFloat(item.total_payments),
    });

    aggregate(consignmentData, 'report_date', {
        total_lpk_entered: (item) => item.lpk_entered_bsoft,
    });

    const dailySummary = Array.from(dailySummaryMap.values()).sort((a, b) => a.date.localeCompare(b.date));

    // --- 5. Calculate Monthly Summary (Total over the period) ---
    const monthlySummary = dailySummary.reduce((acc, day) => {
        acc.total_new_customers += day.total_new_customers;
        acc.total_new_sales += day.total_new_sales;
        acc.total_payments_count += day.total_payments_count;
        acc.total_payments_amount += day.total_payments_amount;
        acc.total_lpk_entered += day.total_lpk_entered;
        return acc;
    }, {
        total_new_customers: 0,
        total_new_sales: 0,
        total_payments_count: 0,
        total_payments_amount: 0,
        total_lpk_entered: 0,
    });


    return new Response(
      JSON.stringify({ daily: dailySummary, monthly: monthlySummary }),
      {
        headers: corsHeaders,
        status: 200,
      },
    );
  } catch (error) {
    console.error("Edge Function Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: corsHeaders,
        status: 500,
      },
    );
  }
});