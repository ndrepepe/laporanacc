import { supabase } from "@/integrations/supabase/client";
import { DailyReport } from "@/lib/types";
import { showError } from "./toast";

/**
 * Logs an activity when a viewer accesses a report submitted by another user.
 * @param viewerId The ID of the user viewing the report (auth.uid()).
 * @param viewedUserId The ID of the user who submitted the report.
 * @param reportType The type of report being viewed.
 */
export const logReportView = async (
    viewerId: string,
    viewedUserId: string,
    reportType: DailyReport['type']
) => {
    // Only log if the viewer is not the submitter
    if (viewerId === viewedUserId) {
        return;
    }

    const payload = {
        viewer_id: viewerId,
        viewed_user_id: viewedUserId,
        report_type: reportType,
    };

    const { error } = await supabase
        .from('activity_logs')
        .insert([payload]);

    if (error) {
        console.error("Failed to log report view activity:", error);
        // We don't show an error toast for logging failure, as it shouldn't block the user.
    }
};