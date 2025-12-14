import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/lib/roles";
import { ReportType } from "@/lib/report-constants";
import { showError } from "./toast";

// Define which roles supervise which staff roles
const SUPERVISOR_MAP: Record<UserRole, UserRole[]> = {
    'Accounting Staff': ['Accounting Manager', 'Senior Manager'],
    'Cashier': ['Accounting Manager', 'Senior Manager'],
    'Consignment Staff': ['Consignment Supervisor', 'Senior Manager'],
    
    // Managers/Supervisors report up to Senior Manager
    'Consignment Supervisor': ['Senior Manager'],
    'Accounting Manager': ['Senior Manager'],
    
    // Senior Manager reports to no one in this system context
    'Senior Manager': [], 
};

/**
 * Sends a notification to relevant supervisors/managers when a report is submitted.
 * @param senderId The ID of the user who submitted the report.
 * @param senderRole The role of the user who submitted the report.
 * @param reportType The type of report submitted.
 */
export const sendReportSubmissionNotification = async (
    senderId: string,
    senderRole: UserRole,
    reportType: ReportType
) => {
    const targetRoles = SUPERVISOR_MAP[senderRole];

    if (!targetRoles || targetRoles.length === 0) {
        return; // No supervisors to notify
    }

    // 1. Find all users whose role matches the target roles
    const { data: recipients, error: recipientError } = await supabase
        .from('profiles')
        .select('id')
        .in('role', targetRoles);

    if (recipientError) {
        console.error("Error finding notification recipients:", recipientError);
        // We don't show an error toast for notification failure, as it shouldn't block the user.
        return;
    }

    if (!recipients || recipients.length === 0) {
        console.warn(`No users found for roles: ${targetRoles.join(', ')}`);
        return;
    }

    // 2. Prepare notification payloads
    const message = `${senderRole} submitted a new ${reportType.replace('_', ' ')} report today.`;
    
    const notificationPayloads = recipients.map(recipient => ({
        recipient_id: recipient.id,
        sender_id: senderId,
        type: 'report_submission',
        message: message,
        is_read: false,
    }));

    // 3. Insert notifications
    const { error: insertError } = await supabase
        .from('notifications')
        .insert(notificationPayloads);

    if (insertError) {
        console.error("Error inserting notifications:", insertError);
    }
};