import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/Card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/Button';
import { CalendarIcon, User } from 'lucide-react';
import { format, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useDailySubmissionStatus } from '@/hooks/use-daily-submission-status';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/contexts/LanguageContext';
import { ScrollArea } from '@/components/ui/scroll-area';

// Import useLanguage

const DailySubmissionStatus: React.FC = () => {
  const { t } = useLanguage(); // Use translation hook

  // Default to today's date
  const [selectedDate, setSelectedDate] = useState<Date>(startOfDay(new Date()));
  const dateString = format(selectedDate, 'yyyy-MM-dd');
  const { data: submissions, isLoading, isError, error } = useDailySubmissionStatus(dateString);

  const handleDateSelect = (date: Date | undefined) => {
    if (date) {
      setSelectedDate(startOfDay(date));
    }
  };

  const ReportTypeBadge = ({ type }: { type: string }) => {
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
      default:
        colorClass = "bg-gray-200 text-gray-800";
    }
    return <Badge className={cn("text-xs", colorClass)}>{type.replace('_', ' ').toUpperCase()}</Badge>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('daily_submission_status')}</CardTitle>
          <Button variant={"outline"} disabled>
            <CalendarIcon className="mr-2 h-4 w-4" />
            {format(selectedDate, "MMM dd, yyyy")}
          </Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isError) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{t('daily_submission_status')}</CardTitle>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant={"outline"}>
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(selectedDate, "MMM dd, yyyy")}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0 dark:glass-effect" align="end">
              <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} initialFocus />
            </PopoverContent>
          </Popover>
        </CardHeader>
        <CardContent className="p-0">
          <p className="p-6 text-red-500">
            {t('failed_to_load_submission_data')}: {error?.message || t('unknown_error')}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{t('daily_submission_status')}</CardTitle>
        <Popover>
          <PopoverTrigger asChild>
            <Button variant={"outline"} className="w-auto">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {format(selectedDate, "MMM dd, yyyy")}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0 dark:glass-effect" align="end">
            <Calendar mode="single" selected={selectedDate} onSelect={handleDateSelect} initialFocus />
          </PopoverContent>
        </Popover>
      </CardHeader>
      <CardContent className="p-0">
        {submissions && submissions.length > 0 ? (
          <ScrollArea className="h-[400px]">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t('user')}</TableHead>
                    <TableHead>{t('role')}</TableHead>
                    <TableHead>{t('reports_submitted')}</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {submissions.map((sub) => (
                    <TableRow key={sub.user_id}>
                      <TableCell className="font-medium flex items-center">
                        <User className="h-4 w-4 mr-2 text-muted-foreground" />
                        {sub.name}
                      </TableCell>
                      <TableCell>{sub.role}</TableCell>
                      <TableCell className="space-x-1">
                        {sub.report_types.map(type => (
                          <ReportTypeBadge key={`${sub.user_id}-${type}`} type={type} />
                        ))}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        ) : (
          <p className="p-6 text-muted-foreground text-center">
            {t('no_reports_submitted_on', { date: format(selectedDate, 'PPP') })}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default DailySubmissionStatus;