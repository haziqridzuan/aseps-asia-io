
import { Project, PurchaseOrder, Supplier } from "@/contexts/DataContext";

// Filter data based on date range
export const filterByDateRange = (date: string, dateRange: string): boolean => {
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

// Filter by project ID
export const filterByProject = (projectId: string, selectedProject: string): boolean => {
  if (selectedProject === "all") return true;
  return projectId === selectedProject;
};

// Calculate project status data for charts
export const calculateProjectStatusData = (projects: Project[]) => {
  return [
    { name: "In Progress", value: projects.filter(p => p.status === "In Progress").length, color: "#3b82f6" },
    { name: "Completed", value: projects.filter(p => p.status === "Completed").length, color: "#22c55e" },
    { name: "Pending", value: projects.filter(p => p.status === "Pending").length, color: "#f59e0b" },
    { name: "Delayed", value: projects.filter(p => p.status === "Delayed").length, color: "#ef4444" },
  ].filter(item => item.value > 0);
};

// Calculate purchase order status data for charts
export const calculatePOStatusData = (purchaseOrders: PurchaseOrder[]) => {
  // Calculate the number of POs with different statuses
  const statusCounts = {
    "Completed": 0,
    "Active": 0, // "In Progress" equivalent
    "Delayed": 0
  };
  
  // Count POs by status
  purchaseOrders.forEach(po => {
    if (po.status in statusCounts) {
      statusCounts[po.status as keyof typeof statusCounts]++;
    }
  });
  
  // Format data for chart
  return [
    { name: "Completed", value: statusCounts.Completed, color: "#22c55e" },
    { name: "Active", value: statusCounts.Active, color: "#3b82f6" },
    { name: "Delayed", value: statusCounts.Delayed, color: "#ef4444" },
  ].filter(item => item.value > 0);
};

// Calculate supplier performance data
export const calculateSupplierPerformanceData = (suppliers: Supplier[]) => {
  return suppliers
    .slice(0, 5)
    .map(supplier => ({
      name: supplier.name,
      rating: supplier.rating,
      onTimeDelivery: supplier.onTimeDelivery,
    }));
};

// Calculate spent by project from purchase orders
export const calculateSpentByProject = (
  purchaseOrders: PurchaseOrder[],
  projects: Project[]
) => {
  const projectSpentMap = new Map<string, number>();
  
  // Initialize with all projects (even if they have no POs)
  projects.forEach(project => {
    projectSpentMap.set(project.id, 0);
  });
  
  // Calculate spent for each project based on POs
  purchaseOrders.forEach(po => {
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
};

// Calculate spent by supplier from purchase orders
export const calculateSpentBySupplier = (
  purchaseOrders: PurchaseOrder[],
  suppliers: Supplier[]
) => {
  const supplierSpentMap = new Map<string, number>();
  
  // Initialize with all suppliers (even if they have no POs)
  suppliers.forEach(supplier => {
    supplierSpentMap.set(supplier.id, 0);
  });
  
  // Calculate spent for each supplier based on POs
  purchaseOrders.forEach(po => {
    // Sum up all parts in the PO
    const poTotal = po.parts.reduce((sum, part) => {
      return sum + (part.quantity * (po.amount ? po.amount / po.parts.length : 0));
    }, 0);
    
    // Add to the supplier's total
    const currentSpent = supplierSpentMap.get(po.supplierId) || 0;
    supplierSpentMap.set(po.supplierId, currentSpent + poTotal);
  });
  
  // Convert to chart data format
  return Array.from(supplierSpentMap.entries())
    .filter(([_, spent]) => spent > 0) // Only include suppliers with spent > 0
    .map(([supplierId, spent]) => {
      const supplier = suppliers.find(s => s.id === supplierId);
      return {
        name: supplier ? supplier.name.substring(0, 15) + (supplier.name.length > 15 ? "..." : "") : "Unknown",
        supplierId,
        spent,
      };
    })
    .sort((a, b) => b.spent - a.spent) // Sort by spent in descending order
    .slice(0, 8); // Show top 8 suppliers
};

// Calculate completion rate
export const calculateCompletionRate = (projects: Project[]) => {
  return projects.length > 0 
    ? Math.round((projects.filter(p => p.status === "Completed").length / projects.length) * 100)
    : 0;
};
