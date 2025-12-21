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
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const SUMMARY_ROLES: UserRole[] = ['Senior Manager', 'Accounting Manager'];
const SUBORDINATE_ROLES: UserRole[] = ['Senior Manager', 'Accounting Manager', 'Consignment Supervisor'];

const Index = () => {
  const { profile, user, isLoading, refreshProfile, error } = useAuth();
  const { t } = useLanguage();
  const isMobile = useIsMobile();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [hasAttemptedRefresh, setHasAttemptedRefresh] = useState(false);
  const localError = null; // Removed unused setter

  useEffect(() => {
    if (!isLoading && profile && !profile.role && !hasAttemptedRefresh) {
      const refresh = async () => {
        setIsRefreshing(true);
        try {
          await refreshProfile();
        } catch (err) {
          console.error("Auto-refresh failed:", err);
        }
        setIsRefreshing(false);
        setHasAttemptedRefresh(true);
      };
      refresh();
    }
  }, [isLoading, profile, hasAttemptedRefresh, refreshProfile]);

  const getGuidanceMessage = (role: UserRole | undefined) => {
    if (!role) return t('guidance_prefix') + " " + t('dashboard') + ".";
    let actions = [t('action_submit_report'), t('action_view_reports')];
    if (SUMMARY_ROLES.includes(role)) actions.push(t('action_view_summaries'));
    if (SUBORDINATE_ROLES.includes(role)) actions.push(t('action_view_subordinate_reports'));
    
    return `${t('guidance_prefix')} ${actions.join(', ')}.`;
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-[60vh]">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <StickyHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <h1 className={cn(
            "font-extrabold tracking-tight text-gradient",
            isMobile ? "text-2xl" : "text-4xl"
          )}>
            {t('welcome')}, {profile?.first_name || user?.email?.split('@')[0]}!
          </h1>
          {(!profile || !profile.role) && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => refreshProfile()}
              disabled={isRefreshing}
              className="w-full sm:w-auto"
            >
              <RefreshCw className={cn("h-4 w-4 mr-2", isRefreshing && "animate-spin")} />
              Refresh Profile
            </Button>
          )}
        </div>
      </StickyHeader>
      
      <div className="space-y-6">
        {(error || localError) && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error || localError}</AlertDescription>
          </Alert>
        )}
        
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              {t('your_current_role')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-2">
              <p className={cn(
                "font-bold text-primary tracking-tight",
                isMobile ? "text-xl" : "text-3xl"
              )}>
                {profile?.role || t('role_not_assigned')}
              </p>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {getGuidanceMessage(profile?.role)}
              </p>
            </div>
          </CardContent>
        </Card>
        
        <ApplicationTools />
      </div>
      <MadeWithDyad />
    </DashboardLayout>
  );
};

export default Index;