import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/Button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { UserRole } from "@/lib/roles";
import { useLanguage } from "@/contexts/LanguageContext";
import { ScrollArea } from "@/components/ui/scroll-area";

const ALL_ROLES: UserRole[] = [
  'Accounting Staff',
  'Cashier',
  'Consignment Staff',
  'Consignment Supervisor',
  'Accounting Manager',
  'Senior Manager',
  'Kasir-Insentif', // Added new role
];

const AddUserSchema = z.object({
  email: z.string().email("Invalid email address."),
  password: z.string().min(6, "Password must be at least 6 characters."),
  first_name: z.string().min(1, "First name is required."),
  last_name: z.string().min(1, "Last name is required."),
  role: z.enum(ALL_ROLES as [UserRole, ...UserRole[]], {
    required_error: "Role is required.",
  }),
});

type AddUserFormValues = z.infer<typeof AddUserSchema>;

const AddUser = () => {
  const { t } = useLanguage();

  const form = useForm<AddUserFormValues>({
    resolver: zodResolver(AddUserSchema),
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      role: undefined,
    },
  });

  const onSubmit = async (values: AddUserFormValues) => {
    const { email, password, first_name, last_name, role } = values;

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name,
          last_name,
          role,
        },
      },
    });

    if (error) {
      console.error("User creation error:", error);
      showError(`${t('failed_to_add_user')}: ${error.message}`);
    } else if (data.user) {
      showSuccess(`${t('user')} ${email} ${t('created_successfully')}. ${t('email_confirmation_needed')}`);
      form.reset();
    } else {
      showError(t('user_creation_failed_unexpectedly'));
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6 tracking-wider text-gradient">{t('add_new_employee_title')}</h1>
      <Card className="max-w-lg">
        <CardHeader>
          <CardTitle>{t('create_user_account')}</CardTitle>
        </CardHeader>
        <ScrollArea className="h-[600px]">
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="first_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('first_name')}</FormLabel>
                        <FormControl>
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="last_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>{t('last_name')}</FormLabel>
                        <FormControl>
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('email')}</FormLabel>
                      <FormControl>
                        <Input placeholder="user@example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('temporary_password')}</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('role')}</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder={t('select_employee_role')} />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="dark:glass-effect">
                          {ALL_ROLES.map(role => (
                            <SelectItem key={role} value={role}>{role}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" variant="gradient" className="w-full">{t('add_user_button')}</Button>
              </form>
            </Form>
          </CardContent>
        </ScrollArea>
      </Card>
    </DashboardLayout>
  );
};

export default AddUser;