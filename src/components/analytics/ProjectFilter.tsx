
import { Filter } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Project } from "@/contexts/DataContext";

interface ProjectFilterProps {
  selectedProject: string;
  setSelectedProject: (value: string) => void;
  projects: Project[];
}

export function ProjectFilter({ selectedProject, setSelectedProject, projects }: ProjectFilterProps) {
  return (
    <div className="flex items-center gap-2">
      <Filter className="h-4 w-4" />
      <Select value={selectedProject} onValueChange={setSelectedProject}>
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select Project" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem value="all">All Projects</SelectItem>
            {projects.map((project) => (
              <SelectItem key={project.id} value={project.id}>
                {project.name.substring(0, 20) + (project.name.length > 20 ? "..." : "")}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
