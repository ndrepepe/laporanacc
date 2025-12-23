import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/Button';
import { Trash2, Plus } from 'lucide-react';
import { showSuccess, showError } from '@/utils/toast';
import { useLanguage } from '@/contexts/LanguageContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';

const BranchManagement = () => {
    const { t } = useLanguage();
    const queryClient = useQueryClient();
    const [newBranch, setNewBranch] = useState('');

    const { data: branches, isLoading } = useQuery({
        queryKey: ['admin-branches'],
        queryFn: async () => {
            const { data, error } = await supabase.from('branches').select('*').order('name');
            if (error) throw error;
            return data;
        }
    });

    const addBranchMutation = useMutation({
        mutationFn: async (name: string) => {
            const { error } = await supabase.from('branches').insert([{ name }]);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-branches'] });
            setNewBranch('');
            showSuccess(t('branch_added_success'));
        },
        onError: (err: any) => showError(err.message)
    });

    const deleteBranchMutation = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase.from('branches').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['admin-branches'] });
            showSuccess(t('branch_deleted_success'));
        },
        onError: (err: any) => showError(err.message)
    });

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newBranch.trim()) return;
        addBranchMutation.mutate(newBranch.trim());
    };

    if (isLoading) return <div className="p-4 space-y-4"><Skeleton className="h-64 w-full" /></div>;

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('branch_list_title')}</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>{t('branch_name_label')}</TableHead>
                                    <TableHead className="text-right">{t('action')}</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {branches?.map((branch) => (
                                    <TableRow key={branch.id}>
                                        <TableCell className="font-medium">{branch.name}</TableCell>
                                        <TableCell className="text-right">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                onClick={() => window.confirm(t('confirm_delete_branch')) && deleteBranchMutation.mutate(branch.id)}
                                                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>
            </div>

            <div className="space-y-4">
                <Card>
                    <CardHeader>
                        <CardTitle>{t('add_branch_title')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleAdd} className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">{t('branch_name_label')}</label>
                                <Input 
                                    value={newBranch} 
                                    onChange={(e) => setNewBranch(e.target.value)} 
                                    placeholder={t('branch_name_placeholder')} 
                                />
                            </div>
                            <Button type="submit" variant="gradient" className="w-full" disabled={addBranchMutation.isPending}>
                                <Plus className="h-4 w-4 mr-2" />
                                {addBranchMutation.isPending ? t('adding') : t('add_branch_button')}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default BranchManagement;