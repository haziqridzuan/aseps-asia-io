
import { useState } from "react";
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
import { DateRangeFilter } from "./DateRangeFilter";
import { PurchaseOrder, Supplier } from "@/contexts/DataContext";

interface SupplierSpendingChartProps {
  purchaseOrders: PurchaseOrder[];
  suppliers: Supplier[];
}

export function SupplierSpendingChart({ purchaseOrders, suppliers }: SupplierSpendingChartProps) {
  const [dateRange, setDateRange] = useState("all");

  // Filter data based on date range
  const filterByDateRange = (date: string) => {
    if (dateRange === "all") return true;
    
    const itemDate = new Date(date);
    const today = new Date();
    
    if (dateRange === "month") {
      // Last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(today.getDate() - 30);
      return itemDate >= thirtyDaysAgo;
    } else if (dateRange === "quarter") {
      // Last 90 days
      const ninetyDaysAgo = new Date();
      ninetyDaysAgo.setDate(today.getDate() - 90);
      return itemDate >= ninetyDaysAgo;
    } else if (dateRange === "year") {
      // Last 365 days
      const yearAgo = new Date();
      yearAgo.setDate(today.getDate() - 365);
      return itemDate >= yearAgo;
    }
    
    return false;
  };

  // Filter POs by date range
  const filteredPOs = purchaseOrders.filter(po => filterByDateRange(po.issuedDate));

  // Calculate spent by supplier
  const spentBySupplier = suppliers.map(supplier => {
    // Get all POs for this supplier
    const supplierPOs = filteredPOs.filter(po => po.supplierId === supplier.id);
    
    // Calculate total spent from these POs
    const totalSpent = supplierPOs.reduce((sum, po) => {
      // Sum up all parts in the PO
      const poTotal = po.parts.reduce((partSum, part) => {
        return partSum + (part.quantity * (Math.floor(Math.random() * 1000) + 100)); // Random cost per part for demo
      }, 0);
      
      return sum + poTotal;
    }, 0);
    
    return {
      name: supplier.name.length > 15 ? supplier.name.substring(0, 15) + "..." : supplier.name,
      supplierId: supplier.id,
      spent: totalSpent,
    };
  }).filter(item => item.spent > 0) // Only include suppliers with spent > 0
    .sort((a, b) => b.spent - a.spent) // Sort by spent in descending order
    .slice(0, 8); // Show top 8 suppliers

  // Generate colors for supplier chart
  const supplierColors = [
    "#3b82f6", "#22c55e", "#f59e0b", "#ef4444", 
    "#8b5cf6", "#06b6d4", "#ec4899", "#10b981"
  ];

  return (
    <Card className="card-hover">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle>Amount Spent by Supplier</CardTitle>
        <DateRangeFilter dateRange={dateRange} setDateRange={setDateRange} />
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={spentBySupplier}
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
                fill={supplierColors[0]}
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
