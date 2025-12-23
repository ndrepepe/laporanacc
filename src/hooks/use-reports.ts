import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { DailyReport, Profile, ReportFilters } from "@/lib/types";
import { REPORT_TABLE_MAP, VIEW_PERMISSIONS, ReportType } from "@/lib/report-constants";
import { UserRole } from "@/lib/roles";

type ReportScope = 'self' | 'subordinates';

// Helper function to fetch reports from a single table with optimized column selection
const fetchReportsFromTable = async (
    tableName: string, 
    reportType: ReportType, 
    userId: string, 
    scope: ReportScope,
    filters: ReportFilters
): Promise<DailyReport[]> => {
    
    // Define specific columns based on report type to reduce payload size
    let columns = 'id, user_id, report_date, created_at, accounting_manager_viewed_at, senior_manager_viewed_at';
    
    if (reportType === 'accounting') {
        columns += ', new_customers_count, new_customers_names, new_sales_count, new_sales_names, worked_on_lph, customer_confirmation_status';
    } else if (reportType === 'cashier') {
        columns += ', payments_count, total_payments, worked_on_lph, customer_confirmation_done, incentive_report_progress';
    } else if (reportType === 'consignment_staff') {
        columns += ', lpk_entered_bsoft, tasks_completed, issues_encountered, suggestions';
    } else if (reportType === 'supervisor_manager') {
        columns += ', tasks_completed, issues_encountered, suggestions';
    }

    let query = supabase
        .from(tableName)
        .select(`
            ${columns},
            profile:user_id (id, first_name, last_name, role, avatar_url)
        `);

    if (scope === 'self') {
        query = query.eq('user_id', userId);
    }
    
    if (scope === 'subordinates') {
        query = query.neq('user_id', userId);
    }

    if (filters.startDate) {
        query = query.gte('report_date', filters.startDate);
    }
    if (filters.endDate) {
        query = query.lte('report_date', filters.endDate);
    }

    if (filters.role && filters.role !== 'All') {
        query = query.eq('user_id.role', filters.role);
    }
    
    const { data, error } = await query.order('report_date', { ascending: false }).limit(100);

    if (error) {
        console.error(`Error fetching reports from ${tableName}:`, error);
        throw new Error(`Failed to fetch reports: ${error.message}`);
    }

    // Cast to any to avoid ParserError in complex template literal types
    return (data as any[]).map(item => ({
        ...item,
        type: reportType,
        profile: item.profile as Profile,
    })) as DailyReport[];
};

export const useDailyReports = (scope: ReportScope = 'self', filters: ReportFilters = {}) => {
    const { profile, user, isLoading: isAuthLoading } = useAuth();
    
    const viewerRole = profile?.role;
    const userId = user?.id;
    const enabled = !!viewerRole && !!userId && !isAuthLoading;

    return useQuery<DailyReport[], Error>({
        queryKey: ['dailyReports', viewerRole, scope, filters],
        queryFn: async () => {
            if (!viewerRole || !userId) return [];

            let allowedReportTypes: ReportType[] = [];

            if (scope === 'self') {
                switch (viewerRole as UserRole) {
                    case 'Accounting Staff': allowedReportTypes = ['accounting']; break;
                    case 'Cashier':
                    case 'Cashier-Insentif': allowedReportTypes = ['cashier']; break;
                    case 'Consignment Staff': allowedReportTypes = ['consignment_staff']; break;
                    case 'Consignment Supervisor':
                    case 'Accounting Manager':
                    case 'Senior Manager': allowedReportTypes = ['supervisor_manager']; break;
                    default: allowedReportTypes = [];
                }
            } else if (scope === 'subordinates') {
                allowedReportTypes = VIEW_PERMISSIONS[viewerRole as UserRole] || [];
            }

            if (allowedReportTypes.length === 0) return [];

            const results = await Promise.all(
                allowedReportTypes.map(type => 
                    fetchReportsFromTable(REPORT_TABLE_MAP[type], type, userId, scope, filters)
                )
            );
            
            return results.flat().sort((a, b) => 
                new Date(b.report_date).getTime() - new Date(a.report_date).getTime()
            );
        },
        enabled: enabled,
        staleTime: 1000 * 60 * 10, // Increased to 10 minutes
        gcTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
    });
};

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

    if (error) throw new Error(`Failed to fetch report: ${error.message}`);

    return {
        ...data,
        type: reportType,
        profile: data.profile as Profile,
    } as DailyReport;
};

export const useSingleReport = (reportId: string | null, reportType: ReportType | null) => {
    return useQuery<DailyReport | null, Error>({
        queryKey: ['singleReport', reportId, reportType],
        queryFn: () => fetchSingleReport(reportId!, reportType!),
        enabled: !!reportId && !!reportType,
        staleTime: 1000 * 60 * 5,
    });
};