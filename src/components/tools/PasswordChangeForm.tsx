import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/Button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { supabase } from "@/integrations/supabase/client";
import { showSuccess, showError } from "@/utils/toast";
import { useLanguage } from "@/contexts/LanguageContext";
import { Key } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";

const PasswordChangeSchema = z.object({
    password: z.string().min(6, { message: "Password must be at least 6 characters." }),
    confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
});

type PasswordChangeFormValues = z.infer<typeof PasswordChangeSchema>;

const PasswordChangeForm = () => {
    const { t } = useLanguage();
    const form = useForm<PasswordChangeFormValues>({
        resolver: zodResolver(PasswordChangeSchema),
        defaultValues: {
            password: "",
            confirmPassword: "",
        },
    });

    const onSubmit = async (values: PasswordChangeFormValues) => {
        const { error } = await supabase.auth.updateUser({
            password: values.password,
        });

        if (error) {
            console.error("Password update error:", error);
            showError(t('password_error') + ` (${error.message})`);
        } else {
            showSuccess(t('password_success'));
            form.reset();
        }
    };

    return (
        <Card className="mt-6">
            <CardHeader>
                <CardTitle className="text-xl flex items-center">
                    <Key className="h-5 w-5 mr-2 text-primary" /> {t('update_password_title')}
                </CardTitle>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        
                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('new_password')}</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('confirm_password')}</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder="••••••••" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit" variant="gradient" className="w-full">
                            {t('update_button')}
                        </Button>
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
};

export default PasswordChangeForm;