
import { useData } from "@/contexts/DataContext";
import { StatCard } from "@/components/dashboard/StatCard";
import { ProjectStatusChart } from "@/components/dashboard/ProjectStatusChart";
import { UpcomingDeadlines } from "@/components/dashboard/UpcomingDeadlines";
import { RecentProjects } from "@/components/dashboard/RecentProjects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartBar, Package, File, Users } from "lucide-react";

export default function Dashboard() {
  const { projects, suppliers, clients, purchaseOrders } = useData();
  
  // Calculate dashboard metrics
  const activeProjects = projects.filter(p => p.status === "In Progress").length;
  const completedProjects = projects.filter(p => p.status === "Completed").length;
  
  // Count unique PO numbers for each status
  const uniquePONumbers = [...new Set(purchaseOrders.map(po => po.poNumber))];
  const activePOCount = uniquePONumbers.filter(poNumber => 
    purchaseOrders.some(po => po.poNumber === poNumber && po.status === "Active")
  ).length;
  const completedPOCount = uniquePONumbers.filter(poNumber => 
    purchaseOrders.every(po => po.poNumber === poNumber && po.status === "Completed")
  ).length;
  const delayedPOCount = uniquePONumbers.filter(poNumber => 
    purchaseOrders.some(po => po.poNumber === poNumber && po.status === "Delayed")
  ).length;
  
  const activeSuppliers = suppliers.length;
  
  // Project status data for chart
  const projectStatusData = [
    { name: "In Progress", value: projects.filter(p => p.status === "In Progress").length, color: "#3b82f6" },
    { name: "Completed", value: projects.filter(p => p.status === "Completed").length, color: "#22c55e" },
    { name: "Pending", value: projects.filter(p => p.status === "Pending").length, color: "#f59e0b" },
    { name: "Delayed", value: projects.filter(p => p.status === "Delayed").length, color: "#ef4444" },
  ].filter(item => item.value > 0);
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Dashboard</h1>
      
      {/* Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Projects" 
          value={projects.length} 
          icon={<File className="h-6 w-6" />} 
          trend={{ value: 12, positive: true }} 
        />
        <StatCard 
          title="Active Suppliers" 
          value={activeSuppliers} 
          icon={<Package className="h-6 w-6" />} 
          trend={{ value: 5, positive: true }} 
        />
        <StatCard 
          title="Active Projects" 
          value={activeProjects} 
          icon={<File className="h-6 w-6" />} 
        />
        <StatCard 
          title="Clients" 
          value={clients.length} 
          icon={<Users className="h-6 w-6" />} 
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Active POs" 
          value={activePOCount} 
          trend={{ value: 8, positive: true }} 
        />
        <StatCard 
          title="Completed POs" 
          value={completedPOCount} 
        />
        <StatCard 
          title="Delayed POs" 
          value={delayedPOCount}
          trend={{ value: 15, positive: false }} 
        />
        <StatCard 
          title="Completion Rate" 
          value={`${Math.round((completedProjects / projects.length) * 100) || 0}%`} 
          trend={{ value: 7, positive: true }} 
        />
      </div>
      
      {/* Charts and Tables Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="text-lg font-medium flex items-center">
              <ChartBar className="h-5 w-5 mr-2 text-primary" />
              Project Status Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ProjectStatusChart data={projectStatusData} />
          </CardContent>
        </Card>
        
        <UpcomingDeadlines />
      </div>
      
      {/* Recent Projects */}
      <RecentProjects />
    </div>
  );
}
