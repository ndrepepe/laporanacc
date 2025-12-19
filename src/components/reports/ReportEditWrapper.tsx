import React from 'react';
import { DailyReport } from "@/lib/types";
import { ReportType } from "@/lib/report-constants";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
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
  if (!reportId || !reportType) return null;

  // Mock data for now - in a real app, you'd fetch this
  const reportData: DailyReport = {
    id: reportId,
    user_id: 'mock-user-id',
    report_date: new Date().toISOString().split('T')[0],
    created_at: new Date().toISOString(),
    profile: {
      id: 'mock-profile-id',
      first_name: 'John',
      last_name: 'Doe',
      role: 'Accounting Staff',
      avatar_url: null,
      updated_at: null
    },
    type: reportType,
    accounting_manager_viewed_at: null,
    senior_manager_viewed_at: null,
    // Add type-specific fields based on reportType
    ...(reportType === 'accounting' && {
      new_customers_count: 5,
      new_customers_names: 'Customer A, Customer B',
      new_sales_count: 3,
      new_sales_names: 'Sale A, Sale B',
      worked_on_lph: true,
      customer_confirmation_status: 'Successful'
    }),
    ...(reportType === 'cashier' && {
      payments_count: 10,
      total_payments: 1500000,
      worked_on_lph: false,
      customer_confirmation_done: true,
      incentive_report_progress: 'Progress report text here'
    }),
    ...(reportType === 'consignment_staff' && {
      lpk_count: 20,
      tasks_completed: 'Task A, Task B',
      issues_encountered: 'Issue A',
      suggestions: 'Suggestion A'
    }),
    ...(reportType === 'supervisor_manager' && {
      tasks_completed: 'Supervision tasks',
      issues_encountered: 'Management issues',
      suggestions: 'Management suggestions'
    })
  } as DailyReport;

  const renderEditForm = (report: DailyReport) => {
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
            {renderEditForm(reportData)}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ReportEditWrapper;