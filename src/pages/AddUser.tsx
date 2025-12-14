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

const ALL_ROLES: UserRole[] = [
    'Accounting Staff',
    'Cashier',
    'Consignment Staff',
    'Consignment Supervisor',
    'Accounting Manager',
    'Senior Manager',
];

const AddUserSchema = z.object({
    email: z.string().email("Invalid email address."),
    password: z.string().min(6, "Password must be at least 6 characters."),
    first_name: z.string().min(1, "First name is required."),
    last_name: z.string().min(1, "Last name is required."),
    role: z.enum(ALL_ROLES as [UserRole, ...UserRole[]], { required_error: "Role is required." }),
});

type AddUserFormValues = z.infer<typeof AddUserSchema>;

const AddUser = () => {
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

        // Use standard Supabase signUp, passing role data via options.data
        // The existing database trigger (handle_new_user) will read this data and set the profile role.
        
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
            showError(`Failed to add user: ${error.message}`);
        } else if (data.user) {
            showSuccess(`User ${email} created successfully! They need to confirm their email.`);
            form.reset();
        } else {
            showError("User creation failed unexpectedly.");
        }
    };

    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-6 tracking-wider text-gradient">Add New Employee</h1>
            <Card className="max-w-lg">
                <CardHeader>
                    <CardTitle>Create User Account</CardTitle>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="first_name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>First Name</FormLabel>
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
                                            <FormLabel>Last Name</FormLabel>
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
                                        <FormLabel>Email</FormLabel>
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
                                        <FormLabel>Password (Temporary)</FormLabel>
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
                                        <FormLabel>Role</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select employee role" />
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

                            <Button type="submit" variant="gradient" className="w-full">Add User</Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </DashboardLayout>
    );
};

export default AddUser;