import { ReportType, UserRole } from "./report-constants";

export interface Profile {
    id: string;
    first_name: string;
    last_name: string;
    role: UserRole;
    avatar_url: string | null;
}

// Base structure for all reports
interface BaseReport {
    id: string;
    user_id: string;
    report_date: string; // date string
    created_at: string; // timestamp
    profile: Profile; // Joined profile data
}

// Specific report types
export interface AccountingReport extends BaseReport {
    type: 'accounting';
    new_customers_count: number;
    new_customers_names: string;
    new_sales_count: number;
    new_sales_names: string;
    worked_on_lph: boolean;
    customer_confirmation_status: 'Successful' | 'Failed';
}

export interface CashierReport extends BaseReport {
    type: 'cashier';
    payments_count: number;
    total_payments: number;
    worked_on_lph: boolean;
    customer_confirmation_done: boolean;
}

export interface ConsignmentStaffReport extends BaseReport {
    type: 'consignment_staff';
    received_lpk: boolean;
    lpk_entered_bsoft: number;
    tasks_completed: string;
    issues_encountered: string;
    suggestions: string | null;
}

export interface SupervisorManagerReport extends BaseReport {
    type: 'supervisor_manager';
    tasks_completed: string;
    issues_encountered: string;
    suggestions: string | null;
}

export interface LPKEntry {
    id: string;
    report_id: string;
    branch_name: string;
    lpk_count: number;
    created_at: string;
}

export type DailyReport = AccountingReport | CashierReport | ConsignmentStaffReport | SupervisorManagerReport;