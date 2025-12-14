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

serve(async (req: Request) => { // Fixed: Added explicit type for 'req' parameter
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = getServiceSupabase();
    
    const url = new URL(req.url);
    const date = url.searchParams.get('date');

    if (!date) {
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

    const submissionPromises = reportTables.map(async (table) => {
      const { data, error } = await supabase
        .from(table.name)
        .select('user_id')
        .eq('report_date', date);

      if (error) throw error;

      return data.map((item: { user_id: string }) => ({ // Fixed: Added explicit type for 'item' parameter
        user_id: item.user_id,
        report_type: table.type,
      }));
    });

    const allSubmissions = (await Promise.all(submissionPromises)).flat();
    
    // Group submissions by user_id and collect all report types submitted
    const userSubmissions = new Map<string, Set<string>>();
    allSubmissions.forEach((sub: { user_id: string; report_type: string }) => { // Fixed: Added explicit type for 'sub' parameter
        if (!userSubmissions.has(sub.user_id)) {
            userSubmissions.set(sub.user_id, new Set());
        }
        userSubmissions.get(sub.user_id)!.add(sub.report_type);
    });

    const submittedUserIds = Array.from(userSubmissions.keys());

    if (submittedUserIds.length === 0) {
        return new Response(JSON.stringify({ submissions: [] }), {
            headers: corsHeaders,
            status: 200,
        });
    }

    // Fetch profiles for submitted users
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .in('id', submittedUserIds);

    if (profileError) throw profileError;

    const submissions = profiles.map((profile: { id: string; first_name: string | null; last_name: string | null; role: string | null }) => ({ // Fixed: Added explicit type for 'profile' parameter
        user_id: profile.id,
        name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || 'Unknown User',
        role: profile.role || 'Unknown Role',
        report_types: Array.from(userSubmissions.get(profile.id) || []),
    }));

    return new Response(
      JSON.stringify({ submissions }),
      {
        headers: corsHeaders,
        status: 200,
      },
    );
  } catch (error: unknown) { // Fixed: Added explicit type for 'error' parameter
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