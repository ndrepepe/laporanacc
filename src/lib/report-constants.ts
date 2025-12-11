import { UserRole } from "./roles";

export type ReportType = 'accounting' | 'cashier' | 'consignment_staff' | 'supervisor_manager';

export const REPORT_TABLE_MAP: Record<ReportType, string> = {
    accounting: 'reports_accounting',
    cashier: 'reports_cashier',
    consignment_staff: 'reports_consignment_staff',
    supervisor_manager: 'reports_supervisor_manager',
};

// Defines which report types a specific role is allowed to view (for subordinate reports)
export const VIEW_PERMISSIONS: Record<UserRole, ReportType[]> = {
    'Accounting Staff': [],
    'Cashier': [],
    'Consignment Staff': [],
    
    'Consignment Supervisor': ['consignment_staff', 'supervisor_manager'],
    'Accounting Manager': ['accounting', 'cashier', 'supervisor_manager'],
    'Senior Manager': ['accounting', 'cashier', 'consignment_staff', 'supervisor_manager'],
};