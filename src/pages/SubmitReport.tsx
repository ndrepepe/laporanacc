import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/integrations/supabase/auth";
import { ReportType, UserRole } from "@/lib/report-constants";
import ReportFormAccounting from "@/components/reports/ReportFormAccounting";
import ReportFormCashier from "@/components/reports/ReportFormCashier";
import ReportFormConsignmentStaff from "@/components/reports/ReportFormConsignmentStaff";
import ReportFormSupervisorManager from "@/components/reports/ReportFormSupervisorManager";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";

const getReportForm = (role: UserRole) => {
    switch (role) {
        case 'Accounting Staff':
            return <ReportFormAccounting />;
        case 'Cashier':
            return <ReportFormCashier />;
        case 'Consignment Staff':
            return <ReportFormConsignmentStaff />;
        case 'Consignment Supervisor':
        case 'Accounting Manager':
        case 'Senior Manager':
            return <ReportFormSupervisorManager />;
        default:
            return (
                <Alert variant="destructive">
                    <AlertTriangle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        Your role ({role}) is not configured for report submission.
                    </AlertDescription>
                </Alert>
            );
    }
};

const SubmitReport = () => {
    const { profile, isLoading } = useAuth();

    if (isLoading) {
        return (
            <DashboardLayout>
                <h1 className="text-3xl font-bold mb-6">Submit Daily Report</h1>
                <Card><CardContent className="p-6">Loading user profile...</CardContent></Card>
            </DashboardLayout>
        );
    }

    if (!profile || !profile.role) {
        return (
            <DashboardLayout>
                <h1 className="text-3xl font-bold mb-6">Submit Daily Report</h1>
                <Card><CardContent className="p-6 text-red-500">Access Denied: User profile or role not found.</CardContent></Card>
            </DashboardLayout>
        );
    }

    const FormComponent = getReportForm(profile.role);

    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-6">Submit Daily Report</h1>
            <Card>
                <CardHeader>
                    <CardTitle>Daily Report Submission ({profile.role})</CardTitle>
                </CardHeader>
                <CardContent>
                    {FormComponent}
                </CardContent>
            </Card>
        </DashboardLayout>
    );
};

export default SubmitReport;