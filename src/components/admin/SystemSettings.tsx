import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { useLanguage } from '@/contexts/LanguageContext';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ShieldAlert, Server, Activity } from 'lucide-react';

const SystemSettings = () => {
    const { t } = useLanguage();

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                            <Server className="h-4 w-4 mr-2 text-primary" />
                            {t('system_status')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-green-500">Online</div>
                        <p className="text-xs text-muted-foreground mt-1">All services operational</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium flex items-center">
                            <Activity className="h-4 w-4 mr-2 text-accent" />
                            {t('active_users')}
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">12</div>
                        <p className="text-xs text-muted-foreground mt-1">Users online right now</p>
                    </CardContent>
                </Card>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center">
                        <ShieldAlert className="h-5 w-5 mr-2 text-destructive" />
                        System Maintenance
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/30">
                        <div className="space-y-0.5">
                            <Label className="text-base">{t('maintenance_mode')}</Label>
                            <p className="text-sm text-muted-foreground">
                                Only admins can access the application when active.
                            </p>
                        </div>
                        <Switch />
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default SystemSettings;