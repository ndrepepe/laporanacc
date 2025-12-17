import { supabase } from "@/integrations/supabase/client";
import { DailyReport } from "@/lib/types";

/**
 * Logs an activity when a viewer accesses a report submitted by another user,
 * and sends a notification to the viewed user.
 * @param viewerId The ID of the user viewing the report (auth.uid()).
 * @param viewedUserId The ID of the user who submitted the report.
 * @param reportType The type of report being viewed.
 * @param reportId The ID of the specific report being viewed.
 */
export const logReportView = async (
    viewerId: string,
    viewedUserId: string,
    reportType: DailyReport['type'],
    reportId: string
) => {
    // Only log and notify if the viewer is not the submitter
    if (viewerId === viewedUserId) {
        return;
    }

    // 1. Log the activity
    const logPayload = {
        viewer_id: viewerId,
        viewed_user_id: viewedUserId,
        report_type: reportType,
        report_id: reportId, // Now tracking specific report ID
    };

    const { error: logError } = await supabase
        .from('activity_logs')
        .insert([logPayload]);

    if (logError) {
        console.error("Failed to log report view activity:", logError);
        // Continue even if logging fails
    }

    // 2. Send notification to the viewed user (report submitter)
    const { data: viewerProfile, error: profileError } = await supabase
        .from('profiles')
        .select('first_name, last_name, role')
        .eq('id', viewerId)
        .single();

    if (profileError) {
        console.error("Failed to fetch viewer profile for notification:", profileError);
        return;
    }

    const viewerName = `${viewerProfile.first_name || ''} ${viewerProfile.last_name || ''}`.trim() || viewerProfile.role;
    
    const notificationMessage = `${viewerName} (${viewerProfile.role}) viewed your ${reportType.replace('_', ' ')} report.`;

    const notificationPayload = {
        recipient_id: viewedUserId,
        sender_id: viewerId,
        type: 'report_view',
        message: notificationMessage,
        is_read: false,
    };

    const { error: notificationError } = await supabase
        .from('notifications')
        .insert([notificationPayload]);

    if (notificationError) {
        console.error("Failed to send report view notification:", notificationError);
    }
};