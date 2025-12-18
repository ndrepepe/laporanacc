import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/lib/roles";
import { ReportType, REPORT_TABLE_MAP } from "@/lib/report-constants";

/**
 * Updates the specific manager view timestamp on a report when viewed by an authorized manager.
 * @param viewerRole The role of the user viewing the report.
 * @param reportId The ID of the report being viewed.
 * @param reportType The type of the report.
 */
export const updateReportViewStatus = async (
    viewerRole: UserRole,
    reportId: string,
    reportType: ReportType
) => {
    const tableName = REPORT_TABLE_MAP[reportType];
    let updateColumn: 'accounting_manager_viewed_at' | 'senior_manager_viewed_at' | null = null;

    if (viewerRole === 'Accounting Manager') {
        updateColumn = 'accounting_manager_viewed_at';
    } else if (viewerRole === 'Senior Manager') {
        updateColumn = 'senior_manager_viewed_at';
    }

    if (!updateColumn) {
        return; // Not a role that requires specific timestamp tracking
    }

    // Payload to update the specific column with the current timestamp
    const payload = {
        [updateColumn]: new Date().toISOString(),
    };

    try {
        // Only update if the column is currently NULL (first view by this role)
        // OR if we want to update the timestamp on every view (we'll update on every view for simplicity)
        const { error } = await supabase
            .from(tableName)
            .update(payload)
            .eq('id', reportId);

        if (error) {
            throw error;
        }
        
        // Note: We don't invalidate queries here; we rely on the modal's refetch logic.

    } catch (error) {
        console.error(`Failed to update view status for ${viewerRole} on report ${reportId}:`, error);
        // Safe-Fail: Do not show toast or break the app, just log the error.
    }
};