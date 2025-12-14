import { useForm, useFieldArray } from "react-hook-form";
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
import { MinusCircle, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { sendReportSubmissionNotification } from "@/utils/notification-sender";
import { ConsignmentStaffFormSchema } from "@/lib/report-schemas";

type ConsignmentStaffFormValues = z.infer<typeof ConsignmentStaffFormSchema>;

const ReportFormConsignmentStaff = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const form = useForm<ConsignmentStaffFormValues>({
    resolver: zodResolver(ConsignmentStaffFormSchema),
    defaultValues: {
      received_lpk: "No",
      lpk_entries: [],
      lpk_entered_bsoft: 0,
      tasks_completed: "",
      issues_encountered: "",
      suggestions: "",
    },
  });

  const receivedLpk = form.watch("received_lpk");
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "lpk_entries",
  });

  const onSubmit = async (values: ConsignmentStaffFormValues) => {
    if (!user || !profile?.role) {
      showError("User not authenticated or role missing.");
      return;
    }

    const reportPayload = {
      user_id: user.id,
      received_lpk: values.received_lpk === "Yes",
      lpk_entered_bsoft: values.lpk_entered_bsoft,
      tasks_completed: values.tasks_completed,
      issues_encountered: values.issues_encountered,
      suggestions: values.suggestions || null,
    };

    // 1. Insert main report
    const { data: reportData, error: reportError } = await supabase
      .from(REPORT_TABLE_MAP.consignment_staff)
      .insert([reportPayload])
      .select('id')
      .single();

    if (reportError) {
      console.error("Report submission error:", reportError);
      showError("Failed to submit report. You may have already submitted a report for today.");
      return;
    }

    const reportId = reportData.id;

    // 2. Insert LPK entries if applicable
    if (values.received_lpk === "Yes" && values.lpk_entries && values.lpk_entries.length > 0) {
        const lpkPayload = values.lpk_entries.map(entry => ({
            report_id: reportId,
            branch_name: entry.branch_name,
            lpk_count: entry.lpk_count,
        }));

        const { error: lpkError } = await supabase
            .from('lpk_entries')
            .insert(lpkPayload);

        if (lpkError) {
            console.error("LPK entry submission error:", lpkError);
            showError("Report submitted, but failed to save LPK entries.");
            // We don't return here, as the main report is still valid.
        }
    }

    showSuccess("Consignment Staff Report submitted successfully!");
    form.reset({
        received_lpk: "No",
        lpk_entries: [],
        lpk_entered_bsoft: 0,
        tasks_completed: "",
        issues_encountered: "",
        suggestions: "",
    });
    
    // Send notification to managers
    await sendReportSubmissionNotification(user.id, profile.role, 'consignment_staff');

    // Invalidate the dailyReports query to refresh the view
    queryClient.invalidateQueries({ queryKey: ['dailyReports'] });
    // Invalidate LPK entries query if needed, although it's usually fetched via report ID
    queryClient.invalidateQueries({ queryKey: ['lpkEntries'] });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        
        <FormField
          control={form.control}
          name="received_lpk"
          render={({ field }) => (
            <FormItem className="space-y-3">
              <FormLabel>Did you receive LPK from branches today?</FormLabel>
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

        {receivedLpk === "Yes" && (
            <Card className="p-4">
                <CardHeader className="p-0 pb-4">
                    <CardTitle className="text-lg">LPK Entries (Multiple)</CardTitle>
                </CardHeader>
                <CardContent className="p-0 space-y-4">
                    {fields.map((field, index) => (
                        <div key={field.id} className="flex gap-4 items-end border-b pb-4 last:border-b-0 last:pb-0">
                            <FormField
                                control={form.control}
                                name={`lpk_entries.${index}.branch_name`}
                                render={({ field }) => (
                                    <FormItem className="flex-1">
                                        <FormLabel>Branch Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Main Branch" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name={`lpk_entries.${index}.lpk_count`}
                                render={({ field }) => (
                                    <FormItem className="w-32">
                                        <FormLabel>LPK Count</FormLabel>
                                        <FormControl>
                                            <Input 
                                                type="number" 
                                                placeholder="0" 
                                                {...field} 
                                                onChange={e => field.onChange(e.target.value === "" ? 0 : parseInt(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <Button 
                                type="button" 
                                variant="outline" 
                                size="icon" 
                                onClick={() => remove(index)}
                                className="mb-1"
                            >
                                <MinusCircle className="h-4 w-4 text-destructive" />
                            </Button>
                        </div>
                    ))}
                    <Button 
                        type="button" 
                        variant="outline" 
                        className="w-full" 
                        onClick={() => append({ branch_name: "", lpk_count: 1 })}
                    >
                        <PlusCircle className="h-4 w-4 mr-2" /> Add LPK Entry
                    </Button>
                </CardContent>
            </Card>
        )}

        <FormField
          control={form.control}
          name="lpk_entered_bsoft"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Number of LPK entered into Bsoft</FormLabel>
              <FormControl>
                <Input type="number" {...field} onChange={e => field.onChange(e.target.value === "" ? 0 : parseInt(e.target.value))} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="tasks_completed"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tasks Completed Today</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe your completed tasks..." {...field} rows={5} />
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
              <FormLabel>Issues Encountered</FormLabel>
              <FormControl>
                <Textarea placeholder="Describe any issues encountered..." {...field} rows={5} />
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
              <FormLabel>Suggestions and Recommendations (Optional)</FormLabel>
              <FormControl>
                <Textarea placeholder="Enter suggestions..." {...field} rows={3} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit">Submit Consignment Staff Report</Button>
      </form>
    </Form>
  );
};

export default ReportFormConsignmentStaff;