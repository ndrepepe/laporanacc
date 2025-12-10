import { UserRole } from "./roles";

export type Profile = {
    id: string;
    first_name: string | null;
    last_name: string | null;
    role: UserRole | null;
};

// Base Report structure (common fields)
export type BaseReport = {
    id: string;
    user_id: string;
    report_date: string; // date string
    created_at: string; // timestamp
    profile: Profile; // Joined profile data
};

// LPK Entry Type
export type LPKEntry = {
    id: string;
    report_id: string;
    branch_name: string;
    lpk_count: number;
    created_at: string;
};

// Specific Report Types
export type AccountingReport = BaseReport & {
    type: 'accounting';
    new_customers_count: number;
    new_customers_names: string;
    new_sales_count: number;
    new_sales_names: string;
    worked_on_lph: boolean;
    customer_confirmation_status: 'Successful' | 'Failed';
};

export type CashierReport = BaseReport & {
    type: 'cashier';
    payments_count: number;
    total_payments: number;
    worked_on_lph: boolean;
    customer_confirmation_done: boolean;
};

export type ConsignmentStaffReport = BaseReport & {
    type: 'consignment_staff';
    received_lpk: boolean;
    lpk_entered_bsoft: number;
    tasks_completed: string;
    issues_encountered: string;
    suggestions: string | null;
    lpk_entries?: LPKEntry[]; // Add optional LPK entries
};

export type SupervisorManagerReport = BaseReport & {
    type: 'supervisor_manager';
    tasks_completed: string;
    issues_encountered: string;
    suggestions: string | null;
};

export type DailyReport = AccountingReport | CashierReport | ConsignmentStaffReport | SupervisorManagerReport;