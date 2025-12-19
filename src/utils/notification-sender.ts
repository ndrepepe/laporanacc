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