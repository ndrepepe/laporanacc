import * as z from "zod";

export const LPKEntrySchema = z.object({
    branch_name: z.string().min(1, "Branch name is required."),
    // Allow undefined in form state for empty input, but enforce min(1) if a value is provided and coerced.
    lpk_count: z.union([
        z.coerce.number().min(1, "LPK count must be at least 1."),
        z.undefined(),
    ]),
    // Include ID for editing existing entries
    id: z.string().optional(), 
});

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
});

export const ConsignmentStaffFormSchema = z.object({
    received_lpk: z.enum(["Yes", "No"], { required_error: "LPK reception status is required." }),
    lpk_entries: z.array(LPKEntrySchema).optional(),
    lpk_entered_bsoft: z.coerce.number().min(0, "Must be a non-negative number."),
    tasks_completed: z.string().min(10, "Tasks completed description is required."),
    issues_encountered: z.string().min(10, "Issues encountered description is required."),
    suggestions: z.string().optional(),
}).superRefine((data, ctx) => {
    if (data.received_lpk === "Yes") {
        if (!data.lpk_entries || data.lpk_entries.length === 0) {
            ctx.addIssue({
                code: z.ZodIssueCode.custom,
                message: "If LPK was received, at least one LPK entry is required.",
                path: ["received_lpk"],
            });
        }
    }
});

export const SupervisorManagerFormSchema = z.object({
    tasks_completed: z.string().min(10, "Tasks completed description is required."),
    issues_encountered: z.string().min(10, "Issues encountered description is required."),
    suggestions: z.string().optional(),
});