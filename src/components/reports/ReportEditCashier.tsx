import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/Button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { REPORT_TABLE_MAP } from "@/lib/report-constants";
import { useQueryClient } from "@tanstack/react-query";
import { CashierReport, DailyReport } from "@/lib/types";
import { CashierFormSchema } from "@/lib/report-schemas";
import { Textarea } from "@/components/ui/textarea";
import { useLanguage } from "@/contexts/LanguageContext";

type CashierFormValues = z.infer<typeof CashierFormSchema>;

interface ReportEditCashierProps {
    report: DailyReport & CashierReport;
    onSuccess: () => void;
}

const ReportEditCashier: React.FC<ReportEditCashierProps> = ({ report, onSuccess }) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  
  // Determine if the report being edited belongs to a Kasir-Insentif user
  const isKasirInsentifReport = report.profile?.role === 'Kasir-Insentif';

  const defaultValues: CashierFormValues = {
    payments_count: report.payments_count,
    total_payments: report.total_payments,
    worked_on_lph: report.worked_on_lph ? "Yes" : "No",
    customer_confirmation_done: report.customer_confirmation_done ? "Yes" : "No",
    incentive_report_progress: report.incentive_report_progress || "", // Initialize new field
  };

  const form = useForm<CashierFormValues>({
    resolver: zodResolver(CashierFormSchema),
    defaultValues,
  });

  const onSubmit = async (values: CashierFormValues) => {
    
    // Validation check for Kasir-Insentif specific field during edit
    if (isKasirInsentifReport && !values.incentive_report_progress?.trim()) {
        form.setError('incentive_report_progress', {
            type: 'manual',
            message: t('incentive_report_progress_required'),
        });
        showError(t('incentive_report_progress_required'));
        return;
    }
    
    const payload = {
      payments_count: values.payments_count,
      total_payments: values.total_payments,
      worked_on_lph: values.worked_on_lph === "Yes",
      customer_confirmation_done: values.customer_confirmation_done === "Yes",
      incentive_report_progress: isKasirInsentifReport ? values.incentive_report_progress || null : null,
    };

    const { error } = await supabase
      .from(REPORT_TABLE_MAP.cashier)
      .update(payload)
      .eq('id', report.id);

    if (error) {
      console.error("Update error:", error);
      showError("Failed to update report.");
    } else {
      showSuccess("Cashier Report updated successfully!");
      
      // Invalidate queries to refresh the list and the single report view
      queryClient.invalidateQueries({ queryKey: ['dailyReports'] });
      queryClient.invalidateQueries({ queryKey: ['singleReport', report.id] });
      onSuccess();
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <FormField
          control={form.control}
          name="payments_count"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of Customers Who Made Payment Today</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(e.target.value === "" ? 0 : parseInt(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="total_payments"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Total Amount of Today’s Payments (IDR)</FormLabel>
              <FormControl>
                <Input type="number" step="0.01" {...field} onChange={e => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))} />
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
          name="customer_confirmation_done"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Customer Confirmation Done?</FormLabel>
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
        
        {/* Conditional Field for Kasir-Insentif */}
        {isKasirInsentifReport && (
            <FormField
              control={form.control}
              name="incentive_report_progress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-primary font-bold">{t('incentive_report_progress_label')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t('describe_incentive_progress')}
                      {...field}
                      rows={5}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
        )}

        <Button type="submit" variant="gradient">Save Changes</Button>
      </form>
    </Form>
  );
};

export default ReportEditCashier;