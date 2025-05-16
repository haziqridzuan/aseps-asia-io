
import { useState, useMemo } from "react";
import { useData } from "@/contexts/DataContext";
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
import { StatCard } from "@/components/dashboard/StatCard";
import { ChartBar } from "lucide-react";
import { DateRangeFilter } from "@/components/analytics/DateRangeFilter";
import { ProjectFilter } from "@/components/analytics/ProjectFilter";
import { StatusPieChart } from "@/components/analytics/StatusPieChart";
import { BudgetSpentChart } from "@/components/analytics/BudgetSpentChart";
import { SupplierSpendingChart } from "@/components/analytics/SupplierSpendingChart";

export default function Analytics() {
  const { projects, suppliers, purchaseOrders } = useData();
  const [dateRange, setDateRange] = useState("all");
  const [selectedProject, setSelectedProject] = useState("all");
  
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
  
  // Filter by project
  const filterByProject = (projectId: string) => {
    if (selectedProject === "all") return true;
    return projectId === selectedProject;
  };
  
  // Filter projects
  const filteredProjects = projects.filter(project => filterByDateRange(project.startDate));
  
  // Filter POs by date range and project
  const filteredPOs = purchaseOrders.filter(po => 
    filterByDateRange(po.issuedDate) && filterByProject(po.projectId)
  );
  
  // Project status data for chart
  const projectStatusData = [
    { name: "In Progress", value: filteredProjects.filter(p => p.status === "In Progress").length, color: "#3b82f6" },
    { name: "Completed", value: filteredProjects.filter(p => p.status === "Completed").length, color: "#22c55e" },
    { name: "Pending", value: filteredProjects.filter(p => p.status === "Pending").length, color: "#f59e0b" },
    { name: "Delayed", value: filteredProjects.filter(p => p.status === "Delayed").length, color: "#ef4444" },
  ].filter(item => item.value > 0);
  
  // Purchase Order status data for chart
  const poStatusData = useMemo(() => {
    // Calculate the number of POs with different statuses
    const statusCounts = {
      "Completed": 0,
      "Active": 0, // "In Progress" equivalent
      "Delayed": 0
    };
    
    // Count POs by status
    filteredPOs.forEach(po => {
      if (statusCounts.hasOwnProperty(po.status)) {
        statusCounts[po.status as keyof typeof statusCounts]++;
      }
    });
    
    // Format data for chart
    return [
      { name: "Completed", value: statusCounts.Completed, color: "#22c55e" },
      { name: "Active", value: statusCounts.Active, color: "#3b82f6" },
      { name: "Delayed", value: statusCounts.Delayed, color: "#ef4444" },
    ].filter(item => item.value > 0);
  }, [filteredPOs]);
  
  // Supplier performance data
  const supplierPerformanceData = suppliers
    .slice(0, 5)
    .map(supplier => ({
      name: supplier.name,
      rating: supplier.rating,
      onTimeDelivery: supplier.onTimeDelivery,
    }));
  
  // Calculate spent by project from POs
  const spentByProject = useMemo(() => {
    const projectSpentMap = new Map<string, number>();
    
    // Initialize with all projects (even if they have no POs)
    projects.forEach(project => {
      projectSpentMap.set(project.id, 0);
    });
    
    // Calculate spent for each project based on POs
    filteredPOs.forEach(po => {
      // Sum up all parts in the PO
      const poTotal = po.parts.reduce((sum, part) => {
        return sum + (part.quantity * (Math.floor(Math.random() * 1000) + 100)); // Random cost per part for demo
      }, 0);
      
      // Add to the project's total
      const currentSpent = projectSpentMap.get(po.projectId) || 0;
      projectSpentMap.set(po.projectId, currentSpent + poTotal);
    });
    
    // Convert to chart data format
    return Array.from(projectSpentMap.entries())
      .filter(([_, spent]) => spent > 0) // Only include projects with spent > 0
      .map(([projectId, spent]) => {
        const project = projects.find(p => p.id === projectId);
        return {
          name: project ? project.name.substring(0, 15) + (project.name.length > 15 ? "..." : "") : "Unknown",
          projectId,
          spent,
        };
      })
      .sort((a, b) => b.spent - a.spent) // Sort by spent in descending order
      .slice(0, 8); // Show top 8 projects
  }, [filteredPOs, projects]);
  
  // Generate colors for budget chart
  const budgetColors = [
    "#9b87f5", "#7E69AB", "#6E59A5", "#D6BCFA", 
    "#F97316", "#0EA5E9", "#D946EF", "#33C3F0"
  ];
  
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
        
        <div className="flex flex-wrap gap-2 items-center">
          <DateRangeFilter dateRange={dateRange} setDateRange={setDateRange} />
          <ProjectFilter 
            selectedProject={selectedProject} 
            setSelectedProject={setSelectedProject}
            projects={projects}
          />
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
          title="Total Spent"
          value={`$${spentByProject.reduce((sum, item) => sum + item.spent, 0).toLocaleString()}`}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <StatusPieChart title="Project Status Distribution" data={projectStatusData} />
        
        {/* Purchase Order Status Chart */}
        <StatusPieChart title="Purchase Order Status" data={poStatusData} />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
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
        
        {/* Budget Spent Analysis - Single bar per project */}
        <BudgetSpentChart spentByProject={spentByProject} budgetColors={budgetColors} />
        
        {/* New: Amount Spent by Supplier */}
        <SupplierSpendingChart purchaseOrders={purchaseOrders} suppliers={suppliers} />
      </div>
    </div>
  );
}
