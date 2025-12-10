import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { LPKEntry } from "@/lib/types";

const fetchLpkEntries = async (reportId: string): Promise<LPKEntry[]> => {
    const { data, error } = await supabase
        .from('lpk_entries')
        .select('*')
        .eq('report_id', reportId)
        .order('created_at', { ascending: true });

    if (error) {
        console.error("Error fetching LPK entries:", error);
        // Note: We don't show an error here, as it's a secondary data fetch.
        return [];
    }
    return data || [];
};

export const useLpkEntries = (reportId: string | null) => {
    return useQuery<LPKEntry[], Error>({
        queryKey: ['lpkEntries', reportId],
        queryFn: () => fetchLpkEntries(reportId!),
        enabled: !!reportId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};