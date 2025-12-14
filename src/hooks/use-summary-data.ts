import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";

export interface DailyMetric {
    date: string;
    total_new_customers: number;
    total_new_sales: number;
    total_payments_count: number;
    total_payments_amount: number;
    total_lpk_entered: number;
}

export interface MonthlyMetric {
    total_new_customers: number;
    total_new_sales: number;
    total_payments_count: number;
    total_payments_amount: number;
    total_lpk_entered: number;
}

export interface SummaryData {
    daily: DailyMetric[];
    monthly: MonthlyMetric;
}

const fetchSummaryData = async (): Promise<SummaryData> => {
    // Project ID: madymngifviixpttjpvp
    // const functionUrl = "https://madymngifviixpttjpvp.supabase.co/functions/v1/fetch-summary"; // Removed unused variable

    const { data, error } = await supabase.functions.invoke('fetch-summary', {
        method: 'GET',
        // We don't need to pass the JWT token since the function uses the Service Role Key internally
    });

    if (error) {
        console.error("Error invoking Edge Function:", error);
        showError("Failed to load summary data.");
        throw new Error(error.message);
    }

    if (data.error) {
        console.error("Edge Function returned error:", data.error);
        showError("Failed to process summary data on the server.");
        throw new Error(data.error);
    }

    return data as SummaryData;
};

export const useSummaryData = () => {
    return useQuery<SummaryData, Error>({
        queryKey: ['summaryData'],
        queryFn: fetchSummaryData,
        staleTime: 1000 * 60 * 15, // 15 minutes
    });
};