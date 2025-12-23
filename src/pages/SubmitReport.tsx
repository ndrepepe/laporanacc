import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { useAuth } from "@/integrations/supabase/auth";
import { UserRole } from "@/lib/roles";
import ReportFormAccounting from "@/components/reports/ReportFormAccounting";
import ReportFormCashier from "@/components/reports/ReportFormCashier";
import ReportFormConsignmentStaff from "@/components/reports/ReportFormConsignmentStaff";
import ReportFormSupervisorManager from "@/components/reports/ReportFormSupervisorManager";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

const SubmitReport = () => {
  const { profile, isLoading } = useAuth();
  const { t } = useLanguage();

  if (isLoading) {
    return (
      <DashboardLayout>
        <Card>
          <CardContent className="p-6">Loading user profile...</CardContent>
        </Card>
      </DashboardLayout>
    );
  }

  if (!profile || !profile.role) {
    return (
      <DashboardLayout>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>{t('access_denied')}</AlertTitle>
          <AlertDescription>
            {t('role_not_assigned_error')}
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  const renderForm = (role: UserRole) => {
    switch (role) {
      case 'Accounting Staff':
        return <ReportFormAccounting />;
      case 'Cashier':
      case 'Cashier-Insentif':
        return <ReportFormCashier />;
      case 'Consignment Staff':
        return <ReportFormConsignmentStaff />;
      case 'Consignment Supervisor':
      case 'Accounting Manager':
      case 'Senior Manager':
        return <ReportFormSupervisorManager />;
      default:
        return (
          <Alert variant="default">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>{t('unsupported_role')}</AlertTitle>
            <AlertDescription>
              {t('role_no_form', { role })}
            </AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6 tracking-wider text-gradient">{t('submit_daily_report_title')}</h1>
      <Card>
        <CardHeader>
          <CardTitle>{t('daily_report_submission')} ({profile.role})</CardTitle>
        </CardHeader>
        <CardContent>
          {renderForm(profile.role)}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default SubmitReport;