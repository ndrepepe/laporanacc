import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Profile } from '@/lib/types';
import { UserRole } from '@/lib/roles';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { showSuccess, showError } from '@/utils/toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';

const ROLES: UserRole[] = [
    'Accounting Staff',
    'Cashier',
    'Cashier-Insentif',
    'Consignment Staff',
    'Consignment Supervisor',
    'Accounting Manager',
    'Senior Manager'
];

const UserManagement = () => {
    const { t } = useLanguage();
    const queryClient = useQueryClient();
    const [search, setSearch] = useState('');

    const { data: users, isLoading } = useQuery<Profile[]>({
        queryKey: ['admin-users'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('first_name', { ascending: true });
            if (error) throw error;
            return data as Profile[];
        }
    });

    const updateRoleMutation = useMutation({
        mutationFn: async ({ userId, role }: { userId: string, role: UserRole }) => {
            const { error } = await supabase
                .from('profiles')
                .update({ role })
                .eq('id', userId);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-users'] });
            showSuccess(t('role_updated_success'));
        },
        onError: (err: any) => {
            showError(err.message);
        }
    });

    const filteredUsers = users?.filter(u => 
        `${u.first_name} ${u.last_name}`.toLowerCase().includes(search.toLowerCase())
    );

    if (isLoading) return <div className="p-4 space-y-4"><Skeleton className="h-10 w-full" /><Skeleton className="h-64 w-full" /></div>;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <Input 
                    placeholder={t('search_users_placeholder')} 
                    className="max-w-md"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            <div className="border rounded-md">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>{t('submitter')}</TableHead>
                            <TableHead>{t('role')}</TableHead>
                            <TableHead>{t('update_role')}</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers?.map((user) => (
                            <TableRow key={user.id}>
                                <TableCell className="font-medium">
                                    {user.first_name} {user.last_name}
                                </TableCell>
                                <TableCell>
                                    <Badge variant="secondary">{user.role}</Badge>
                                </TableCell>
                                <TableCell>
                                    <Select 
                                        value={user.role} 
                                        onValueChange={(val) => updateRoleMutation.mutate({ userId: user.id, role: val as UserRole })}
                                        disabled={updateRoleMutation.isPending}
                                    >
                                        <SelectTrigger className="w-[200px]">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {ROLES.map(role => (
                                                <SelectItem key={role} value={role}>{role}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};

export default UserManagement;