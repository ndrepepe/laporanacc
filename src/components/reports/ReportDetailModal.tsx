import { DailyReport, AccountingReport, CashierReport, ConsignmentStaffReport, SupervisorManagerReport } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { useLpkEntries } from "@/hooks/use-lpk-entries";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

interface ReportDetailModalProps {
    report: DailyReport | null;
    isOpen: boolean;
    onClose: () => void;
}

const DetailItem = ({ label, value }: { label: string; value: string | number | boolean }) => (
    <div className="flex justify-between py-1 border-b last:border-b-0">
        <span className="text-sm font-medium text-gray-600">{label}</span>
        <span className="text-sm font-semibold text-gray-800">
            {typeof value === 'boolean' ? (value ? 'Yes' : 'No') : value}
        </span>
    </div>
);

const renderAccountingDetails = (report: DailyReport) => {
    // We cast to AccountingReport & DailyReport to ensure access to both specific fields and base fields
    const accReport = report as AccountingReport & DailyReport; 
    return (
        <div className="space-y-2">
            <DetailItem label="New Customers Count" value={accReport.new_customers_count} />
            <DetailItem label="New Sales Count" value={accReport.new_sales_count} />
            <DetailItem label="Worked on LPH" value={accReport.worked_on_lph} />
            <DetailItem label="Customer Confirmation Status" value={accReport.customer_confirmation_status} />
            
            <h4 className="font-semibold mt-4">New Customer Names</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{accReport.new_customers_names}</p>
            <h4 className="font-semibold mt-4">New Sales Names</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{accReport.new_sales_names}</p>
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
    
    // Fixes Error 6: 'id' is accessed from the full DailyReport type
    const { data: lpkEntries, isLoading: isLoadingLpk } = useLpkEntries(consignmentReport.id); 

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <DetailItem label="Received LPK" value={consignmentReport.received_lpk} />
                <DetailItem label="LPK Entered BSoft" value={consignmentReport.lpk_entered_bsoft} />
                <DetailItem label="Tasks Completed" value={consignmentReport.tasks_completed} />
                <DetailItem label="Issues Encountered" value={consignmentReport.issues_encountered} />
                {consignmentReport.suggestions && <DetailItem label="Suggestions" value={consignmentReport.suggestions} />}
            </div>

            <h3 className="text-lg font-bold mt-6">LPK Entries</h3>
            {isLoadingLpk ? (
                <Skeleton className="h-24 w-full" />
            ) : lpkEntries && lpkEntries.length > 0 ? (
                <div className="border rounded-lg overflow-hidden">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Branch</TableHead>
                                <TableHead className="text-right">Count</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {lpkEntries.map((entry) => (
                                <TableRow key={entry.id}>
                                    <TableCell>{entry.branch_name}</TableCell>
                                    <TableCell className="text-right">{entry.lpk_count}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            ) : (
                <p className="text-sm text-muted-foreground">No LPK entries recorded for this report.</p>
            )}
        </div>
    );
};

const renderSupervisorManagerDetails = (report: DailyReport) => {
    const smReport = report as SupervisorManagerReport & DailyReport;
    return (
        <div className="space-y-2">
            <DetailItem label="Tasks Completed" value={smReport.tasks_completed} />
            <DetailItem label="Issues Encountered" value={smReport.issues_encountered} />
            {smReport.suggestions && <DetailItem label="Suggestions" value={smReport.suggestions} />}
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
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] flex flex-col">
                <DialogHeader>
                    <DialogTitle className="flex items-center justify-between">
                        Report Details
                        <Badge variant="secondary" className="ml-2">
                            {report.type.replace('_', ' ').toUpperCase()}
                        </Badge>
                    </DialogTitle>
                </DialogHeader>
                
                <ScrollArea className="flex-grow pr-4">
                    <div className="space-y-4 pb-4">
                        <div className="grid grid-cols-2 gap-x-4 text-sm border-b pb-3">
                            <div>
                                <p className="font-medium">Date Submitted:</p>
                                <p className="text-muted-foreground">{format(new Date(report.report_date), 'PPP')}</p>
                            </div>
                            <div>
                                <p className="font-medium">Submitted By:</p>
                                <p className="text-muted-foreground">{report.profile.first_name} {report.profile.last_name} ({report.profile.role})</p>
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