import React from 'react';
import { ReportType } from "@/lib/report-constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Loader2 } from 'lucide-react';
import { useSingleReport } from '@/hooks/use-reports';
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
  const { data: report, isLoading, isError, error } = useSingleReport(reportId, reportType);

  if (!isOpen) return null;

  const renderEditForm = () => {
    if (isLoading) {
      return (
        <div className="flex flex-col items-center justify-center p-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Loading report data...</p>
        </div>
      );
    }

    if (isError || !report) {
      return (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {error?.message || "Failed to load report data for editing."}
          </AlertDescription>
        </Alert>
      );
    }

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
        return (
          <Alert variant="destructive">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>Unknown report type for editing.</AlertDescription>
          </Alert>
        );
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col dark:glass-effect">
        <DialogHeader>
          <DialogTitle className="text-xl tracking-wide">
            Edit Daily Report ({reportType?.replace('_', ' ').toUpperCase()})
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-4">
          <div className="space-y-4 pb-4">
            {renderEditForm()}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ReportEditWrapper;