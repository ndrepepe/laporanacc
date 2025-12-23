import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

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
    const { data, error } = await supabase.functions.invoke('fetch-summary', {
        method: 'GET',
    });

    if (error) {
        console.error("Error invoking Edge Function:", error);
        throw new Error(error.message);
    }

    if (data.error) throw new Error(data.error);

    return data as SummaryData;
};

export const useSummaryData = () => {
    return useQuery<SummaryData, Error>({
        queryKey: ['summaryData'],
        queryFn: fetchSummaryData,
        staleTime: 1000 * 60 * 30, // Increased to 30 minutes (stats don't change that fast)
        gcTime: 1000 * 60 * 60, // 1 hour
    });
};