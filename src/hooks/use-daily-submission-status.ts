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
    if (!date) return [];
    
    // Project ID: madymngifviixpttjpvp
    // const functionUrl = `https://madymngifviixpttjpvp.supabase.co/functions/v1/daily-submission-status?date=${date}`; // Removed unused variable

    const { data, error } = await supabase.functions.invoke('daily-submission-status', {
        method: 'GET',
        headers: {
            // Pass the date via query parameter, not body
        },
        // Note: We rely on the Edge Function using the Service Role Key internally
    });

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

    return data.submissions as DailySubmission[];
};

export const useDailySubmissionStatus = (date: string | null) => {
    return useQuery<DailySubmission[], Error>({
        queryKey: ['dailySubmissionStatus', date],
        queryFn: () => fetchDailySubmissionStatus(date!),
        enabled: !!date,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};