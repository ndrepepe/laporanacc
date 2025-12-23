import React from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/Button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { REPORT_TABLE_MAP } from "@/lib/report-constants";
import { useQueryClient } from "@tanstack/react-query";
import { DailyReport, SupervisorManagerReport } from "@/lib/types";
import { SupervisorManagerFormSchema } from "@/lib/report-schemas";
import { useLanguage } from "@/contexts/LanguageContext";

type SupervisorManagerFormValues = z.infer<typeof SupervisorManagerFormSchema>;

interface ReportEditSupervisorManagerProps {
    report: DailyReport & SupervisorManagerReport;
    onSuccess: () => void;
}

const ReportEditSupervisorManager: React.FC<ReportEditSupervisorManagerProps> = ({ report, onSuccess }) => {
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  
  const defaultValues: SupervisorManagerFormValues = {
    tasks_completed: report.tasks_completed,
    issues_encountered: report.issues_encountered,
    suggestions: report.suggestions || "",
  };

  const form = useForm<SupervisorManagerFormValues>({
    resolver: zodResolver(SupervisorManagerFormSchema),
    defaultValues,
  });

  const onSubmit = async (values: SupervisorManagerFormValues) => {
    const payload = {
      tasks_completed: values.tasks_completed,
      issues_encountered: values.issues_encountered,
      suggestions: values.suggestions || null,
    };

    const { error } = await supabase
      .from(REPORT_TABLE_MAP.supervisor_manager)
      .update(payload)
      .eq('id', report.id);

    if (error) {
      console.error("Update error:", error);
      showError("Failed to update report.");
    } else {
      showSuccess("Supervisor/Manager Report updated successfully!");
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
          name="tasks_completed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('tasks_completed_today')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('describe_completed_tasks')} {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="issues_encountered"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('issues_encountered')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('describe_issues_encountered')} {...field} rows={5} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="suggestions"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('suggestions_recommendations')}</FormLabel>
              <FormControl>
                <Textarea placeholder={t('enter_suggestions')} {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" variant="gradient">{t('save_changes')}</Button>
      </form>
    </Form>
  );
};

export default ReportEditSupervisorManager;