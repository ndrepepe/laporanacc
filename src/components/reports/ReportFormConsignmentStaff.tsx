import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/Button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { showSuccess, showError } from "@/utils/toast";
import { REPORT_TABLE_MAP } from "@/lib/report-constants";
import { useQueryClient } from "@tanstack/react-query";
import { sendReportSubmissionNotification } from "@/utils/notification-sender";
import { ConsignmentStaffFormSchema } from "@/lib/report-schemas";
import { useLanguage } from "@/contexts/LanguageContext";

type ConsignmentStaffFormValues = z.infer<typeof ConsignmentStaffFormSchema>;

const ReportFormConsignmentStaff = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  
  const form = useForm<ConsignmentStaffFormValues>({
    resolver: zodResolver(ConsignmentStaffFormSchema),
    defaultValues: {
      tasks_completed: "",
      issues_encountered: "",
      suggestions: "",
    },
  });

  const onSubmit = async (values: ConsignmentStaffFormValues) => {
    if (!user || !profile?.role) {
      showError("User not authenticated or role missing.");
      return;
    }

    const payload = {
      user_id: user.id,
      tasks_completed: values.tasks_completed,
      issues_encountered: values.issues_encountered,
      suggestions: values.suggestions || null,
    };

    const { error } = await supabase
      .from(REPORT_TABLE_MAP.consignment_staff)
      .insert([payload]);

    if (error) {
      console.error("Submission error:", error);
      showError("Failed to submit report. You may have already submitted a report for today.");
    } else {
      showSuccess("Consignment Staff Report submitted successfully!");
      form.reset({
        tasks_completed: "",
        issues_encountered: "",
        suggestions: "",
      });
      
      // Send notification to managers
      await sendReportSubmissionNotification(user.id, profile.role, 'consignment_staff');
      
      // Invalidate the dailyReports query to refresh the view
      queryClient.invalidateQueries({ queryKey: ['dailyReports'] });
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
                <Textarea 
                  placeholder={t('describe_completed_tasks')} 
                  {...field} 
                  rows={5} 
                />
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
                <Textarea 
                  placeholder={t('describe_issues_encountered')} 
                  {...field} 
                  rows={5} 
                />
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
                <Textarea 
                  placeholder={t('enter_suggestions')} 
                  {...field} 
                  rows={3} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <Button type="submit" variant="gradient">
          {t('submit_consignment_report')}
        </Button>
      </form>
    </Form>
  );
};

export default ReportFormConsignmentStaff;