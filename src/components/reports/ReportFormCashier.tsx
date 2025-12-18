import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/Button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { showSuccess, showError } from "@/utils/toast";
import { REPORT_TABLE_MAP } from "@/lib/report-constants";
import { useQueryClient } from "@tanstack/react-query";
import { sendReportSubmissionNotification } from "@/utils/notification-sender";
import { CashierFormSchema } from "@/lib/report-schemas";
import { useLanguage } from "@/contexts/LanguageContext";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea

type CashierFormValues = z.infer<typeof CashierFormSchema>;

const ReportFormCashier = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();
  
  const isKasirInsentif = profile?.role === 'Kasir-Insentif';

  const form = useForm<CashierFormValues>({
    resolver: zodResolver(CashierFormSchema),
    defaultValues: {
      payments_count: undefined,
      total_payments: undefined,
      worked_on_lph: "No",
      customer_confirmation_done: "No",
      incentive_report_progress: "", // Initialize new field
    },
  });

  const onSubmit = async (values: CashierFormValues) => {
    if (!user || !profile?.role) {
      showError("User not authenticated or role missing.");
      return;
    }
    
    // Validation check for Kasir-Insentif specific field
    if (isKasirInsentif && !values.incentive_report_progress?.trim()) {
        form.setError('incentive_report_progress', {
            type: 'manual',
            message: t('incentive_report_progress_required'),
        });
        showError(t('incentive_report_progress_required'));
        return;
    }

    const payload = {
      user_id: user.id,
      payments_count: values.payments_count,
      total_payments: values.total_payments,
      worked_on_lph: values.worked_on_lph === "Yes",
      customer_confirmation_done: values.customer_confirmation_done === "Yes",
      incentive_report_progress: isKasirInsentif ? values.incentive_report_progress || null : null,
    };

    const { error } = await supabase
      .from(REPORT_TABLE_MAP.cashier)
      .insert([payload]);

    if (error) {
      console.error("Submission error:", error);
      showError("Failed to submit report. You may have already submitted a report for today.");
    } else {
      showSuccess("Cashier Report submitted successfully!");
      form.reset({
        payments_count: undefined,
        total_payments: undefined,
        worked_on_lph: "No",
        customer_confirmation_done: "No",
        incentive_report_progress: "",
      });
      
      // Send notification to managers
      await sendReportSubmissionNotification(user.id, profile.role, 'cashier');
      
      // Invalidate the dailyReports query to refresh the view
      queryClient.invalidateQueries({ queryKey: ['dailyReports'] });
    }
  };

  // Helper function for integer input change handling
  const handleIntChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const value = e.target.value;
    if (value === "") {
      field.onChange(undefined);
    } else {
      field.onChange(parseInt(value));
    }
  };

  // Helper function for float input change handling
  const handleFloatChange = (e: React.ChangeEvent<HTMLInputElement>, field: any) => {
    const value = e.target.value;
    if (value === "") {
      field.onChange(undefined);
    } else {
      field.onChange(parseFloat(value));
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
              <FormLabel>{t('payments_count_label')}</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  {...field}
                  value={field.value === undefined ? "" : field.value}
                  onChange={e => handleIntChange(e, field)}
                />
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
                <Input
                  type="number"
                  step="0.01"
                  {...field}
                  value={field.value === undefined ? "" : field.value}
                  onChange={e => handleFloatChange(e, field)}
                />
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
              <FormLabel>{t('worked_on_lph_label')}</FormLabel>
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
                    <FormLabel className="font-normal">{t('yes')}</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="No" />
                    </FormControl>
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
                    <FormControl>
                      <RadioGroupItem value="Yes" />
                    </FormControl>
                    <FormLabel className="font-normal">{t('yes')}</FormLabel>
                  </FormItem>
                  <FormItem className="flex items-center space-x-3 space-y-0">
                    <FormControl>
                      <RadioGroupItem value="No" />
                    </FormControl>
                    <FormLabel className="font-normal">{t('no')}</FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        {/* Conditional Field for Kasir-Insentif */}
        {isKasirInsentif && (
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

        <Button type="submit" variant="gradient">{t('submit_cashier_report')}</Button>
      </form>
    </Form>
  );
};

export default ReportFormCashier;