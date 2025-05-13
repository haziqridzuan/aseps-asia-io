
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import { StatCard } from "@/components/dashboard/StatCard";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChartBar } from "lucide-react";

export default function Analytics() {
  const { projects, suppliers, purchaseOrders } = useData();
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
  
  // Filter projects
  const filteredProjects = projects.filter(project => filterByDateRange(project.startDate));
  
  // Filter POs
  const filteredPOs = purchaseOrders.filter(po => filterByDateRange(po.issuedDate));
  
  // Project status data for chart
  const projectStatusData = [
    { name: "In Progress", value: filteredProjects.filter(p => p.status === "In Progress").length, color: "#3b82f6" },
    { name: "Completed", value: filteredProjects.filter(p => p.status === "Completed").length, color: "#22c55e" },
    { name: "Pending", value: filteredProjects.filter(p => p.status === "Pending").length, color: "#f59e0b" },
    { name: "Delayed", value: filteredProjects.filter(p => p.status === "Delayed").length, color: "#ef4444" },
  ].filter(item => item.value > 0);
  
  // Supplier performance data
  const supplierPerformanceData = suppliers
    .slice(0, 5)
    .map(supplier => ({
      name: supplier.name,
      rating: supplier.rating,
      onTimeDelivery: supplier.onTimeDelivery,
    }));
  
  // Timeline adherence data
  const timelineAdherenceData = [
    { name: "Jan", onTime: 85, delayed: 15 },
    { name: "Feb", onTime: 75, delayed: 25 },
    { name: "Mar", onTime: 90, delayed: 10 },
    { name: "Apr", onTime: 80, delayed: 20 },
    { name: "May", onTime: 95, delayed: 5 },
    { name: "Jun", onTime: 85, delayed: 15 },
  ];
  
  // Budget spent by project
  const budgetData = filteredProjects.slice(0, 5).map(project => ({
    name: project.name.substring(0, 15) + (project.name.length > 15 ? "..." : ""),
    budget: Math.floor(Math.random() * 100000) + 50000, // Random budget for demo
    spent: Math.floor(Math.random() * 80000) + 20000, // Random spent for demo
  }));
  
  // Calculate completion rate
  const completionRate = filteredProjects.length > 0 
    ? Math.round((filteredProjects.filter(p => p.status === "Completed").length / filteredProjects.length) * 100)
    : 0;
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center">
          <ChartBar className="h-6 w-6 mr-2" />
          Analytics
        </h1>
        
        <div>
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
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
      </div>
      
      {/* Summary Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={filteredProjects.length}
        />
        <StatCard
          title="Total POs"
          value={filteredPOs.length}
        />
        <StatCard
          title="Completion Rate"
          value={`${completionRate}%`}
        />
        <StatCard
          title="Total Budget Spent"
          value={`$${budgetData.reduce((sum, item) => sum + item.spent, 0).toLocaleString()}`}
        />
      </div>
      
      {/* Project Status Distribution */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Project Status Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={projectStatusData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                >
                  {projectStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`${value} projects`, 'Count']} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
      
      {/* Supplier Performance */}
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Supplier Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={supplierPerformanceData}
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
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline Adherence */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Timeline Adherence</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={timelineAdherenceData}
                  margin={{
                    top: 20,
                    right: 30,
                    left: 20,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="onTime" name="On Time (%)" stroke="#22c55e" strokeWidth={2} />
                  <Line type="monotone" dataKey="delayed" name="Delayed (%)" stroke="#ef4444" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        
        {/* Budget Spent Analysis */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Budget Analysis by Project</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={budgetData}
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
                  <Tooltip formatter={(value) => [`$${value.toLocaleString()}`, '']} />
                  <Legend />
                  <Bar dataKey="budget" name="Budget" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="spent" name="Spent" fill="#f59e0b" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
