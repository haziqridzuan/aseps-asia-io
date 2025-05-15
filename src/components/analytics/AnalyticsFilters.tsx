
import { DateRangeFilter, DateRangeFilterProps } from "@/components/analytics/DateRangeFilter";
import { ProjectFilter } from "@/components/analytics/ProjectFilter";
import { Project } from "@/contexts/DataContext";

interface AnalyticsFiltersProps {
  dateRangeProps: DateRangeFilterProps;
  selectedProject: string;
  setSelectedProject: (value: string) => void;
  projects: Project[];
}

export function AnalyticsFilters({ 
  dateRangeProps, 
  selectedProject, 
  setSelectedProject, 
  projects 
}: AnalyticsFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <DateRangeFilter {...dateRangeProps} />
      <ProjectFilter 
        selectedProject={selectedProject} 
        setSelectedProject={setSelectedProject}
        projects={projects}
      />
    </div>
  );
}
