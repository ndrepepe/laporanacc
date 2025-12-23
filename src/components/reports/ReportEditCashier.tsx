"use client";

import React from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/Button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { REPORT_TABLE_MAP } from "@/lib/report-constants";
import { useQueryClient } from "@tanstack/react-query";
import { CashierReport, DailyReport } from "@/lib/types";
import { CashierFormSchema } from "@/lib/report-schemas";
import { useLanguage } from "@/contexts/LanguageContext";

type CashierFormValues = z.infer<typeof CashierFormSchema>;

interface ReportEditCashierProps {
    report: DailyReport & CashierReport;
    onSuccess: () => void;
}

const ReportEditCashier: React.FC<ReportEditCashierProps> = ({ report, onSuccess }) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  
  const isKasirInsentifReport = report.incentive_report_progress !== undefined && report.incentive_report_progress !== null;

  const defaultValues: CashierFormValues = {
    payments_count: report.payments_count,
    total_payments: report.total_payments,
    worked_on_lph: report.worked_on_lph ? "Yes" : "No",
    customer_confirmation_done: report.customer_confirmation_done ? "Yes" : "No",
    incentive_report_progress: report.incentive_report_progress || "",
  };

  const form = useForm<CashierFormValues>({
    resolver: zodResolver(CashierFormSchema),
    defaultValues,
  });

  const onSubmit = async (values: CashierFormValues) => {
    const payload = {
      payments_count: values.payments_count,
      total_payments: values.total_payments,
      worked_on_lph: values.worked_on_lph === "Yes",
      customer_confirmation_done: values.customer_confirmation_done === "Yes",
      incentive_report_progress: isKasirInsentifReport ? values.incentive_report_progress : null,
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
      
      // Invalidate queries
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
            name="payments_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('payments_count_label')}</FormLabel>
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
                <FormLabel>{t('total_payments_label')}</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" {...field} onChange={e => field.onChange(e.target.value === "" ? 0 : parseFloat(e.target.value))} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {isKasirInsentifReport && (
          <FormField
            control={form.control}
            name="incentive_report_progress"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('incentive_report_progress_label')}</FormLabel>
                <FormControl>
                  <Textarea placeholder={t('describe_incentive_progress')} {...field} rows={3} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="worked_on_lph"
            render={({ field }) => (
              <FormItem className="space-y-3">
                <FormLabel>{t('worked_on_lph_label')}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl><RadioGroupItem value="Yes" /></FormControl>
                      <FormLabel className="font-normal">{t('yes')}</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl><RadioGroupItem value="No" /></FormControl>
                      <FormLabel className="font-normal">{t('no')}</FormLabel>
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
                <FormLabel>{t('customer_confirmation_done_label')}</FormLabel>
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    className="flex space-x-4"
                  >
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl><RadioGroupItem value="Yes" /></FormControl>
                      <FormLabel className="font-normal">{t('yes')}</FormLabel>
                    </FormItem>
                    <FormItem className="flex items-center space-x-3 space-y-0">
                      <FormControl><RadioGroupItem value="No" /></FormControl>
                      <FormLabel className="font-normal">{t('no')}</FormLabel>
                    </FormItem>
                  </RadioGroup>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" variant="gradient">{t('save_changes')}</Button>
      </form>
    </Form>
  );
};

export default ReportEditCashier;