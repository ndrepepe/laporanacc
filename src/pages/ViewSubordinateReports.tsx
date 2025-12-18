import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { useDailyReports } from "@/hooks/use-reports";
import { Skeleton } from "@/components/ui/skeleton";
import { DailyReport, ReportFilters as ReportFiltersType } from "@/lib/types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/integrations/supabase/auth";
import ReportDetailModal from "@/components/reports/ReportDetailModal";
import { useState } from "react";
import { logReportView } from "@/utils/activity-logger";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle } from "lucide-react";
import { UserRole } from "@/lib/roles";
import ReportFilters from "@/components/reports/ReportFilters";
import { Button } from "@/components/Button"; // Use custom Button
import { useLanguage } from "@/contexts/LanguageContext";
import { updateReportViewStatus } from "@/utils/update-report-view-status"; // Import new utility

// Helper function to render report type badge
const ReportTypeBadge = ({ type }: { type: DailyReport['type'] }) => {
    let colorClass = "bg-gray-200 text-gray-800";
    switch (type) {
        case 'accounting':
            colorClass = "bg-blue-500 text-white dark:bg-blue-800 dark:text-blue-100";
            break;
        case 'cashier':
            colorClass = "bg-green-500 text-white dark:bg-green-800 dark:text-green-100";
            break;
        case 'consignment_staff':
            colorClass = "bg-yellow-500 text-white dark:bg-yellow-800 dark:text-yellow-100";
            break;
        case 'supervisor_manager':
            colorClass = "bg-purple-500 text-white dark:bg-purple-800 dark:text-purple-100";
            break;
    }
    return <Badge className={colorClass}>{type.replace('_', ' ').toUpperCase()}</Badge>;
};

const ViewSubordinateReports = () => {
  const { profile, user } = useAuth();
  const { t } = useLanguage();
  const [filters, setFilters] = useState<ReportFiltersType>({});
  const { data: reports, isLoading, isError } = useDailyReports('subordinates', filters);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);

  const MANAGER_ROLES: UserRole[] = ['Senior Manager', 'Accounting Manager', 'Consignment Supervisor'];

  if (!profile || !MANAGER_ROLES.includes(profile.role)) {
    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-6 tracking-wider text-gradient">{t('view_subordinate_reports_title')}</h1>
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>{t('access_denied')}</AlertTitle>
                <AlertDescription>
                    {t('no_permission_subordinates')}
                </AlertDescription>
            </Alert>
        </DashboardLayout>
    );
  }

  const handleViewDetails = (report: DailyReport) => {
    setSelectedReport(report);
    
    if (user && profile && user.id !== report.user_id) {
        // 1. Log activity (for history table)
        logReportView(user.id, report.user_id, report.type, report.id);
        
        // 2. Update specific manager view status (for quick status display)
        updateReportViewStatus(profile.role, report.id, report.type);
    }
  };

  // Client-side filtering for employee name
  const filteredReports = reports?.filter(report => {
    if (!filters.employeeName) return true;
    
    const search = filters.employeeName.toLowerCase();
    const firstName = report.profile?.first_name?.toLowerCase() || '';
    const lastName = report.profile?.last_name?.toLowerCase() || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    return fullName.includes(search) || firstName.includes(search) || lastName.includes(search);
  }) || [];


  if (isLoading) {
    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-6 tracking-wider text-gradient">{t('view_subordinate_reports_title')}</h1>
            <Card><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
        </DashboardLayout>
    );
  }

  if (isError) {
    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-6 tracking-wider text-gradient">{t('view_subordinate_reports_title')}</h1>
            <Card><CardContent className="p-6 text-red-500">{t('error_loading_subordinate_reports')}</CardContent></Card>
        </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6 tracking-wider text-gradient">{t('view_subordinate_reports_title')}</h1>
      
      <div className="mb-6">
        <ReportFilters 
            onFilterChange={setFilters} 
            initialFilters={filters} 
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{t('reports_viewable_by')} {profile?.role}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredReports.length === 0 ? (
            <p className="p-6 text-muted-foreground">
                {reports && reports.length > 0 
                    ? t('no_reports_match_filters')
                    : t('no_subordinate_reports_found')
                }
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('date')}</TableHead>
                    <TableHead>{t('submitter')}</TableHead>
                    <TableHead>{t('role')}</TableHead>
                    <TableHead>{t('report_type')}</TableHead>
                    <TableHead className="text-right">{t('action')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow 
                      key={report.id} 
                      onClick={() => handleViewDetails(report)}
                      className="cursor-pointer hover:bg-accent/10 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {format(new Date(report.report_date), 'PPP')}
                      </TableCell>
                      <TableCell>
                        {report.profile?.first_name || 'Unknown'} {report.profile?.last_name || ''}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{report.profile?.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <ReportTypeBadge type={report.type} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="outline" size="sm">{t('view_details')}</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      
      <ReportDetailModal 
        report={selectedReport} 
        isOpen={!!selectedReport} 
        onClose={() => setSelectedReport(null)} 
      />
    </DashboardLayout>
  );
};

export default ViewSubordinateReports;