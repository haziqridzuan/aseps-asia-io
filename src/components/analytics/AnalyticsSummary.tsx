
import { StatCard } from "@/components/dashboard/StatCard";

interface AnalyticsSummaryProps {
  totalProjects: number;
  totalPOs: number;
  completionRate: number;
  totalSpent: number;
}

export function AnalyticsSummary({ 
  totalProjects, 
  totalPOs, 
  completionRate, 
  totalSpent 
}: AnalyticsSummaryProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Projects"
        value={totalProjects}
      />
      <StatCard
        title="Total POs"
        value={totalPOs}
      />
      <StatCard
        title="Completion Rate"
        value={`${completionRate}%`}
      />
      <StatCard
        title="Total Spent"
        value={`$${totalSpent.toLocaleString()}`}
      />
    </div>
  );
}
