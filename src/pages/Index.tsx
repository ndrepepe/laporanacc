import { MadeWithDyad } from "@/components/made-with-dyad";
import { useAuth } from "@/integrations/supabase/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import DashboardLayout from "@/components/DashboardLayout";
import { UserRole } from "@/lib/roles";
import ApplicationTools from "@/components/tools/ApplicationTools";
import { useLanguage } from "@/contexts/LanguageContext";
import StickyHeader from "@/components/StickyHeader";
import { Button } from "@/components/Button";
import { RefreshCw, AlertCircle } from "lucide-react";
import { useEffect, useState } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";

const SUMMARY_ROLES: UserRole[] = ['Senior Manager', 'Accounting Manager'];
const SUBORDINATE_ROLES: UserRole[] = ['Senior Manager', 'Accounting Manager', 'Consignment Supervisor'];

const Index = () => {
  const { profile, user, isLoading, refreshProfile, error } = useAuth();
  const { t } = useLanguage();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);

  // If profile is loaded but role is missing, try to refresh once automatically
  useEffect(() => {
    if (!isLoading && profile && !profile.role && !hasAttemptedRefresh) {
      const refresh = async () => {
        setIsRefreshing(true);
        await refreshProfile();
        setIsRefreshing(false);
        setHasAttemptedRefresh(true);
      };
      refresh();
    }
  }, [isLoading, profile, hasAttemptedRefresh, refreshProfile]);

  const getGuidanceMessage = (role: UserRole | undefined) => {
    if (!role) {
      return t('guidance_prefix') + " " + t('dashboard') + ".";
    }
    let actions = [t('action_submit_report'), t('action_view_reports'), t('action_check_notifications')];
    if (SUMMARY_ROLES.includes(role)) {
      actions.push(t('action_view_summaries'));
    } else if (SUBORDINATE_ROLES.includes(role)) {
      actions.push(t('action_view_subordinate_reports'));
    }
    if (actions.length === 1) {
      return `${t('guidance_prefix')} ${actions[0]}.`;
    } else if (actions.length === 2) {
      return `${t('guidance_prefix')} ${actions[0]} ${t('and_conjunction')} ${actions[1]}.`;
    } else {
      const lastAction = actions.pop();
      return `${t('guidance_prefix')} ${actions.join(', ')}, ${t('and_conjunction')} ${lastAction}.`;
    }
  };

  // Show loading message if still in the process of authentication
  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
            <p className="mt-4">Loading your profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <StickyHeader>
        <div className="flex justify-between items-center">
          <h1 className="text-4xl font-extrabold tracking-widest lg:text-5xl text-gradient my-0">
            {t('welcome')}, {profile?.first_name || user?.email}!
          </h1>
          {(!profile || !profile.role) && (
            <Button variant="outline" size="sm" onClick={async () => {
              setIsRefreshing(true);
              await refreshProfile();
              setIsRefreshing(false);
            }} disabled={isRefreshing}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
              Refresh Profile
            </Button>
          )}
        </div>
      </StickyHeader>
      
      <div className="grid grid-cols-1 gap-6 mt-6">
        {/* Show error if any */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <Card>
          <CardHeader>
            <CardTitle>{t('your_current_role')}</CardTitle>
          </CardHeader>
          <CardContent>
            {profile?.role ? (
              <p className="text-3xl font-bold text-primary tracking-wider">
                {profile.role}
              </p>
            ) : (
              <div className="flex items-center justify-between">
                <p className="text-3xl font-bold text-muted-foreground tracking-wider">
                  {t('role_not_assigned')}
                </p>
                <Button variant="outline" size="sm" onClick={async () => {
                  setIsRefreshing(true);
                  await refreshProfile();
                  setIsRefreshing(false);
                }} disabled={isRefreshing}>
                  <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
                  {t('retry')}
                </Button>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-4">
              {getGuidanceMessage(profile?.role)}
            </p>
          </CardContent>
        </Card>
        <ApplicationTools />
      </div>
      <MadeWithDyad />
    </DashboardLayout>
  );
};

export default Index;