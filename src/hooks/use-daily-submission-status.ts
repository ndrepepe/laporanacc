import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { ReportType } from "@/lib/report-constants";

export interface DailySubmission {
    user_id: string;
    name: string;
    role: string;
    report_types: ReportType[];
}

const fetchDailySubmissionStatus = async (date: string): Promise<DailySubmission[]> => {
    if (!date) {
        throw new Error('Date parameter is required');
    }

    try {
        // Ensure the date is in the correct format (YYYY-MM-DD)
        const formattedDate = new Date(date).toISOString().split('T')[0];
        
        // Use fetch directly to call the Edge Function with query parameters
        // This is more reliable than using supabase.functions.invoke for query parameters
        const functionUrl = `https://madymngifviixpttjpvp.supabase.co/functions/v1/daily-submission-status?date=${formattedDate}`;
        
        // Get the access token for authenticated requests
        const { data: { session } } = await supabase.auth.getSession();
        const token = session?.access_token;
        
        const response = await fetch(functionUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY || '', // Fallback to anon key
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error("Edge Function HTTP Error:", response.status, errorText);
            throw new Error(`Edge Function returned status ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        
        // Log response for debugging
        console.log("Edge function response:", data);

        if (data.error) {
            console.error("Edge Function returned error:", data.error);
            showError("Failed to process submission status on the server.");
            throw new Error(data.error);
        }

        return data.submissions || [];
    } catch (err: unknown) {
        console.error("Error in fetchDailySubmissionStatus:", err);
        const errorMessage = (err as Error).message || 'Unknown error occurred';
        showError(`Failed to fetch submission status: ${errorMessage}`);
        throw err;
    }
};

export const useDailySubmissionStatus = (date: string | null) => {
    return useQuery<DailySubmission[], Error>({
        queryKey: ['dailySubmissionStatus', date],
        queryFn: () => {
            if (!date) throw new Error('Date is required');
            return fetchDailySubmissionStatus(date);
        },
        enabled: !!date,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};