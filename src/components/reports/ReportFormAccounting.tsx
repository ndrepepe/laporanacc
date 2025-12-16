import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/Button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { showSuccess, showError } from "@/utils/toast";
import { REPORT_TABLE_MAP } from "@/lib/report-constants";
import { useQueryClient } from "@tanstack/react-query";
import { sendReportSubmissionNotification } from "@/utils/notification-sender";
import { AccountingFormSchema } from "@/lib/report-schemas";
import { useLanguage } from "@/contexts/LanguageContext";

type AccountingFormValues = z.infer<typeof AccountingFormSchema>;

const ReportFormAccounting = () => {
  const { user, profile } = useAuth();
  const { t } = useLanguage();
  const queryClient = useQueryClient();

  const form = useForm<AccountingFormValues>({
    resolver: zodResolver(AccountingFormSchema),
    defaultValues: {
      new_customers_count: undefined,
      new_customers_names: "",
      new_sales_count: undefined,
      new_sales_names: "",
      worked_on_lph: "No",
      customer_confirmation_status: "Successful",
    },
  });

  const onSubmit = async (values: AccountingFormValues) => {
    if (!user || !profile?.role) {
      showError("User not authenticated or role missing.");
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
      
      // Send notification to managers
      await sendReportSubmissionNotification(user.id, profile.role, 'accounting');
      
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="new_customers_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('new_customers_count_label')}</FormLabel>
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
            name="new_sales_count"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t('new_sales_count_label')}</FormLabel>
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
        </div>
        <FormField
          control={form.control}
          name="new_customers_names"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t('new_customer_names_label')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., John Doe, Jane Smith"
                  {...field}
                  rows={3}
                />
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
              <FormLabel>{t('new_sales_names_label')}</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="e.g., Sale A, Sale B"
                  {...field}
                  rows={3}
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
          name="customer_confirmation_status"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>{t('customer_confirmation_status_label')}</FormLabel>
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
        <Button type="submit" variant="gradient">{t('submit_accounting_report')}</Button>
      </form>
    </Form>
  );
};

export default ReportFormAccounting;