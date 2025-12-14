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

  if (!supabaseUrl) {
    console.error('Missing SUPABASE_URL environment variable');
    throw new Error('Missing SUPABASE_URL environment variable.');
  }

  if (!supabaseServiceRoleKey) {
    console.error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable');
    throw new Error('Missing SUPABASE_SERVICE_ROLE_KEY environment variable.');
  }

  try {
    return createClient(supabaseUrl, supabaseServiceRoleKey, {
      auth: {
        persistSession: false,
      },
    });
  } catch (error: unknown) {
    console.error('Error creating Supabase client:', error);
    throw new Error(`Failed to create Supabase client: ${(error as Error).message}`);
  }
};

serve(async (req: Request) => {
  console.log('Function started');
  
  if (req.method === 'OPTIONS') {
    console.log('Handling OPTIONS request');
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log("Daily submission status function invoked");
    
    // Check if required environment variables are present
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseServiceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    
    console.log("Environment variables check:", { supabaseUrl: !!supabaseUrl, supabaseServiceRoleKey: !!supabaseServiceRoleKey });
    
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL environment variable is not set');
    }
    
    if (!supabaseServiceRoleKey) {
      throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is not set');
    }
    
    const supabase = getServiceSupabase();
    
    const url = new URL(req.url);
    const date = url.searchParams.get('date');

    console.log("Date parameter:", date);
    console.log("Full URL:", req.url);

    if (!date) {
      // If date is not provided, use today's date
      const today = new Date();
      const todayString = today.toISOString().split('T')[0];
      console.log("Date parameter not provided, using today's date:", todayString);
      // Redirect to the same function with today's date
      return new Response(
        JSON.stringify({ error: 'Date parameter is required. Please provide a date in YYYY-MM-DD format.' }), 
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
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
      
      try {
        const { data, error, count } = await supabase
          .from(table.name)
          .select('user_id', { count: 'exact' })
          .eq('report_date', date);

        if (error) {
          console.error(`Error querying ${table.name}:`, error);
          // Don't throw error, just return empty array for this table
          return [];
        }
        
        console.log(`Found ${count} submissions in ${table.name}`);
        
        return data.map((item: { user_id: string }) => ({
          user_id: item.user_id,
          report_type: table.type,
        }));
      } catch (tableError: unknown) {
        console.error(`Exception querying ${table.name}:`, tableError);
        // Return empty array for this table if there's an exception
        return [];
      }
    });

    const results = await Promise.allSettled(submissionPromises);
    const allSubmissions: { user_id: string; report_type: string }[] = [];
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        allSubmissions.push(...result.value);
      } else {
        console.error(`Promise rejected for table ${reportTables[index].name}:`, result.reason);
      }
    });
    
    console.log("Total submissions found:", allSubmissions.length);
    
    // Group submissions by user_id and collect all report types submitted
    const userSubmissions = new Map<string, Set<string>>();
    allSubmissions.forEach((sub) => {
        if (!userSubmissions.has(sub.user_id)) {
            userSubmissions.set(sub.user_id, new Set());
        }
        userSubmissions.get(sub.user_id)!.add(sub.report_type);
    });

    const submittedUserIds = Array.from(userSubmissions.keys());
    console.log("Unique users who submitted:", submittedUserIds.length);

    if (submittedUserIds.length === 0) {
        console.log("No submissions found for date:", date);
        return new Response(
          JSON.stringify({ submissions: [] }), 
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
    }

    // Fetch profiles for submitted users
    console.log("Fetching profiles for users:", submittedUserIds);
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, role')
        .in('id', submittedUserIds);

    if (profileError) {
        console.error("Error fetching profiles:", profileError);
        // Don't throw error, just return submissions without profile info
        const submissionsWithoutProfiles = submittedUserIds.map(userId => ({
          user_id: userId,
          name: 'Unknown User',
          role: 'Unknown Role',
          report_types: Array.from(userSubmissions.get(userId) || []),
        }));
        
        console.log("Returning submissions without profiles:", submissionsWithoutProfiles);
        return new Response(
          JSON.stringify({ submissions: submissionsWithoutProfiles }), 
          { 
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200 
          }
        );
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
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
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    );
  }
});