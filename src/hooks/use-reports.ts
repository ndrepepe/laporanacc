import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { VIEW_PERMISSIONS, UserRole } from "@/lib/roles";
import { REPORT_ROLE_MAP, REPORT_TABLE_MAP, ReportType } from "@/lib/report-constants";
import { DailyReport, Profile } from "@/lib/types";

// Helper function to fetch reports from a single table
const fetchReportsByTable = async (tableName: string, reportType: ReportType): Promise<DailyReport[]> => {
    // Fetch reports and join with profiles
    const { data, error } = await supabase
        .from(tableName)
        .select(`
            *,
            profile:user_id (id, first_name, last_name, role)
        `)
        .order('report_date', { ascending: false });

    if (error) {
        console.error(`Error fetching reports from ${tableName}:`, error);
        // Note: We don't show an error here, as one table failing shouldn't block others.
        return [];
    }

    // Map data to the unified DailyReport type
    return (data || []).map(item => ({
        ...item,
        type: reportType,
        profile: item.profile as Profile,
    })) as DailyReport[];
};

const fetchAllReportsForViewer = async (viewerRole: UserRole | null): Promise<DailyReport[]> => {
    if (!viewerRole) return [];

    const rolesToView = VIEW_PERMISSIONS[viewerRole];
    if (!rolesToView || rolesToView.length === 0) return [];

    const reportsPromises: Promise<DailyReport[]>[] = [];
    const fetchedReportTypes = new Set<ReportType>();

    for (const submitterRole of rolesToView) {
        const reportType = REPORT_ROLE_MAP[submitterRole];
        
        if (reportType && !fetchedReportTypes.has(reportType)) {
            const tableName = REPORT_TABLE_MAP[reportType];
            reportsPromises.push(fetchReportsByTable(tableName, reportType));
            fetchedReportTypes.add(reportType);
        }
    }

    const results = await Promise.all(reportsPromises);
    
    // Flatten the array of arrays and sort by date (most recent first)
    const allReports = results.flat();
    
    allReports.sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime());

    return allReports;
};

export const useDailyReports = () => {
    const { profile, isLoading: isAuthLoading } = useAuth();
    const viewerRole = profile?.role as UserRole | null;

    return useQuery<DailyReport[], Error>({
        queryKey: ['dailyReports', viewerRole],
        queryFn: () => fetchAllReportsForViewer(viewerRole),
        enabled: !isAuthLoading && !!viewerRole,
        staleTime: 1000 * 60, // 1 minute
    });
};