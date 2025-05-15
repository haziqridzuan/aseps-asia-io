
import { CalendarRange } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useEffect, useState } from "react";
import { addDays, format, parseISO, startOfMonth, startOfYear, subMonths } from "date-fns";

export interface DateRangeFilterProps {
  dateRange?: string;
  setDateRange?: (value: string) => void;
  onRangeChange?: (start: Date | undefined, end: Date | undefined) => void;
  startDate?: Date | undefined;
  endDate?: Date | undefined;
}

export function DateRangeFilter({ 
  dateRange, 
  setDateRange, 
  onRangeChange,
  startDate,
  endDate 
}: DateRangeFilterProps) {
  const handleChange = (value: string) => {
    if (setDateRange) {
      setDateRange(value);
    }
    
    // Calculate date range based on selection
    if (onRangeChange) {
      const today = new Date();
      let start: Date | undefined;
      let end: Date | undefined = today;
      
      switch (value) {
        case "month":
          start = subMonths(today, 1);
          break;
        case "quarter":
          start = subMonths(today, 3);
          break;
        case "year":
          start = subMonths(today, 12);
          break;
        case "all":
        default:
          start = undefined;
          end = undefined;
          break;
      }
      
      onRangeChange(start, end);
    }
  };
  
  return (
    <div className="flex items-center gap-2">
      <CalendarRange className="h-4 w-4" />
      <Select 
        value={dateRange || "all"} 
        onValueChange={handleChange}
      >
        <SelectTrigger className="w-[150px]">
          <SelectValue placeholder="Date Range" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">All Time</SelectItem>
            <SelectItem value="month">Last 30 Days</SelectItem>
            <SelectItem value="quarter">Last Quarter</SelectItem>
            <SelectItem value="year">Last Year</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
