import * as z from "zod";

export const AccountingFormSchema = z.object({
  new_customers_count: z.coerce.number().min(0, "Must be a non-negative number."),
  new_customers_names: z.string().min(1, "Customer names are required."),
  new_sales_count: z.coerce.number().min(0, "Must be a non-negative number."),
  new_sales_names: z.string().min(1, "Sales names are required."),
  worked_on_lph: z.enum(["Yes", "No"], { required_error: "LPH status is required." }),
  customer_confirmation_status: z.enum(["Successful", "Failed"], { required_error: "Confirmation status is required." }),
});

export const CashierFormSchema = z.object({
  payments_count: z.coerce.number().min(0, "Must be a non-negative number."),
  total_payments: z.coerce.number().min(0.01, "Total payments must be greater than zero."),
  worked_on_lph: z.enum(["Yes", "No"], { required_error: "LPH status is required." }),
  customer_confirmation_done: z.enum(["Yes", "No"], { required_error: "Confirmation status is required." }),
  incentive_report_progress: z.string().optional(),
});

export const ConsignmentStaffFormSchema = z.object({
  lpk_entered_bsoft: z.coerce.number().min(0, "Must be a non-negative number."), // FIXED
  tasks_completed: z.string().min(1, "Tasks completed description is required."),
  issues_encountered: z.string().min(1, "Issues encountered description is required."),
  suggestions: z.string().optional(),
});

export const SupervisorManagerFormSchema = z.object({
  tasks_completed: z.string().min(1, "Tasks completed description is required."),
  issues_encountered: z.string().min(1, "Issues encountered description is required."),
  suggestions: z.string().optional(),
});