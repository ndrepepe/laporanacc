import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/Button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { REPORT_TABLE_MAP } from "@/lib/report-constants";
import { useQueryClient } from "@tanstack/react-query";
import { AccountingReport, DailyReport } from "@/lib/types";
import { AccountingFormSchema } from "@/lib/report-schemas";

type AccountingFormValues = z.infer<typeof AccountingFormSchema>;

interface ReportEditAccountingProps {
    report: DailyReport & AccountingReport;
    onSuccess: () => void;
}

const ReportEditAccounting: React.FC<ReportEditAccountingProps> = ({ report, onSuccess }) => {
  const queryClient = useQueryClient();
  
  const defaultValues: AccountingFormValues = {
    new_customers_count: report.new_customers_count,
    new_customers_names: report.new_customers_names,
    new_sales_count: report.new_sales_count,
    new_sales_names: report.new_sales_names,
    worked_on_lph: report.worked_on_lph ? "Yes" : "No",
    customer_confirmation_status: report.customer_confirmation_status,
  };

  const form = useForm<AccountingFormValues>({
    resolver: zodResolver(AccountingFormSchema),
    defaultValues,
  });

  const onSubmit = async (values: AccountingFormValues) => {
    const payload = {
      new_customers_count: values.new_customers_count,
      new_customers_names: values.new_customers_names,
      new_sales_count: values.new_sales_count,
      new_sales_names: values.new_sales_names,
      worked_on_lph: values.worked_on_lph === "Yes",
      customer_confirmation_status: values.customer_confirmation_status,
    };

    const { error } = await supabase
      .from(REPORT_TABLE_MAP.accounting)
      .update(payload)
      .eq('id', report.id);

    if (error) {
      console.error("Update error:", error);
      showError("Failed to update report.");
    } else {
      showSuccess("Accounting Report updated successfully!");
      
      // Invalidate queries to refresh the list and the single report view
      queryClient.invalidateQueries({ queryKey: ['dailyReports'] });
      queryClient.invalidateQueries({ queryKey: ['singleReport', report.id] });
      onSuccess();
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

        <Button type="submit" variant="gradient">Save Changes</Button>
      </form>
    </Form>
  );
};

export default ReportEditAccounting;