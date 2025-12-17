import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { showError } from "@/utils/toast";
import { Profile } from "@/lib/types";

export interface ReportViewLog {
    id: string;
    viewer_id: string;
    viewed_user_id: string;
    report_type: string;
    report_id: string;
    viewed_at: string;
    viewer_profile: Pick<Profile, 'first_name' | 'last_name' | 'role'>;
}

const fetchReportViewHistory = async (reportId: string): Promise<ReportViewLog[]> => {
    const { data, error } = await supabase
        .from('activity_logs')
        .select(`
            *,
            viewer_profile:viewer_id (first_name, last_name, role)
        `)
        .eq('report_id', reportId)
        .order('viewed_at', { ascending: false });

    if (error) {
        console.error("Error fetching report view history:", error);
        showError("Failed to load report view history.");
        throw error;
    }
    
    // Map data to ensure viewer_profile is correctly typed
    return data.map(log => ({
        ...log,
        viewer_profile: log.viewer_profile as Pick<Profile, 'first_name' | 'last_name' | 'role'>
    })) as ReportViewLog[];
};

export const useReportViewHistory = (reportId: string | null) => {
    return useQuery<ReportViewLog[], Error>({
        queryKey: ['reportViewHistory', reportId],
        queryFn: () => fetchReportViewHistory(reportId!),
        enabled: !!reportId,
        staleTime: 1000 * 60, // 1 minute
    });
};