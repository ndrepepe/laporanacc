import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/integrations/supabase/auth";
import { showSuccess, showError } from "@/utils/toast";
import { REPORT_TABLE_MAP } from "@/lib/report-constants";
import { useQueryClient } from "@tanstack/react-query";

const formSchema = z.object({
  tasks_completed: z.string().min(10, "Tasks completed description is required."),
  issues_encountered: z.string().min(10, "Issues encountered description is required."),
  suggestions: z.string().optional(),
});

type SupervisorManagerFormValues = z.infer<typeof formSchema>;

const ReportFormSupervisorManager = () => {
  const { user, profile } = useAuth();
  const queryClient = useQueryClient();
  const form = useForm<SupervisorManagerFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      tasks_completed: "",
      issues_encountered: "",
      suggestions: "",
    },
  });

  const onSubmit = async (values: SupervisorManagerFormValues) => {
    if (!user) {
      showError("User not authenticated.");
      return;
    }

    const payload = {
      user_id: user.id,
      tasks_completed: values.tasks_completed,
      issues_encountered: values.issues_encountered,
      suggestions: values.suggestions || null,
    };

    const { error } = await supabase
      .from(REPORT_TABLE_MAP.supervisor_manager)
      .insert([payload]);

    if (error) {
      console.error("Submission error:", error);
      showError("Failed to submit report. You may have already submitted a report for today.");
    } else {
      showSuccess(`${profile?.role} Report submitted successfully!`);
      form.reset();
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

        <Button type="submit">Submit Report</Button>
      </form>
    </Form>
  );
};

export default ReportFormSupervisorManager;