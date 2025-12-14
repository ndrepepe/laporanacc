import React, { useState } from 'react';
import type { ReportFilters } from '@/lib/types';
import { UserRole } from '@/lib/roles';
import { Button } from '@/components/Button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { CalendarIcon, Filter, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface ReportFiltersProps {
    onFilterChange: (filters: ReportFilters) => void;
    initialFilters: ReportFilters;
}

// List of all possible roles for filtering
const ALL_ROLES: UserRole[] = [
    'Accounting Staff',
    'Cashier',
    'Consignment Staff',
    'Consignment Supervisor',
    'Accounting Manager',
    'Senior Manager',
];

const ReportFilters: React.FC<ReportFiltersProps> = ({ onFilterChange, initialFilters }) => {
    const [filters, setFilters] = useState<ReportFilters>(initialFilters);
    const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
        from: initialFilters.startDate ? new Date(initialFilters.startDate) : undefined,
        to: initialFilters.endDate ? new Date(initialFilters.endDate) : undefined,
    });

    const handleDateChange = (range: { from?: Date; to?: Date } | undefined) => {
        if (!range) return;
        
        setDateRange(range);
        
        const newFilters: ReportFilters = {
            ...filters,
            startDate: range.from ? format(range.from, 'yyyy-MM-dd') : undefined,
            endDate: range.to ? format(range.to, 'yyyy-MM-dd') : undefined,
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleRoleChange = (role: UserRole | 'All') => {
        const newFilters: ReportFilters = {
            ...filters,
            role: role === 'All' ? undefined : role,
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const employeeName = e.target.value;
        const newFilters: ReportFilters = {
            ...filters,
            employeeName: employeeName.trim() === '' ? undefined : employeeName,
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleClearFilters = () => {
        const clearedFilters: ReportFilters = {};
        setFilters(clearedFilters);
        setDateRange({});
        onFilterChange(clearedFilters);
    };
    
    const isFiltered = Object.values(filters).some(value => value !== undefined && value !== null && value !== '');

    return (
        <div className="flex flex-wrap items-center gap-4 p-4 border border-border/50 rounded-lg bg-card shadow-lg">
            
            {/* Date Range Filter */}
            <Popover>
                <PopoverTrigger asChild>
                    <Button
                        id="date"
                        variant={"outline"}
                        className={cn(
                            "w-full md:w-[240px] justify-start text-left font-normal",
                            !dateRange.from && "text-muted-foreground"
                        )}
                    >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {dateRange.from ? (
                            dateRange.to ? (
                                <>
                                    {format(dateRange.from, "LLL dd, y")} -{" "}
                                    {format(dateRange.to, "LLL dd, y")}
                                </>
                            ) : (
                                format(dateRange.from, "LLL dd, y")
                            )
                        ) : (
                            <span>Pick a date range</span>
                        )}
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 dark:glass-effect" align="start">
                    <Calendar
                        initialFocus
                        mode="range"
                        defaultMonth={dateRange.from}
                        selected={dateRange as any}
                        onSelect={handleDateChange as any}
                        numberOfMonths={2}
                    />
                </PopoverContent>
            </Popover>

            {/* Role Filter */}
            <Select 
                value={filters.role || 'All'} 
                onValueChange={handleRoleChange as (value: string) => void}
            >
                <SelectTrigger className="w-full md:w-[180px]">
                    <Filter className="h-4 w-4 mr-2 text-muted-foreground" />
                    <SelectValue placeholder="Filter by Role" />
                </SelectTrigger>
                <SelectContent className="dark:glass-effect">
                    <SelectItem value="All">All Roles</SelectItem>
                    {ALL_ROLES.map(role => (
                        <SelectItem key={role} value={role}>{role}</SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {/* Employee Name Filter (Client-side filtering) */}
            <Input
                placeholder="Filter by Employee Name"
                className="w-full md:w-[200px]"
                value={filters.employeeName || ''}
                onChange={handleNameChange}
            />
            
            {/* Clear Filters Button */}
            {isFiltered && (
                <Button variant="ghost" onClick={handleClearFilters} className="text-destructive hover:text-destructive">
                    <X className="h-4 w-4 mr-2" /> Clear Filters
                </Button>
            )}
        </div>
    );
};

export default ReportFilters;