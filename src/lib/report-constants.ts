import { UserRole } from './roles';

export type ReportType = 'daily' | 'weekly' | 'monthly';

export const REPORT_TABLE_MAP: Record<string, string> = {
  'accounting': 'reports_accounting',
  'cashier': 'reports_cashier',
  'consignment_staff': 'reports_consignment_staff',
  'supervisor_manager': 'reports_supervisor_manager',
};

export const VIEW_PERMISSIONS: Record<UserRole, string[]> = {
  'Accounting Staff': [],
  'Cashier': [],
  'Cashier-Insentif': [],
  'Consignment Staff': [],
  'Consignment Supervisor': ['consignment_staff'],
  'Accounting Manager': ['accounting', 'cashier', 'consignment_staff', 'supervisor_manager'],
  'Senior Manager': ['accounting', 'cashier', 'consignment_staff', 'supervisor_manager'],
};