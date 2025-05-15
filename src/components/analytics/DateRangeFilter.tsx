
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { CalendarIcon, XCircle } from "lucide-react";

export interface DateRangeFilterProps {
  onDateRangeChange: (start: Date | undefined, end: Date | undefined) => void;
  startDate?: Date;
  endDate?: Date;
}

export function DateRangeFilter({ onDateRangeChange, startDate, endDate }: DateRangeFilterProps) {
  const [open, setOpen] = useState(false);
  const [tempStartDate, setTempStartDate] = useState<Date | undefined>(startDate);
  const [tempEndDate, setTempEndDate] = useState<Date | undefined>(endDate);
  
  const handleCalendarSelect = (date: Date | undefined) => {
    if (!tempStartDate) {
      setTempStartDate(date);
    } else if (!tempEndDate && date && date > tempStartDate) {
      setTempEndDate(date);
    } else {
      setTempStartDate(date);
      setTempEndDate(undefined);
    }
  };
  
  const applyDateRange = () => {
    onDateRangeChange(tempStartDate, tempEndDate);
    setOpen(false);
  };
  
  const clearDateRange = () => {
    setTempStartDate(undefined);
    setTempEndDate(undefined);
    onDateRangeChange(undefined, undefined);
    setOpen(false);
  };
  
  const displayText = () => {
    if (startDate && endDate) {
      return `${format(startDate, "MMM d, yyyy")} - ${format(endDate, "MMM d, yyyy")}`;
    }
    if (startDate) {
      return `From ${format(startDate, "MMM d, yyyy")}`;
    }
    return "Filter by Date";
  };
  
  return (
    <div className="flex items-center">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <CalendarIcon className="h-4 w-4" />
            <span>{displayText()}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <div className="p-4">
            <Calendar
              mode="single"
              selected={tempEndDate || tempStartDate}
              onSelect={handleCalendarSelect}
              initialFocus
            />
            <div className="mt-4 space-y-2">
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>
                  <div className="text-muted-foreground">Start Date</div>
                  <div className="font-medium">
                    {tempStartDate ? format(tempStartDate, "MMM d, yyyy") : "Not set"}
                  </div>
                </div>
                <div>
                  <div className="text-muted-foreground">End Date</div>
                  <div className="font-medium">
                    {tempEndDate ? format(tempEndDate, "MMM d, yyyy") : "Not set"}
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between pt-4">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearDateRange}
                  className="flex items-center gap-1"
                >
                  <XCircle className="h-4 w-4" />
                  Clear
                </Button>
                <Button 
                  size="sm" 
                  onClick={applyDateRange} 
                  disabled={!tempStartDate}
                >
                  Apply
                </Button>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
