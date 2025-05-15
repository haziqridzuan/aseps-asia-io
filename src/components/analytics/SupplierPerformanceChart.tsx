
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

interface SupplierPerformanceData {
  name: string;
  rating: number;
  onTimeDelivery: number;
}

interface SupplierPerformanceChartProps {
  data: SupplierPerformanceData[];
}

export function SupplierPerformanceChart({ data }: SupplierPerformanceChartProps) {
  return (
    <Card className="card-hover">
      <CardHeader>
        <CardTitle>Supplier Performance</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              layout="vertical"
              margin={{
                top: 20,
                right: 30,
                left: 90,
                bottom: 5,
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" domain={[0, 100]} />
              <YAxis dataKey="name" type="category" width={80} />
              <Tooltip />
              <Legend />
              <Bar dataKey="onTimeDelivery" name="On-Time Delivery (%)" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              <Bar dataKey="rating" name="Rating (out of 5)" fill="#f59e0b" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
