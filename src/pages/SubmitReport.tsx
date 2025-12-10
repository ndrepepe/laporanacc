import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/integrations/supabase/auth";
import { REPORT_ROLE_MAP, ReportType } from "@/lib/report-constants";
import ReportFormAccounting from "../components/reports/ReportFormAccounting";
import ReportFormCashier from "../components/reports/ReportFormCashier";
import ReportFormConsignmentStaff from "../components/reports/ReportFormConsignmentStaff";
import ReportFormSupervisorManager from "../components/reports/ReportFormSupervisorManager";
import { Skeleton } from "@/components/ui/skeleton";

const ReportFormMap: Record<ReportType, React.FC> = {
    'accounting': ReportFormAccounting,
    'cashier': ReportFormCashier,
    'consignment_staff': ReportFormConsignmentStaff,
    'supervisor_manager': ReportFormSupervisorManager,
};

const SubmitReport = () => {
  const { profile, isLoading } = useAuth();

  if (isLoading) {
    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-6">Submit Daily Report</h1>
            <Card>
                <CardHeader><CardTitle>Loading...</CardTitle></CardHeader>
                <CardContent><Skeleton className="h-64 w-full" /></CardContent>
            </Card>
        </DashboardLayout>
    );
  }

  const userRole = profile?.role;
  const reportType = userRole ? REPORT_ROLE_MAP[userRole as keyof typeof REPORT_ROLE_MAP] : null;
  const ReportComponent = reportType ? ReportFormMap[reportType] : null;

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">Submit Daily Report</h1>
      <Card>
        <CardHeader>
          <CardTitle>{userRole} Daily Report</CardTitle>
        </CardHeader>
        <CardContent>
          {ReportComponent ? (
            <ReportComponent />
          ) : (
            <p className="text-lg text-muted-foreground">
              {userRole === 'Senior Manager' 
                ? "As a Senior Manager, you are not required to submit a daily report. Please use the 'View Reports' or 'Summary' sections."
                : "Your role is not recognized or assigned. Please contact administration."
              }
            </p>
          )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default SubmitReport;