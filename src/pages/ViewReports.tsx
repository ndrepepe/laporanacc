import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
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
import { Button } from "@/components/Button";
import { Pencil, Eye } from "lucide-react";
import ReportEditWrapper from "@/components/reports/ReportEditWrapper";
import { ReportType } from "@/lib/report-constants";

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

const MyReports = () => {
  const { profile } = useAuth(); 
  // Use 'self' scope to only fetch reports submitted by the current user
  const { data: reports, isLoading, isError, error, refetch } = useDailyReports('self');
  
  const [selectedReport, setSelectedReport] = useState<DailyReport | null>(null);
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editReportId, setEditReportId] = useState<string | null>(null);
  const [editReportType, setEditReportType] = useState<ReportType | null>(null);

  const handleViewDetails = (report: DailyReport) => {
    setSelectedReport(report);
  };
  
  const handleEditReport = (report: DailyReport) => {
    setEditReportId(report.id);
    setEditReportType(report.type);
    setIsEditModalOpen(true);
  };
  
  const handleEditSuccess = () => {
    setIsEditModalOpen(false);
    setEditReportId(null);
    setEditReportType(null);
    // Refetch the list of reports after a successful edit
    refetch();
  };

  if (isLoading) {
    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-6 tracking-wider text-gradient">My Daily Reports</h1>
            <Card><CardContent><Skeleton className="h-64 w-full" /></CardContent></Card>
        </DashboardLayout>
    );
  }

  if (isError) {
    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-6 tracking-wider text-gradient">My Daily Reports</h1>
            <Card><CardContent className="p-6 text-red-500">Error loading reports: {error?.message || "Unknown error"}</CardContent></Card>
        </DashboardLayout>
    );
  }

  if (!reports || reports.length === 0) {
    return (
        <DashboardLayout>
            <h1 className="text-3xl font-bold mb-6 tracking-wider text-gradient">My Daily Reports</h1>
            <Card><CardContent className="p-6">You have not submitted any reports yet.</CardContent></Card>
        </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6 tracking-wider text-gradient">My Daily Reports</h1>
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
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {reports.map((report) => (
                  <TableRow 
                    key={report.id} 
                    className="hover:bg-accent/10 transition-colors"
                  >
                    <TableCell className="font-medium">
                      {format(new Date(report.report_date), 'PPP')}
                    </TableCell>
                    <TableCell>
                      <ReportTypeBadge type={report.type} />
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleViewDetails(report)}
                      >
                        <Eye className="h-4 w-4 mr-1" /> View
                      </Button>
                      <Button 
                        variant="secondary" 
                        size="sm" 
                        onClick={() => handleEditReport(report)}
                      >
                        <Pencil className="h-4 w-4 mr-1" /> Edit
                      </Button>
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
      
      <ReportEditWrapper
        reportId={editReportId}
        reportType={editReportType}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={handleEditSuccess}
      />
    </DashboardLayout>
  );
};

export default MyReports;