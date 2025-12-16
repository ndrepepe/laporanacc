import { DailyReport, AccountingReport, CashierReport, ConsignmentStaffReport, SupervisorManagerReport } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

interface ReportDetailModalProps {
  report: DailyReport | null;
  isOpen: boolean;
  onClose: () => void;
}

const DetailItem = ({ label, value }: { label: string; value: string | number | boolean }) => (
  <div className="flex justify-between py-2 border-b border-border/50 last:border-b-0">
    <span className="text-sm font-medium text-muted-foreground">{label}</span>
    <span className="text-sm font-semibold text-foreground">
      {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
    </span>
  </div>
);

const renderAccountingDetails = (report: DailyReport) => {
  const accReport = report as AccountingReport & DailyReport;
  return (
    <div className="space-y-2">
      <DetailItem label="New Customers Count" value={accReport.new_customers_count} />
      <DetailItem label="New Sales Count" value={accReport.new_sales_count} />
      <DetailItem label="Worked on LPH" value={accReport.worked_on_lph} />
      <DetailItem label="Customer Confirmation Status" value={accReport.customer_confirmation_status} />
      <h4 className="font-semibold mt-4 pt-4 border-t border-border/50">New Customer Names</h4>
      <p className="text-sm text-foreground/80 whitespace-pre-wrap p-2 bg-muted/50 rounded-md">{accReport.new_customers_names}</p>
      <h4 className="font-semibold mt-4">New Sales Names</h4>
      <p className="text-sm text-foreground/80 whitespace-pre-wrap p-2 bg-muted/50 rounded-md">{accReport.new_sales_names}</p>
    </div>
  );
};

const renderCashierDetails = (report: DailyReport) => {
  const cashierReport = report as CashierReport & DailyReport;
  return (
    <div className="space-y-2">
      <DetailItem label="Payments Count" value={cashierReport.payments_count} />
      <DetailItem label="Total Payments (IDR)" value={cashierReport.total_payments.toLocaleString('id-ID')} />
      <DetailItem label="Worked on LPH" value={cashierReport.worked_on_lph} />
      <DetailItem label="Customer Confirmation Done" value={cashierReport.customer_confirmation_done} />
    </div>
  );
};

const renderConsignmentStaffDetails = (report: DailyReport) => {
  const consignmentReport = report as ConsignmentStaffReport & DailyReport;
  return (
    <div className="space-y-4">
      <DetailItem label="LPK Count" value={consignmentReport.lpk_count} />
      <div className="space-y-2">
        <h4 className="font-semibold mt-4 pt-4 border-t border-border/50">Tasks Completed</h4>
        <p className="text-sm text-foreground/80 whitespace-pre-wrap p-2 bg-muted/50 rounded-md">{consignmentReport.tasks_completed}</p>
        <h4 className="font-semibold mt-4">Issues Encountered</h4>
        <p className="text-sm text-foreground/80 whitespace-pre-wrap p-2 bg-muted/50 rounded-md">{consignmentReport.issues_encountered}</p>
        {consignmentReport.suggestions && (
          <>
            <h4 className="font-semibold mt-4">Suggestions</h4>
            <p className="text-sm text-foreground/80 whitespace-pre-wrap p-2 bg-muted/50 rounded-md">{consignmentReport.suggestions}</p>
          </>
        )}
      </div>
    </div>
  );
};

const renderSupervisorManagerDetails = (report: DailyReport) => {
  const smReport = report as SupervisorManagerReport & DailyReport;
  return (
    <div className="space-y-2">
      <h4 className="font-semibold mt-4">Tasks Completed</h4>
      <p className="text-sm text-foreground/80 whitespace-pre-wrap p-2 bg-muted/50 rounded-md">{smReport.tasks_completed}</p>
      <h4 className="font-semibold mt-4">Issues Encountered</h4>
      <p className="text-sm text-foreground/80 whitespace-pre-wrap p-2 bg-muted/50 rounded-md">{smReport.issues_encountered}</p>
      {smReport.suggestions && (
        <>
          <h4 className="font-semibold mt-4">Suggestions</h4>
          <p className="text-sm text-foreground/80 whitespace-pre-wrap p-2 bg-muted/50 rounded-md">{smReport.suggestions}</p>
        </>
      )}
    </div>
  );
};

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({ report, isOpen, onClose }) => {
  if (!report) return null;

  const renderDetails = () => {
    switch (report.type) {
      case 'accounting':
        return renderAccountingDetails(report);
      case 'cashier':
        return renderCashierDetails(report);
      case 'consignment_staff':
        return renderConsignmentStaffDetails(report);
      case 'supervisor_manager':
        return renderSupervisorManagerDetails(report);
      default:
        return <p>Unknown report type.</p>;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col dark:glass-effect">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between text-xl tracking-wide">
            Report Details
            <Badge variant="secondary" className="ml-2 neon-glow">
              {report.type.replace('_', ' ').toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-4">
          <div className="space-y-4 pb-4">
            <div className="grid grid-cols-2 gap-x-4 text-sm border-b pb-3 border-border/50">
              <div>
                <p className="font-medium text-muted-foreground">Date Submitted:</p>
                <p className="text-foreground font-semibold">{format(new Date(report.report_date), 'PPP')}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">Submitted By:</p>
                <p className="text-foreground font-semibold">
                  {report.profile?.first_name || 'Unknown'} {report.profile?.last_name || ''} ({report.profile?.role || 'Unknown Role'})
                </p>
              </div>
            </div>
            {renderDetails()}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDetailModal;