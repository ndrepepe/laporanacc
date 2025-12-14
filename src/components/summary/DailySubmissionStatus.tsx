import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { CalendarIcon, User } from 'lucide-react';
import { format, startOfDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useDailySubmissionStatus } from '@/hooks/use-daily-submission-status';
import { Skeleton } from '@/components/ui/skeleton';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

const DailySubmissionStatus: React.FC = () => {
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
                colorClass = "bg-blue-100 text-blue-800";
                break;
            case 'cashier':
                colorClass = "bg-green-100 text-green-800";
                break;
            case 'consignment_staff':
                colorClass = "bg-yellow-100 text-yellow-800";
                break;
            case 'supervisor_manager':
                colorClass = "bg-purple-100 text-purple-800";
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
                    <CardTitle>Daily Submission Status</CardTitle>
                    <Button variant={"outline"} disabled>
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {format(selectedDate, "PPP")}
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
                    <CardTitle>Daily Submission Status</CardTitle>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant={"outline"}>
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(selectedDate, "PPP")}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="end">
                            <Calendar
                                mode="single"
                                selected={selectedDate}
                                onSelect={handleDateSelect}
                                initialFocus
                            />
                        </PopoverContent>
                    </Popover>
                </CardHeader>
                <CardContent className="p-0">
                    <p className="p-6 text-red-500">
                        Failed to load submission data: {error?.message || "Unknown error"}
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Daily Submission Status</CardTitle>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button variant={"outline"}>
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {format(selectedDate, "PPP")}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="end">
                        <Calendar
                            mode="single"
                            selected={selectedDate}
                            onSelect={handleDateSelect}
                            initialFocus
                        />
                    </PopoverContent>
                </Popover>
            </CardHeader>
            <CardContent className="p-0">
                {submissions && submissions.length > 0 ? (
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>User</TableHead>
                                    <TableHead>Role</TableHead>
                                    <TableHead>Reports Submitted</TableHead>
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
                ) : (
                    <p className="p-6 text-muted-foreground text-center">
                        No reports submitted on {format(selectedDate, 'PPP')}.
                    </p>
                )}
            </CardContent>
        </Card>
    );
};

export default DailySubmissionStatus;