import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { showSuccess, showError } from "@/utils/toast";
import { REPORT_TABLE_MAP } from "@/lib/report-constants";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  new_customers_count: z.coerce.number().min(0, "Must be a non-negative number."),
  new_customers_names: z.string().min(1, "Customer names are required."),
  new_sales_count: z.coerce.number().min(0, "Must be a non-negative number."),
  new_sales_names: z.string().min(1, "Sales names are required."),
  worked_on_lph: z.enum(["Yes", "No"], { required_error: "LPH status is required." }),
  customer_confirmation_status: z.enum(["Successful", "Failed"], { required_error: "Confirmation status is required." }),
});

type AccountingFormValues = z.infer<typeof formSchema>;

const ReportFormAccounting = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const form = useForm<AccountingFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      new_customers_count: 0,
      new_customers_names: "",
      new_sales_count: 0,
      new_sales_names: "",
      worked_on_lph: "No",
      customer_confirmation_status: "Successful",
    },
  });

  const onSubmit = async (values: AccountingFormValues) => {
    if (!user) {
      showError("User not authenticated.");
      return;
    }

    const payload = {
      user_id: user.id,
      new_customers_count: values.new_customers_count,
      new_customers_names: values.new_customers_names,
      new_sales_count: values.new_sales_count,
      new_sales_names: values.new_sales_names,
      worked_on_lph: values.worked_on_lph === "Yes",
      customer_confirmation_status: values.customer_confirmation_status,
    };

    const { error } = await supabase
      .from(REPORT_TABLE_MAP.accounting)
      .insert([payload]);

    if (error) {
      console.error("Submission error:", error);
      showError("Failed to submit report. You may have already submitted a report for today.");
    } else {
      showSuccess("Accounting Report submitted successfully!");
      form.reset();
      // Invalidate the dailyReports query to refresh the view
      queryClient.invalidateQueries({ queryKey: ['dailyReports'] });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="new_customers_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of New Customers Entered</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(e.target.value === "" ? 0 : parseInt(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="new_sales_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Number of New Sales Entered</FormLabel>
                <FormControl>
                  <Input type="number" {...field} onChange={e => field.onChange(e.target.value === "" ? 0 : parseInt(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="new_customers_names"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Customer Names (List them)</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., John Doe, Jane Smith" {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="new_sales_names"
          render={({ field }) => (
            <FormItem>
              <FormLabel>New Sales Names (List them)</FormLabel>
              <FormControl>
                <Textarea placeholder="e.g., Sale A, Sale B" {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="worked_on_lph"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Did you work on LPH today?</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Yes" />
                    </FormControl>
                    <FormLabel className="font-normal">Yes</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="No" />
                    </FormControl>
                    <FormLabel className="font-normal">No</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="customer_confirmation_status"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Customer Confirmation Status</FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Successful" />
                    </FormControl>
                    <FormLabel className="font-normal">Successful</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="Failed" />
                    </FormControl>
                    <FormLabel className="font-normal">Failed</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit Accounting Report</Button>
      </form>
    </Form>
  );
};

export default ReportFormAccounting;