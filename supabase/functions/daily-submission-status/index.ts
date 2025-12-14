// NOTE: The following imports use Deno/ESM URLs which are not resolvable by the client-side TypeScript compiler.
// This is expected and acceptable for Supabase Edge Functions.
// @ts-ignore - Deno standard library import
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
// @ts-ignore - Supabase JS client import
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
    auth: {
      persistSession: false,
    },
  });
};

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Daily submission status function invoked");
    
    const supabase = getServiceSupabase();
    
    const url = new URL(req.url);
    const date = url.searchParams.get('date');

    console.log("Date parameter:", date);

    if (!date) {
      console.error("Missing date parameter");
      return new Response(JSON.stringify({ error: 'Missing date parameter' }), {
        headers: corsHeaders,
        status: 400,
      });
    }

    const reportTables = [
      { name: 'reports_accounting', type: 'accounting' },
      { name: 'reports_cashier', type: 'cashier' },
      { name: 'reports_consignment_staff', type: 'consignment_staff' },
      { name: 'reports_supervisor_manager', type: 'supervisor_manager' },
    ];

    console.log("Fetching submissions for date:", date);
    
    const submissionPromises = reportTables.map(async (table) => {
      console.log(`Querying ${table.name} for date ${date}`);
      
      const { data, error, count } = await supabase
        .from(table.name)
        .select('user_id', { count: 'exact' })
        .eq('report_date', date);

      if (error) {
        console.error(`Error querying ${table.name}:`, error);
        throw error;
      }
      
      console.log(`Found ${count} submissions in ${table.name}`);
      
      return data.map((item: { user_id: string }) => ({
        user_id: item.user_id,
        report_type: table.type,
      }));
    });

    const allSubmissions = (await Promise.all(submissionPromises)).flat();
    console.log("Total submissions found:", allSubmissions.length);
    
    // Group submissions by user_id and collect all report types submitted
    const userSubmissions = new Map<string, Set<string>>();
    allSubmissions.forEach((sub: { user_id: string; report_type: string }) => {
        if (!userSubmissions.has(sub.user_id)) {
            userSubmissions.set(sub.user_id, new Set());
        }
        userSubmissions.get(sub.user_id)!.add(sub.report_type);
    });

    const submittedUserIds = Array.from(userSubmissions.keys());
    console.log("Unique users who submitted:", submittedUserIds.length);

    if (submittedUserIds.length === 0) {
        console.log("No submissions found for date:", date);
        return new Response(JSON.stringify({ submissions: [] }), {
            headers: corsHeaders,
            status: 200,
        });
    }

    // Fetch profiles for submitted users
    console.log("Fetching profiles for users:", submittedUserIds);
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .in('id', submittedUserIds);

    if (profileError) {
        console.error("Error fetching profiles:", profileError);
        throw profileError;
    }
    
    console.log("Profiles fetched:", profiles.length);

    const submissions = profiles.map((profile: { id: string; first_name: string | null; last_name: string | null; role: string | null }) => ({
        user_id: profile.id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User',
        role: profile.role || 'Unknown Role',
        report_types: Array.from(userSubmissions.get(profile.id) || []),
    }));

    console.log("Final submissions data:", submissions);
    
    return new Response(
      JSON.stringify({ submissions }),
      {
        headers: corsHeaders,
        status: 200,
      },
    );
  } catch (error: unknown) {
    // Type assertion to access error.message
    const errorMessage = (error as Error).message || 'An unknown error occurred';
    console.error("Edge Function Error:", errorMessage);
    
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        headers: corsHeaders,
        status: 500,
      },
    );
  }
});