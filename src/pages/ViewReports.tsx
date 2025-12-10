import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useDailyReports } from "@/hooks/use-reports";
import { Skeleton } from "@/components/ui/skeleton";
import { DailyReport } from "@/lib/types";
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

const ViewReports = () => {
  const { profile } = useAuth();
  const { data: reports, isLoading, isError } = useDailyReports();

  if (isLoading) {
    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-6">View Employee Reports</h1>
            <Card><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
        </DashboardLayout>
    );
  }

  if (isError) {
    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-6">View Employee Reports</h1>
            <Card><CardContent className="p-6 text-red-500">Error loading reports.</CardContent></Card>
        </DashboardLayout>
    );
  }

  if (!reports || reports.length === 0) {
    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-6">View Employee Reports</h1>
            <Card><CardContent className="p-6">No reports found for your viewing permissions.</CardContent></Card>
        </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">View Employee Reports</h1>
      <Card>
        <CardHeader>
          <CardTitle>Reports Viewable by {profile?.role}</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Submitter</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Report Type</TableHead>
                  <TableHead className="text-right">Details</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow key={report.id}>
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
                      {/* Placeholder for future detail view */}
                      <Badge variant="outline">View</Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default ViewReports;