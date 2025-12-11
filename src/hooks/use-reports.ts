import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { DailyReport, Profile } from "@/lib/types";
import { REPORT_TABLE_MAP, VIEW_PERMISSIONS, ReportType } from "@/lib/report-constants";
import { UserRole } from "@/lib/roles";

type ReportScope = 'self' | 'subordinates';

// Helper function to fetch reports from a single table
const fetchReportsFromTable = async (
    tableName: string, 
    reportType: ReportType, 
    userId: string, 
    scope: ReportScope
): Promise<DailyReport[]> => {
    
    let query = supabase
        .from(tableName)
        .select(`
            *,
            profile:user_id (id, first_name, last_name, role, avatar_url)
        `);

    if (scope === 'self') {
        // For 'self' scope, explicitly filter by user_id.
        query = query.eq('user_id', userId);
    }
    
    // For 'subordinates' scope, we rely on RLS to filter reports based on the viewer's role,
    // but we explicitly exclude the viewer's own reports to separate the views.
    if (scope === 'subordinates') {
        query = query.neq('user_id', userId);
    }

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

export const useDailyReports = (scope: ReportScope = 'self') => {
    const { profile, user, isLoading: isAuthLoading } = useAuth();
    
    const viewerRole = profile?.role;
    const userId = user?.id;
    const enabled = !!viewerRole && !!userId && !isAuthLoading;

    return useQuery<DailyReport[], Error>({
        queryKey: ['dailyReports', viewerRole, scope],
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
                return fetchReportsFromTable(tableName, type, userId, scope);
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