
import { CalendarRange } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface DateRangeFilterProps {
  dateRange: string;
  setDateRange: (value: string) => void;
}

export function DateRangeFilter({ dateRange, setDateRange }: DateRangeFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <CalendarRange className="h-4 w-4" />
      <Select value={dateRange} onValueChange={setDateRange}>
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
