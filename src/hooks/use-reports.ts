import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { DailyReport, Profile, ReportFilters } from "@/lib/types";
import { REPORT_TABLE_MAP, VIEW_PERMISSIONS, ReportType } from "@/lib/report-constants";
import { UserRole } from "@/lib/roles";

type ReportScope = 'self' | 'subordinates';

// Helper function to fetch reports from a single table
const fetchReportsFromTable = async (
    tableName: string, 
    reportType: ReportType, 
    userId: string, 
    scope: ReportScope,
    filters: ReportFilters
): Promise<DailyReport[]> => {
    
    let query = supabase
        .from(tableName)
        .select(`
            *,
            profile:user_id (id, first_name, last_name, role, avatar_url)
        `);

    // 1. Scope Filtering (RLS handles most of 'subordinates', but we refine here)
    if (scope === 'self') {
        // For 'self' scope, explicitly filter by user_id.
        query = query.eq('user_id', userId);
    }
    
    // For 'subordinates' scope, we rely on RLS to filter reports based on the viewer's role,
    // but we explicitly exclude the viewer's own reports to separate the views.
    if (scope === 'subordinates') {
        query = query.neq('user_id', userId);
    }

    // 2. Apply Date Filters
    if (filters.startDate) {
        query = query.gte('report_date', filters.startDate);
    }
    if (filters.endDate) {
        query = query.lte('report_date', filters.endDate);
    }

    // 3. Apply Role Filter (Filtering on the joined profile table)
    if (filters.role && filters.role !== 'All') {
        // Filter on the joined profile table using the relationship name (user_id)
        query = query.eq('user_id.role', filters.role);
    }
    
    // Note: Employee Name filtering is handled client-side in the component for simplicity 
    // due to complex OR logic required for first_name/last_name filtering in PostgREST queries.

    const { data, error } = await query.order('report_date', { ascending: false });

    if (error) {
        console.error(`Error fetching reports from ${tableName} (Scope: ${scope}):`, error);
        throw new Error(`Failed to fetch reports from ${tableName}: ${error.message}`);
    }

    // Map the raw data to the DailyReport type, ensuring the profile structure is correct
    return data.map(item => ({
        ...item,
        type: reportType,
        profile: item.profile as Profile, // Cast the joined profile data
    })) as DailyReport[];
};

export const useDailyReports = (scope: ReportScope = 'self', filters: ReportFilters = {}) => {
    const { profile, user, isLoading: isAuthLoading } = useAuth();
    
    const viewerRole = profile?.role;
    const userId = user?.id;
    const enabled = !!viewerRole && !!userId && !isAuthLoading;

    // Include filters in queryKey to ensure refetching when filters change
    return useQuery<DailyReport[], Error>({
        queryKey: ['dailyReports', viewerRole, scope, filters],
        queryFn: async () => {
            if (!viewerRole || !userId) return [];

            let allowedReportTypes: ReportType[] = [];

            if (scope === 'self') {
                // For 'self' scope, only fetch reports corresponding to the user's own role type
                switch (viewerRole as UserRole) {
                    case 'Accounting Staff':
                        allowedReportTypes = ['accounting'];
                        break;
                    case 'Cashier':
                        allowedReportTypes = ['cashier'];
                        break;
                    case 'Consignment Staff':
                        allowedReportTypes = ['consignment_staff'];
                        break;
                    case 'Consignment Supervisor':
                    case 'Accounting Manager':
                    case 'Senior Manager':
                        allowedReportTypes = ['supervisor_manager'];
                        break;
                    default:
                        allowedReportTypes = [];
                }
                
            } else if (scope === 'subordinates') {
                // For 'subordinates' scope, use the defined VIEW_PERMISSIONS
                allowedReportTypes = VIEW_PERMISSIONS[viewerRole as UserRole].filter(type => {
                    // Exclude the manager's own report type from the subordinate view
                    return true; 
                });
            }

            if (allowedReportTypes.length === 0) {
                return [];
            }

            const fetchPromises = allowedReportTypes.map(type => {
                const tableName = REPORT_TABLE_MAP[type];
                return fetchReportsFromTable(tableName, type, userId, scope, filters);
            });

            const results = await Promise.all(fetchPromises);
            
            const allReports = results.flat();

            // Sort all reports by report date descending
            allReports.sort((a, b) => new Date(b.report_date).getTime() - new Date(a.report_date).getTime());

            return allReports;
        },
        enabled: enabled,
        staleTime: 1000 * 60 * 5, // 5 minutes
    });
};

// New function to fetch a single report by ID and type
export const fetchSingleReport = async (reportId: string, reportType: ReportType): Promise<DailyReport | null> => {
    const tableName = REPORT_TABLE_MAP[reportType];
    
    const { data, error } = await supabase
        .from(tableName)
        .select(`
            *,
            profile:user_id (id, first_name, last_name, role, avatar_url)
        `)
        .eq('id', reportId)
        .single();

    if (error) {
        console.error(`Error fetching single report from ${tableName}:`, error);
        throw new Error(`Failed to fetch report: ${error.message}`);
    }

    if (!data) return null;

    return {
        ...data,
        type: reportType,
        profile: data.profile as Profile,
    } as DailyReport;
};

// New hook to use the single report fetcher
export const useSingleReport = (reportId: string | null, reportType: ReportType | null) => {
    const enabled = !!reportId && !!reportType;
    
    return useQuery<DailyReport | null, Error>({
        queryKey: ['singleReport', reportId, reportType],
        queryFn: () => fetchSingleReport(reportId!, reportType!),
        enabled: enabled,
        staleTime: 0, // Always refetch when opened
    });
};