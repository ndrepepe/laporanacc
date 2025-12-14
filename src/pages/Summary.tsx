import DashboardLayout from "@/components/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { useSummaryData, DailyMetric, MonthlyMetric } from "@/hooks/use-summary-data";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertTriangle, DollarSign, Users, FileText } from "lucide-react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import DailySubmissionStatus from "@/components/summary/DailySubmissionStatus";

const MetricCard: React.FC<{ title: string; value: string | number; icon: React.ReactNode }> = ({ title, value, icon }) => (
    <Card className="transition-transform hover:scale-[1.02] duration-300">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium tracking-wider">{title}</CardTitle>
            {icon}
        </CardHeader>
        <CardContent>
            <div className="text-3xl font-bold text-primary">{value}</div>
        </CardContent>
    </Card>
);

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

const Summary = () => {
  const { data, isLoading, isError, error } = useSummaryData();

  if (isLoading) {
    return (
      <DashboardLayout>
        <h1 className="text-3xl font-bold mb-6 tracking-wider text-gradient">Statistical Summary</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-[100px]" />
            <Skeleton className="h-[100px]" />
            <Skeleton className="h-[100px]" />
            <Skeleton className="h-[100px]" />
        </div>
        <Card className="mt-6"><CardContent className="p-6"><Skeleton className="h-64 w-full" /></CardContent></Card>
      </DashboardLayout>
    );
  }

  if (isError) {
    return (
      <DashboardLayout>
        <h1 className="text-3xl font-bold mb-6 tracking-wider text-gradient">Statistical Summary</h1>
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error Loading Data</AlertTitle>
          <AlertDescription>
            Failed to load summary data: {error?.message || "Unknown error."}
          </AlertDescription>
        </Alert>
      </DashboardLayout>
    );
  }

  const monthly: MonthlyMetric = data?.monthly || {
    total_new_customers: 0,
    total_new_sales: 0,
    total_payments_count: 0,
    total_payments_amount: 0,
    total_lpk_entered: 0,
  };
  
  const daily: DailyMetric[] = data?.daily || [];

  return (
    <DashboardLayout>
      <h1 className="text-3xl font-bold mb-6 tracking-wider text-gradient">Statistical Summary</h1>
      
      {/* Daily Submission Status Tool */}
      <div className="mb-8">
        <DailySubmissionStatus />
      </div>

      {/* Monthly/Period Summary */}
      <h2 className="text-2xl font-semibold mb-4 tracking-wide">Period Totals (Last 30 Days)</h2>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard 
            title="Total New Customers" 
            value={monthly.total_new_customers} 
            icon={<Users className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard 
            title="Total New Sales" 
            value={monthly.total_new_sales} 
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard 
            title="Total Payments Count" 
            value={monthly.total_payments_count} 
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard 
            title="Total Payments Amount" 
            value={formatCurrency(monthly.total_payments_amount)} 
            icon={<DollarSign className="h-4 w-4 text-muted-foreground" />}
        />
        <MetricCard 
            title="Total LPK Entered" 
            value={monthly.total_lpk_entered} 
            icon={<FileText className="h-4 w-4 text-muted-foreground" />}
        />
      </div>

      {/* Daily Breakdown */}
      <h2 className="text-2xl font-semibold mt-8 mb-4 tracking-wide">Daily Breakdown</h2>
      <Card>
        <CardHeader>
            <CardTitle>Daily Metrics (Last 30 Days)</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
            {daily.length === 0 ? (
                <p className="p-6 text-muted-foreground">No report data available for the last 30 days.</p>
            ) : (
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Date</TableHead>
                                <TableHead>New Customers</TableHead>
                                <TableHead>New Sales</TableHead>
                                <TableHead>Payments Count</TableHead>
                                <TableHead>Payments Amount</TableHead>
                                <TableHead>LPK Entered</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {daily.map((day) => (
                                <TableRow key={day.date}>
                                    <TableCell className="font-medium">{format(new Date(day.date), 'MMM dd, yyyy')}</TableCell>
                                    <TableCell>{day.total_new_customers}</TableCell>
                                    <TableCell>{day.total_new_sales}</TableCell>
                                    <TableCell>{day.total_payments_count}</TableCell>
                                    <TableCell>{formatCurrency(day.total_payments_amount)}</TableCell>
                                    <TableCell>{day.total_lpk_entered}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            )}
        </CardContent>
      </Card>
    </DashboardLayout>
  );
};

export default Summary;