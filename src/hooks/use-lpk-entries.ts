import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { LPKEntry } from "@/lib/types";

export const useLpkEntries = (reportId: string | null) => {
    return useQuery<LPKEntry[], Error>({
        queryKey: ['lpkEntries', reportId],
        queryFn: async () => {
            if (!reportId) return [];

            const { data, error } = await supabase
                .from('lpk_entries')
                .select('*')
                .eq('report_id', reportId)
                .order('created_at', { ascending: true });

            if (error) {
                showError("Failed to load LPK entries.");
                console.error("Error fetching LPK entries:", error);
                throw error;
            }

            return data as LPKEntry[];
        },
        enabled: !!reportId,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};