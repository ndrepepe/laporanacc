import { UserRole } from "./roles";
import { ReportType } from "./report-constants";

// New type for LPK entries (Fixes Error 2)
export interface LPKEntry {
  id: string;
  report_id: string;
  branch_name: string;
  lpk_count: number;
  created_at: string;
}

export interface Profile {
  id: string;
  first_name: string | null;
  last_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  updated_at: string | null;
}

// Base structure for all reports
interface BaseReport {
  id: string;
  user_id: string;
  report_date: string; // date string
  created_at: string;
  profile: Profile;
  type: ReportType;
  // New fields for manager view tracking
  accounting_manager_viewed_at: string | null;
  senior_manager_viewed_at: string | null;
}

// Specific report interfaces
export interface AccountingReport {
  new_customers_count: number;
  new_customers_names: string; // Added for Error 3
  new_sales_count: number;
  new_sales_names: string; // Added for Error 4
  worked_on_lph: boolean; // Added for Error 5
  customer_confirmation_status: "Successful" | "Failed"; // FIX 1
}

export interface CashierReport {
  payments_count: number;
  total_payments: number;
  worked_on_lph: boolean; // Added for Error 5
  customer_confirmation_done: boolean;
  incentive_report_progress: string | null; // NEW FIELD
}

export interface ConsignmentStaffReport {
  lpk_count: number;
  tasks_completed: string;
  issues_encountered: string;
  suggestions: string | null;
}

export interface SupervisorManagerReport {
  tasks_completed: string;
  issues_encountered: string;
  suggestions: string | null;
}

// Union type for DailyReport
export type DailyReport = BaseReport & (
  | AccountingReport
  | CashierReport
  | ConsignmentStaffReport
  | SupervisorManagerReport
);

// New type for report filters
export interface ReportFilters {
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  role?: UserRole | 'All';
  employeeName?: string;
  branchId?: string;
}