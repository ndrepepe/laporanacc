import { MadeWithDyad } from "@/components/made-with-dyad";
import { useAuth } from "@/integrations/supabase/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import DashboardLayout from "@/components/DashboardLayout";
import { UserRole } from "@/lib/roles";
import ApplicationTools from "@/components/tools/ApplicationTools";
import { useLanguage } from "@/contexts/LanguageContext"; // Import useLanguage
import StickyHeader from "@/components/StickyHeader"; // Import StickyHeader

const SUMMARY_ROLES: UserRole[] = ['Senior Manager', 'Accounting Manager'];
const SUBORDINATE_ROLES: UserRole[] = ['Senior Manager', 'Accounting Manager', 'Consignment Supervisor'];

const Index = () => {
  const { profile, user } = useAuth();
  const { t } = useLanguage(); // Use translation hook

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

    // Format the list of actions into a readable sentence
    if (actions.length === 1) {
        return `${t('guidance_prefix')} ${actions[0]}.`;
    } else if (actions.length === 2) {
        return `${t('guidance_prefix')} ${actions[0]} ${t('and_conjunction')} ${actions[1]}.`;
    } else {
        const lastAction = actions.pop();
        // Use a simple comma separation for the rest
        return `${t('guidance_prefix')} ${actions.join(', ')}, ${t('and_conjunction')} ${lastAction}.`;
    }
  };

  return (
    <DashboardLayout>
      <StickyHeader>
        <h1 className="text-4xl font-extrabold tracking-widest lg:text-5xl text-gradient">
          {t('welcome')}, {profile?.first_name || user?.email}!
        </h1>
      </StickyHeader>
      
      <div className="grid grid-cols-1 gap-6 mt-6"> {/* Tambahkan mt-6 di sini */}
        <Card>
          <CardHeader>
            <CardTitle>{t('your_current_role')}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold text-primary tracking-wider">
              {profile?.role || t('role_not_assigned')}
            </p>
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