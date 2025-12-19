import { UserRole } from '../lib/roles';

export const NOTIFICATION_RECIPIENTS: Record<UserRole, UserRole[]> = {
  'Accounting Staff': ['Accounting Manager', 'Senior Manager'],
  'Cashier': ['Accounting Manager', 'Senior Manager'],
  'Cashier-Insentif': ['Accounting Manager', 'Senior Manager'],
  'Consignment Staff': ['Consignment Supervisor', 'Senior Manager'],
  'Consignment Supervisor': ['Accounting Manager', 'Senior Manager'],
  'Accounting Manager': ['Senior Manager'],
  'Senior Manager': [],
};

export const sendReportSubmissionNotification = async (
  userId: string,
  userRole: UserRole,
  reportType: string
) => {
  // Implementasi notifikasi akan ditambahkan di sini
  console.log(`Sending notification for ${reportType} report from user ${userId} with role ${userRole}`);
};