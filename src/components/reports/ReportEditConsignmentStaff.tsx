import React, { useEffect } from 'react';
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { REPORT_TABLE_MAP } from "@/lib/report-constants";
import { MinusCircle, PlusCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQueryClient } from "@tanstack/react-query";
import { ConsignmentStaffReport, DailyReport, LPKEntry } from "@/lib/types";
import { ConsignmentStaffFormSchema } from "@/lib/report-schemas";
import { useLpkEntries } from '@/hooks/use-lpk-entries';
import { Skeleton } from '@/components/ui/skeleton';

type ConsignmentStaffFormValues = z.infer<typeof ConsignmentStaffFormSchema>;

interface ReportEditConsignmentStaffProps {
    report: DailyReport & ConsignmentStaffReport;
    onSuccess: () => void;
}

const ReportEditConsignmentStaff: React.FC<ReportEditConsignmentStaffProps> = ({ report, onSuccess }) => {
  const queryClient = useQueryClient();
  const { data: initialLpkEntries, isLoading: isLoadingLpk } = useLpkEntries(report.id);

  const defaultValues: ConsignmentStaffFormValues = {
    received_lpk: report.received_lpk ? "Yes" : "No",
    lpk_entries: [], // Will be populated in useEffect
    lpk_entered_bsoft: report.lpk_entered_bsoft,
    tasks_completed: report.tasks_completed,
    issues_encountered: report.issues_encountered,
    suggestions: report.suggestions || "",
  };

  const form = useForm<ConsignmentStaffFormValues>({
    resolver: zodResolver(ConsignmentStaffFormSchema),
    defaultValues,
  });

  const receivedLpk = form.watch("received_lpk");
  const { fields, append, remove, replace } = useFieldArray({
    control: form.control,
    name: "lpk_entries",
  });

  // Populate form fields with fetched LPK data
  useEffect(() => {
    if (initialLpkEntries) {
        // Map LPKEntry (from DB) to LPKEntrySchema (from Zod)
        const mappedEntries = initialLpkEntries.map(entry => ({
            id: entry.id,
            branch_name: entry.branch_name,
            lpk_count: entry.lpk_count,
        }));
        replace(mappedEntries);
    }
  }, [initialLpkEntries, replace]);


  const onSubmit = async (values: ConsignmentStaffFormValues) => {
    // 1. Update main report
    const reportPayload = {
      received_lpk: values.received_lpk === "Yes",
      lpk_entered_bsoft: values.lpk_entered_bsoft,
      tasks_completed: values.tasks_completed,
      issues_encountered: values.issues_encountered,
      suggestions: values.suggestions || null,
    };

    const { error: reportError } = await supabase
      .from(REPORT_TABLE_MAP.consignment_staff)
      .update(reportPayload)
      .eq('id', report.id);

    if (reportError) {
      console.error("Report update error:", reportError);
      showError("Failed to update main report details.");
      return;
    }

    // 2. Handle LPK entries (Insert/Update/Delete)
    const currentLpkIds = initialLpkEntries?.map(e => e.id) || [];
    const submittedLpkIds = values.lpk_entries?.map(e => e.id).filter(Boolean) || [];
    
    const entriesToInsert = values.lpk_entries?.filter(e => !e.id) || [];
    const entriesToUpdate = values.lpk_entries?.filter(e => e.id) || [];
    const entriesToDeleteIds = currentLpkIds.filter(id => !submittedLpkIds.includes(id));

    const lpkPromises: Promise<any>[] = [];

    // Insert new entries
    if (entriesToInsert.length > 0) {
        const insertPayload = entriesToInsert.map(entry => ({
            report_id: report.id,
            branch_name: entry.branch_name,
            lpk_count: entry.lpk_count,
        }));
        lpkPromises.push(supabase.from('lpk_entries').insert(insertPayload).select()); 
    }

    // Update existing entries
    entriesToUpdate.forEach(entry => {
        lpkPromises.push(
            supabase.from('lpk_entries')
                .update({ branch_name: entry.branch_name, lpk_count: entry.lpk_count })
                .eq('id', entry.id)
                .select() 
        );
    });

    // Delete removed entries
    if (entriesToDeleteIds.length > 0) {
        lpkPromises.push(
            supabase.from('lpk_entries')
                .delete()
                .in('id', entriesToDeleteIds)
                .select() 
        );
    }

    const lpkResults = await Promise.all(lpkPromises);
    const lpkError = lpkResults.find(res => res.error)?.error;

    if (lpkError) {
        console.error("LPK entry update error:", lpkError);
        showError("Report updated, but failed to fully update LPK entries.");
    } else {
        showSuccess("Consignment Staff Report updated successfully!");
    }

    // Invalidate queries to refresh the list, single report, and LPK entries
    queryClient.invalidateQueries({ queryKey: ['dailyReports'] });
    queryClient.invalidateQueries({ queryKey: ['singleReport', report.id] });
    queryClient.invalidateQueries({ queryKey: ['lpkEntries', report.id] });
    onSuccess();
  };

  if (isLoadingLpk) {
    return <Skeleton className="h-64 w-full" />;
  }

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

        <Button type="submit">Save Changes</Button>
      </form>
    </Form>
  );
};

export default ReportEditConsignmentStaff;