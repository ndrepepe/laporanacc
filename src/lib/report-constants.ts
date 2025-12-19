import { UserRole } from './roles';

export type ReportType = 'accounting' | 'cashier' | 'consignment_staff' | 'supervisor_manager';

export const REPORT_TABLE_MAP: Record<ReportType, string> = {
  'accounting': 'reports_accounting',
  'cashier': 'reports_cashier',
  'consignment_staff': 'reports_consignment_staff',
  'supervisor_manager': 'reports_supervisor_manager',
};

export const VIEW_PERMISSIONS: Record<UserRole, ReportType[]> = {
  'Accounting Staff': [],
  'Cashier': [],
  'Cashier-Insentif': [],
  'Consignment Staff': [],
  'Consignment Supervisor': ['consignment_staff'],
  'Accounting Manager': ['accounting', 'cashier', 'consignment_staff', 'supervisor_manager'],
  'Senior Manager': ['accounting', 'cashier', 'consignment_staff', 'supervisor_manager'],
};