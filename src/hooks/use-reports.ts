import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { DailyReport, Profile } from "@/lib/types";
import { REPORT_TABLE_MAP, VIEW_PERMISSIONS, ReportType } from "@/lib/report-constants";

// Helper function to fetch reports from a single table
const fetchReportsFromTable = async (tableName: string, reportType: ReportType): Promise<DailyReport[]> => {
    // Crucially, we join the profile data here. RLS ensures only authorized reports are returned.
    const { data, error } = await supabase
        .from(tableName)
        .select(`
            *,
            profile:user_id (id, first_name, last_name, role, avatar_url)
        `)
        .order('report_date', { ascending: false });

    if (error) {
        console.error(`Error fetching reports from ${tableName}:`, error);
        // Throwing an error here allows React Query to handle the error state
        throw new Error(`Failed to fetch reports from ${tableName}`);
    }

    // Map the raw data to the DailyReport type, ensuring the profile structure is correct
    return data.map(item => ({
        ...item,
        type: reportType,
        profile: item.profile as Profile, // Cast the joined profile data
    })) as DailyReport[];
};

export const useDailyReports = () => {
    const { profile, isLoading: isAuthLoading } = useAuth();
    
    const viewerRole = profile?.role;
    const enabled = !!viewerRole && !isAuthLoading;

    return useQuery<DailyReport[], Error>({
        queryKey: ['dailyReports', viewerRole],
        queryFn: async () => {
            if (!viewerRole) return [];

            const allowedReportTypes = VIEW_PERMISSIONS[viewerRole];
            if (!allowedReportTypes || allowedReportTypes.length === 0) {
                return [];
            }

            const fetchPromises = allowedReportTypes.map(type => {
                const tableName = REPORT_TABLE_MAP[type];
                return fetchReportsFromTable(tableName, type);
            });

            const results = await Promise.all(fetchPromises);
            
            // Flatten the results from all tables into a single array
            const allReports = results.flat();

            // Sort all reports by report date descending
            allReports.sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime());

            return allReports;
        },
        enabled: enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};