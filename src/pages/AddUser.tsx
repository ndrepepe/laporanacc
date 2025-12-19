import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/Button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, CheckCircle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";
import { supabase } from "@/integrations/supabase/client";
import { UserRole } from "@/lib/roles";

const formSchema = z.object({
  email: z.string().email({ message: "Invalid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  first_name: z.string().min(1, { message: "First name is required" }),
  last_name: z.string().min(1, { message: "Last name is required" }),
  role: z.enum(['Accounting Staff', 'Cashier', 'Cashier-Insentif', 'Consignment Staff', 'Consignment Supervisor', 'Accounting Manager', 'Senior Manager']),
});

type FormData = z.infer<typeof formSchema>;

const AddUser = () => {
  const { t } = useLanguage();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
      first_name: "",
      last_name: "",
      role: "Accounting Staff",
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            first_name: data.first_name,
            last_name: data.last_name,
            role: data.role,
          },
        },
      });

      if (signUpError) {
        throw signUpError;
      }

      if (authData.user) {
        setSuccess(true);
        form.reset();
      }
    } catch (err: any) {
      console.error("Error creating user:", err);
      setError(err.message || "Failed to create user");
    } finally {
      setIsLoading(false);
    }
  };

  if (success) {
    return (
      <Alert>
        <CheckCircle className="h-4 w-4" />
        <AlertTitle>{t('success')}</AlertTitle>
        <AlertDescription>
          {t('user_created_successfully')}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-6">{t('add_employee')}</h1>
      
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t('error')}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

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
                    <Input placeholder={t('first_name')} {...field} />
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
                    <Input placeholder={t('last_name')} {...field} />
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
                  <Input type="email" placeholder={t('email')} {...field} />
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
                <FormLabel>{t('password')}</FormLabel>
                <FormControl>
                  <Input type="password" placeholder={t('password')} {...field} />
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
                      <SelectValue placeholder={t('select_role')} />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Accounting Staff">{t('accounting_staff')}</SelectItem>
                    <SelectItem value="Cashier">{t('cashier')}</SelectItem>
                    <SelectItem value="Cashier-Insentif">{t('cashier_insentif')}</SelectItem>
                    <SelectItem value="Consignment Staff">{t('consignment_staff')}</SelectItem>
                    <SelectItem value="Consignment Supervisor">{t('consignment_supervisor')}</SelectItem>
                    <SelectItem value="Accounting Manager">{t('accounting_manager')}</SelectItem>
                    <SelectItem value="Senior Manager">{t('senior_manager')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" disabled={isLoading} className="w-full">
            {isLoading ? t('creating') : t('create_user')}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default AddUser;