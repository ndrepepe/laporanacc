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
        
        const { data, error } = await supabase.functions.invoke('daily-submission-status', {
            method: 'GET',
            // Pass the date as a query parameter
            body: { date: formattedDate }
        });

        // Log response for debugging
        console.log("Edge function response:", data, error);

        if (error) {
            console.error("Error invoking Edge Function:", error);
            showError("Failed to load submission status.");
            throw new Error(error.message);
        }

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