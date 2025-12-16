import React, { useEffect } from 'react';
import { DailyReport } from "@/lib/types";
import { ReportType } from "@/lib/report-constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useSingleReport } from '@/hooks/use-reports';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import ReportEditAccounting from './ReportEditAccounting';
import ReportEditCashier from './ReportEditCashier';
import ReportEditConsignmentStaff from './ReportEditConsignmentStaff';
import ReportEditSupervisorManager from './ReportEditSupervisorManager';

interface ReportEditWrapperProps {
  reportId: string | null;
  reportType: ReportType | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const ReportEditWrapper: React.FC<ReportEditWrapperProps> = ({ reportId, reportType, isOpen, onClose, onSuccess }) => {
  const { data: reportData, isLoading, isError, error, refetch } = useSingleReport(reportId, reportType);

  useEffect(() => {
    if (isOpen && reportId && reportType) {
      // Refetch data when modal opens to ensure fresh data for editing
      refetch();
    }
  }, [isOpen, reportId, reportType, refetch]);

  const renderEditForm = (report: DailyReport) => {
    // We need to cast the report to ensure TypeScript knows the specific fields exist
    switch (report.type) {
      case 'accounting':
        return <ReportEditAccounting report={report as any} onSuccess={onSuccess} />;
      case 'cashier':
        return <ReportEditCashier report={report as any} onSuccess={onSuccess} />;
      case 'consignment_staff':
        return <ReportEditConsignmentStaff report={report as any} onSuccess={onSuccess} />;
      case 'supervisor_manager':
        return <ReportEditSupervisorManager report={report as any} onSuccess={onSuccess} />;
      default:
        return <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>Unknown report type for editing.</AlertDescription></Alert>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col dark:glass-effect">
        <DialogHeader>
          <DialogTitle className="text-xl tracking-wide">Edit Daily Report ({reportType?.replace('_', ' ').toUpperCase()})</DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-4">
          <div className="space-y-4 pb-4">
            {isLoading && <Skeleton className="h-64 w-full" />}
            {isError && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertTitle>Error Loading Report</AlertTitle>
                <AlertDescription>{error?.message || "Failed to load report data for editing."}</AlertDescription>
              </Alert>
            )}
            {reportData && renderEditForm(reportData)}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ReportEditWrapper;