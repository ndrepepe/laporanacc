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
import ReportDetailModal from "@/components/reports/ReportDetailModal";
import { useState } from "react";
import { logReportView } from "@/utils/activity-logger";

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

const MyReports = () => {
  const { profile, user } = useAuth();
  // Use 'self' scope to only fetch reports submitted by the current user
  const { data: reports, isLoading, isError, error } = useDailyReports('self');
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);

  const handleViewDetails = (report: DailyReport) => {
    setSelectedReport(report);
    
    // Log activity is not needed here since the user is viewing their own report
  };

  if (isLoading) {
    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-6">My Daily Reports</h1>
            <Card><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
        </DashboardLayout>
    );
  }

  if (isError) {
    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-6">My Daily Reports</h1>
            <Card><CardContent className="p-6 text-red-500">Error loading reports: {error?.message || "Unknown error"}</CardContent></Card>
        </DashboardLayout>
    );
  }

  if (!reports || reports.length === 0) {
    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-6">My Daily Reports</h1>
            <Card><CardContent className="p-6">You have not submitted any reports yet.</CardContent></Card>
        </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6">My Daily Reports</h1>
      <Card>
        <CardHeader>
          <CardTitle>Reports Submitted by You ({profile?.role})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Report Type</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow 
                    key={report.id} 
                    onClick={() => handleViewDetails(report)}
                    className="cursor-pointer hover:bg-muted/50 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {format(new Date(report.report_date), 'PPP')}
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

export default MyReports;