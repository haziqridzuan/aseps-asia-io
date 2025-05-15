
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { ChartBar } from "lucide-react";
import { StatusPieChart } from "@/components/analytics/StatusPieChart";
import { BudgetSpentChart } from "@/components/analytics/BudgetSpentChart";
import { SupplierSpendingChart } from "@/components/analytics/SupplierSpendingChart";
import { SupplierPerformanceChart } from "@/components/analytics/SupplierPerformanceChart";
import { AnalyticsSummary } from "@/components/analytics/AnalyticsSummary";
import { AnalyticsFilters } from "@/components/analytics/AnalyticsFilters";
import { budgetColors } from "@/utils/chartColors";
import {
  filterByDateRange,
  filterByProject,
  calculateProjectStatusData,
  calculatePOStatusData,
  calculateSupplierPerformanceData,
  calculateSpentByProject,
  calculateSpentBySupplier,
  calculateCompletionRate
} from "@/utils/analyticsHelpers";

export default function Analytics() {
  const { projects, suppliers, purchaseOrders } = useData();
  const [dateRange, setDateRange] = useState("all");
  const [selectedProject, setSelectedProject] = useState("all");
  const [startDate, setStartDate] = useState<Date | undefined>(undefined);
  const [endDate, setEndDate] = useState<Date | undefined>(undefined);
  
  // Filter projects based on date range
  const filteredProjects = projects.filter(project => filterByDateRange(project.startDate, dateRange));
  
  // Filter POs by date range and project
  const filteredPOs = purchaseOrders.filter(po => 
    filterByDateRange(po.issuedDate, dateRange) && filterByProject(po.projectId, selectedProject)
  );
  
  // Calculate chart data
  const projectStatusData = calculateProjectStatusData(filteredProjects);
  const poStatusData = calculatePOStatusData(filteredPOs);
  const supplierPerformanceData = calculateSupplierPerformanceData(suppliers);
  const spentByProject = calculateSpentByProject(filteredPOs, projects);
  const spentBySupplier = calculateSpentBySupplier(filteredPOs, suppliers);
  const completionRate = calculateCompletionRate(filteredProjects);
  const totalSpent = spentByProject.reduce((sum, item) => sum + item.spent, 0);
  
  // Handler for date range filter
  const handleDateRangeChange = (start: Date | undefined, end: Date | undefined) => {
    setStartDate(start);
    setEndDate(end);
    
    // Map the date range to the existing state format
    if (!start && !end) {
      setDateRange("all");
    } else if (start && !end) {
      // If only start date is set, assume it's a recent range (month)
      setDateRange("month");
    } else if (start && end) {
      // Both dates set, determine range based on difference
      const diffDays = Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
      if (diffDays <= 30) {
        setDateRange("month");
      } else if (diffDays <= 90) {
        setDateRange("quarter");
      } else {
        setDateRange("year");
      }
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center">
          <ChartBar className="h-6 w-6 mr-2" />
          Analytics
        </h1>
        
        <AnalyticsFilters 
          dateRangeProps={{ 
            onDateRangeChange: handleDateRangeChange, 
            startDate, 
            endDate 
          }}
          selectedProject={selectedProject}
          setSelectedProject={setSelectedProject}
          projects={projects}
        />
      </div>
      
      {/* Summary Statistics */}
      <AnalyticsSummary 
        totalProjects={filteredProjects.length}
        totalPOs={filteredPOs.length}
        completionRate={completionRate}
        totalSpent={totalSpent}
      />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <StatusPieChart title="Project Status Distribution" data={projectStatusData} />
        
        {/* Purchase Order Status Chart */}
        <StatusPieChart title="Purchase Order Status" data={poStatusData} />
      </div>
      
      <div className="grid grid-cols-1 gap-6">
        {/* Supplier Performance */}
        <SupplierPerformanceChart data={supplierPerformanceData} />
        
        {/* Budget Spent Analysis */}
        <BudgetSpentChart spentByProject={spentByProject} budgetColors={budgetColors} />
        
        {/* Amount Spent by Supplier */}
        <SupplierSpendingChart 
          spentBySupplier={spentBySupplier} 
          budgetColors={budgetColors} 
        />
      </div>
    </div>
  );
}
