
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
import { Project, PurchaseOrder } from "@/contexts/DataContext";

interface BudgetSpentChartProps {
  spentByProject: Array<{
    name: string;
    projectId: string;
    spent: number;
  }>;
  budgetColors: string[];
}

export function BudgetSpentChart({ spentByProject, budgetColors }: BudgetSpentChartProps) {
  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>Budget Spent Analysis by Project</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={spentByProject}
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
                fill={budgetColors[0]}
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
