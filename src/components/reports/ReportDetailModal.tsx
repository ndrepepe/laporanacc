import { DailyReport, AccountingReport, CashierReport, ConsignmentStaffReport, SupervisorManagerReport } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useReportViewHistory, ReportViewLog } from '@/hooks/use-report-view-history';
import { Clock, User, CheckCircle, Eye, ShieldCheck } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';
import { cn } from '@/lib/utils';

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

const ManagerViewStatus: React.FC<{ timestamp: string | null; role: string }> = ({ timestamp, role }) => {
    if (!timestamp) return null;
    
    const formattedTime = format(new Date(timestamp), 'MMM dd, yyyy HH:mm');
    
    return (
        <div className={cn(
            "flex items-center p-2 rounded-lg text-xs font-medium",
            role === 'Senior Manager' ? "bg-purple-500/20 text-purple-600 dark:bg-purple-800/30 dark:text-purple-300" : "bg-blue-500/20 text-blue-600 dark:bg-blue-800/30 dark:text-blue-300"
        )}>
            <ShieldCheck className="h-4 w-4 mr-2" />
            Viewed by {role} on {formattedTime}
        </div>
    );
};

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({ report, isOpen, onClose }) => {
  const { t } = useLanguage();
  
  if (!report) return null;

  // Fetch view history for the current report
  const { data: viewHistory, isLoading: isLoadingHistory, isError: isErrorHistory } = useReportViewHistory(report.id);
  const isViewed = (viewHistory?.length || 0) > 0;

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
            {t('view_details')}
            <Badge variant="secondary" className="ml-2 neon-glow">
              {report.type.replace('_', ' ').toUpperCase()}
            </Badge>
          </DialogTitle>
        </DialogHeader>
        <ScrollArea className="flex-grow pr-4">
          <div className="space-y-4 pb-4">
            {/* Manager View Status Indicators */}
            <div className="space-y-2">
                <ManagerViewStatus 
                    timestamp={report.accounting_manager_viewed_at} 
                    role="Accounting Manager" 
                />
                <ManagerViewStatus 
                    timestamp={report.senior_manager_viewed_at} 
                    role="Senior Manager" 
                />
            </div>
            
            {/* Submission Info */}
            <div className="grid grid-cols-2 gap-x-4 text-sm border-b pb-3 border-border/50">
              <div>
                <p className="font-medium text-muted-foreground">{t('date')}:</p>
                <p className="text-foreground font-semibold">{format(new Date(report.report_date), 'PPP')}</p>
              </div>
              <div>
                <p className="font-medium text-muted-foreground">{t('submitter')}:</p>
                <p className="text-foreground font-semibold">
                  {report.profile?.first_name || 'Unknown'} {report.profile?.last_name || ''} ({report.profile?.role || 'Unknown Role'})
                </p>
              </div>
            </div>
            
            {/* Report Specific Details */}
            {renderDetails()}
            
            {/* View History Section */}
            <div className="pt-4 border-t border-border/50">
              <h3 className="text-lg font-semibold mb-3 flex items-center">
                <Clock className="h-5 w-5 mr-2 text-primary" />
                {t('view_history_title')}
              </h3>
              
              {isLoadingHistory && <p className="text-sm text-muted-foreground">Loading view history...</p>}
              {isErrorHistory && <p className="text-sm text-red-500">Error loading view history.</p>}
              
              {!isLoadingHistory && !isErrorHistory && (
                <>
                  {/* Viewed Status Indicator */}
                  <div className="mb-4 p-3 rounded-lg border"
                       style={{ backgroundColor: isViewed ? 'hsl(var(--primary) / 0.1)' : 'hsl(var(--muted) / 0.5)' }}>
                    <p className="text-sm font-medium flex items-center">
                      {isViewed ? (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2 text-primary" />
                          {t('viewed_status')}: <span className="ml-1 font-bold text-primary">{t('viewed')}</span>
                        </>
                      ) : (
                        <>
                          <Eye className="h-4 w-4 mr-2 text-muted-foreground" />
                          {t('viewed_status')}: <span className="ml-1 font-bold text-muted-foreground">{t('not_yet_viewed')}</span>
                        </>
                      )}
                    </p>
                  </div>

                  {/* Viewer List */}
                  {isViewed && (
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-muted-foreground">{t('viewed_by')}:</p>
                      {viewHistory?.map((log: ReportViewLog) => (
                        <div key={log.id} className="flex items-center justify-between p-2 bg-secondary/50 rounded-md">
                          <div className="flex items-center">
                            <User className="h-4 w-4 mr-2 text-accent" />
                            <span className="text-sm font-medium">
                              {/* Safely access profile properties */}
                              {log.viewer_profile?.first_name || 'Unknown'} {log.viewer_profile?.last_name || ''}
                            </span>
                          </div>
                          <div className="text-right">
                            <Badge variant="secondary" className="text-xs mr-2">{log.viewer_profile?.role || 'Unknown Role'}</Badge>
                            <span className="text-xs text-muted-foreground">
                              {t('viewed_on')} {format(new Date(log.viewed_at), 'MMM dd, HH:mm')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default ReportDetailModal;