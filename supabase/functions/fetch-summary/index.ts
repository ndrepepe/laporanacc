// @ts-ignore: Deno library imports
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore: Deno library imports
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Content-Type': 'application/json',
};

const getServiceSupabase = () => {
  const supabaseUrl = Deno.env.get('SUPABASE_URL');
  const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error('Missing Supabase environment variables.');
  }

  return createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response(null, { headers: corsHeaders });

  try {
    const supabase = getServiceSupabase();
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const startDate = thirtyDaysAgo.toISOString().split('T')[0];

    // Fetch all data in PARALLEL to optimize speed
    const [accRes, cashierRes, consignmentRes] = await Promise.all([
      supabase
        .from('reports_accounting')
        .select('report_date, new_customers_count, new_sales_count')
        .gte('report_date', startDate),
      supabase
        .from('reports_cashier')
        .select('report_date, payments_count, total_payments')
        .gte('report_date', startDate),
      supabase
        .from('reports_consignment_staff')
        .select('report_date, lpk_entered_bsoft')
        .gte('report_date', startDate)
    ]);

    if (accRes.error) throw accRes.error;
    if (cashierRes.error) throw cashierRes.error;
    if (consignmentRes.error) throw consignmentRes.error;

    const dailySummaryMap = new Map();

    const aggregate = (data: any[], metrics: Record<string, (item: any) => number>) => {
        data.forEach(item => {
            const date = item.report_date;
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

    aggregate(accRes.data, {
        total_new_customers: (item: any) => item.new_customers_count || 0,
        total_new_sales: (item: any) => item.new_sales_count || 0,
    });

    aggregate(cashierRes.data, {
        total_payments_count: (item: any) => item.payments_count || 0,
        total_payments_amount: (item: any) => parseFloat(item.total_payments || 0),
    });

    aggregate(consignmentRes.data, {
        total_lpk_entered: (item: any) => item.lpk_entered_bsoft || 0,
    });

    const dailySummary = Array.from(dailySummaryMap.values()).sort((a, b) => b.date.localeCompare(a.date));

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
      { headers: corsHeaders, status: 200 }
    );
  } catch (error: any) {
    console.error("Summary Edge Function Error:", error.message);
    return new Response(JSON.stringify({ error: error.message }), { headers: corsHeaders, status: 500 });
  }
});