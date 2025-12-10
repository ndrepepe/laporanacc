import { DailyReport, AccountingReport, CashierReport, ConsignmentStaffReport, SupervisorManagerReport } from "@/lib/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useLpkEntries } from "@/hooks/use-lpk-entries";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface ReportDetailModalProps {
    report: DailyReport | null;
    isOpen: boolean;
    onClose: () => void;
}

const DetailItem: React.FC<{ label: string; value: React.ReactNode }> = ({ label, value }) => (
    <div className="flex justify-between py-2 border-b last:border-b-0">
        <span className="text-sm font-medium text-muted-foreground">{label}</span>
        <span className="text-sm font-semibold text-foreground text-right">{value}</span>
    </div>
);

const renderAccountingDetails = (report: AccountingReport) => (
    <div className="space-y-4">
        <DetailItem label="New Customers Count" value={report.new_customers_count} />
        <DetailItem label="New Sales Count" value={report.new_sales_count} />
        <DetailItem label="Worked on LPH" value={report.worked_on_lph ? "Yes" : "No"} />
        <DetailItem label="Customer Confirmation" value={<Badge variant={report.customer_confirmation_status === 'Successful' ? 'default' : 'destructive'}>{report.customer_confirmation_status}</Badge>} />
        
        <Separator />
        <h4 className="font-semibold mt-4">Customer & Sales Names</h4>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.new_customers_names}</p>
        <h4 className="font-semibold mt-4">New Sales Names</h4>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.new_sales_names}</p>
    </div>
);

const renderCashierDetails = (report: CashierReport) => (
    <div className="space-y-4">
        <DetailItem label="Payments Count" value={report.payments_count} />
        <DetailItem label="Total Payments (IDR)" value={report.total_payments.toLocaleString('id-ID')} />
        <DetailItem label="Worked on LPH" value={report.worked_on_lph ? "Yes" : "No"} />
        <DetailItem label="Customer Confirmation Done" value={report.customer_confirmation_done ? "Yes" : "No"} />
    </div>
);

const renderConsignmentStaffDetails = (report: ConsignmentStaffReport) => {
    const { data: lpkEntries, isLoading: isLoadingLpk } = useLpkEntries(report.id);

    return (
        <div className="space-y-4">
            <DetailItem label="Received LPK" value={report.received_lpk ? "Yes" : "No"} />
            <DetailItem label="LPK Entered Bsoft" value={report.lpk_entered_bsoft} />
            
            {report.received_lpk && (
                <>
                    <Separator />
                    <h4 className="font-semibold mt-4">LPK Entries Received</h4>
                    {isLoadingLpk ? (
                        <p className="text-sm text-muted-foreground">Loading LPK entries...</p>
                    ) : lpkEntries && lpkEntries.length > 0 ? (
                        <div className="border rounded-md">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Branch Name</TableHead>
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
                </>
            )}

            <Separator />
            <h4 className="font-semibold mt-4">Tasks Completed</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.tasks_completed}</p>
            
            <h4 className="font-semibold mt-4">Issues Encountered</h4>
            <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.issues_encountered}</p>

            {report.suggestions && (
                <>
                    <h4 className="font-semibold mt-4">Suggestions</h4>
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.suggestions}</p>
                </>
            )}
        </div>
    );
};

const renderSupervisorManagerDetails = (report: SupervisorManagerReport) => (
    <div className="space-y-4">
        <h4 className="font-semibold mt-4">Tasks Completed</h4>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.tasks_completed}</p>
        
        <h4 className="font-semibold mt-4">Issues Encountered</h4>
        <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.issues_encountered}</p>

        {report.suggestions && (
            <>
                <h4 className="font-semibold mt-4">Suggestions</h4>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{report.suggestions}</p>
            </>
        )}
    </div>
);

const ReportDetailModal: React.FC<ReportDetailModalProps> = ({ report, isOpen, onClose }) => {
    if (!report) return null;

    const renderDetails = () => {
        switch (report.type) {
            case 'accounting':
                return renderAccountingDetails(report as AccountingReport);
            case 'cashier':
                return renderCashierDetails(report as CashierReport);
            case 'consignment_staff':
                return renderConsignmentStaffDetails(report as ConsignmentStaffReport);
            case 'supervisor_manager':
                return renderSupervisorManagerDetails(report as SupervisorManagerReport);
            default:
                return <p>Unknown report type.</p>;
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl">Daily Report Details</DialogTitle>
                    <DialogDescription>
                        Report submitted by {report.profile.first_name} {report.profile.last_name} ({report.profile.role}) on {format(new Date(report.report_date), 'PPP')}.
                    </DialogDescription>
                </DialogHeader>
                
                <Separator />

                <div className="py-4">
                    {renderDetails()}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default ReportDetailModal;