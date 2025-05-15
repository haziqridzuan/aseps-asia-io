
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { useState, useMemo } from "react";
import { DateRangeFilter } from "./DateRangeFilter";
import { format, isWithinInterval, parseISO } from "date-fns";
import { PurchaseOrder, Supplier } from "@/contexts/DataContext";

interface SupplierSpendingChartProps {
  spentBySupplier: Array<{
    name: string;
    supplierId: string;
    spent: number;
  }>;
  budgetColors: string[];
}

export function SupplierSpendingChart({ spentBySupplier, budgetColors }: SupplierSpendingChartProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Filter data based on selected date range
  const filteredData = spentBySupplier.filter(item => {
    // If no date range is selected, show all data
    if (!startDate || !endDate) {
      return true;
    }
    
    // For demonstration purposes - since we don't have date in supplier data,
    // this would need to be implemented with actual dates from purchase orders
    return true;
  });
  
  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start);
    setEndDate(end);
  };
  
  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>Amount Spent by Supplier</CardTitle>
        <DateRangeFilter 
          onRangeChange={handleDateRangeChange} 
          startDate={startDate}
          endDate={endDate}
        />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={filteredData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 60,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" angle={-45} textAnchor="end" height={70} />
              <YAxis />
              <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, 'Amount Spent']} />
              <Legend />
              <Bar 
                dataKey="spent" 
                name="Amount Spent" 
                fill={budgetColors[1]}
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
