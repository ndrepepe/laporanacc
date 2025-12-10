import { UserRole } from "./roles";

export type ReportType = 'accounting' | 'cashier' | 'consignment_staff' | 'supervisor_manager';

export const REPORT_ROLE_MAP: Record<UserRole, ReportType | null> = {
    'Accounting Staff': 'accounting',
    'Cashier': 'cashier',
    'Consignment Staff': 'consignment_staff',
    'Consignment Supervisor': 'supervisor_manager',
    'Accounting Manager': 'supervisor_manager',
    'Senior Manager': null, // View only
};

export const REPORT_TABLE_MAP: Record<ReportType, string> = {
    'accounting': 'reports_accounting',
    'cashier': 'reports_cashier',
    'consignment_staff': 'reports_consignment_staff',
    'supervisor_manager': 'reports_supervisor_manager',
};