import { UserRole } from './roles';

export type ReportType = 'daily' | 'weekly' | 'monthly';

export const REPORT_TYPES_BY_ROLE: Record<UserRole, ReportType[]> = {
  'Accounting Staff': ['daily'],
  'Cashier': ['daily'],
  'Cashier-Insentif': ['daily'],
  'Consignment Staff': ['daily'],
  'Consignment Supervisor': ['daily', 'weekly'],
  'Accounting Manager': ['daily', 'weekly', 'monthly'],
  'Senior Manager': ['daily', 'weekly', 'monthly'],
};