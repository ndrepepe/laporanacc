import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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

// Helper function to render report type badge
const ReportTypeBadge = ({ type }: { type: DailyReport['type'] }) => {
    let colorClass = "bg-gray-200 text-gray-800";
    switch (type) {
        case 'accounting':
            colorClass = "bg-blue-100 text-blue-800 hover:bg-blue-200";
            break;
        case 'cashier':
            colorClass = "bg-green-100 text-green-800 hover:bg-green-200";
            break;
        case 'consignment_staff':
            colorClass = "bg-yellow-100 text-yellow-800 hover:bg-yellow-200";
            break;
        case 'supervisor_manager':
            colorClass = "bg-purple-100 text-purple-800 hover:bg-purple-200";
            break;
    }
    return <Badge className={colorClass}>{type.replace('_', ' ').toUpperCase()}</Badge>;
};

const ViewSubordinateReports = () => {
  const { profile, user } = useAuth();
  const [filters, setFilters] = useState<ReportFiltersType>({});
  const { data: reports, isLoading, isError } = useDailyReports('subordinates', filters);
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);

  const MANAGER_ROLES: UserRole[] = ['Senior Manager', 'Accounting Manager', 'Consignment Supervisor'];

  if (!profile || !MANAGER_ROLES.includes(profile.role)) {
    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-6">View Subordinate Reports</h1>
            <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Access Denied</AlertTitle>
                <AlertDescription>
                    You do not have permission to view subordinate reports.
                </AlertDescription>
            </Alert>
        </DashboardLayout>
    );
  }

  const handleViewDetails = (report: DailyReport) => {
    setSelectedReport(report);
    
    // Log activity since the viewer is a manager/supervisor viewing another user's report
    if (user && user.id !== report.user_id) {
        logReportView(user.id, report.user_id, report.type);
    }
  };

  // Client-side filtering for employee name
  const filteredReports = reports?.filter(report => {
    if (!filters.employeeName) return true;
    
    const search = filters.employeeName.toLowerCase();
    const firstName = report.profile.first_name?.toLowerCase() || '';
    const lastName = report.profile.last_name?.toLowerCase() || '';
    const fullName = `${firstName} ${lastName}`.trim();
    
    return fullName.includes(search) || firstName.includes(search) || lastName.includes(search);
  }) || [];


  if (isLoading) {
    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-6">View Subordinate Reports</h1>
            <Card><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
        </DashboardLayout>
    );
  }

  if (isError) {
    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-6">View Subordinate Reports</h1>
            <Card><CardContent className="p-6 text-red-500">Error loading subordinate reports.</CardContent></Card>
        </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">View Subordinate Reports</h1>
      
      <div className="mb-6">
        <ReportFilters 
            onFilterChange={setFilters} 
            initialFilters={filters} 
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Reports Viewable by {profile?.role}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredReports.length === 0 ? (
            <p className="p-6 text-muted-foreground">
                {reports && reports.length > 0 
                    ? "No reports match the current filters." 
                    : "No subordinate reports found for your viewing permissions."
                }
            </p>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Submitter</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Report Type</TableHead>
                    <TableHead className="text-right">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredReports.map((report) => (
                    <TableRow 
                      key={report.id} 
                      onClick={() => handleViewDetails(report)}
                      className="cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <TableCell className="font-medium">
                        {format(new Date(report.report_date), 'PPP')}
                      </TableCell>
                      <TableCell>
                        {report.profile.first_name} {report.profile.last_name}
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{report.profile.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <ReportTypeBadge type={report.type} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge variant="outline">View Details</Badge>
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