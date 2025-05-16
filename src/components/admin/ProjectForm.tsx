import { useState, useEffect } from "react";
import { useData, Project } from "@/contexts/DataContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ProjectFormProps {
  projectId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ProjectForm({ projectId, onSuccess, onCancel }: ProjectFormProps) {
  const { projects, clients, addProject, updateProject } = useData();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Project, "id">>({
    name: "",
    clientId: "",
    location: "",
    status: "Pending",
    progress: 0,
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    projectManager: "",
    description: "",
  });
  
  // If editing, load the project data
  useEffect(() => {
    if (projectId) {
      const project = projects.find(p => p.id === projectId);
      if (project) {
        setFormData({
          name: project.name,
          clientId: project.clientId,
          location: project.location,
          status: project.status,
          progress: project.progress,
          startDate: project.startDate,
          endDate: project.endDate,
          projectManager: project.projectManager || "",
          description: project.description || "",
        });
      }
    }
  }, [projectId, projects]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleNumberChange = (name: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData(prev => ({ ...prev, [name]: numValue }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (projectId) {
        updateProject(projectId, formData);
        toast({
          title: "Project updated",
          description: "The project has been updated successfully",
        });
      } else {
        addProject(formData);
        toast({
          title: "Project created",
          description: "A new project has been created successfully",
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving project:", error);
      toast.error("There was an error saving the project");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Project Name</label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="clientId" className="text-sm font-medium">Client</label>
          <Select
            value={formData.clientId}
            onValueChange={(value) => handleSelectChange("clientId", value)}
            required
          >
            <SelectTrigger>
              <SelectValue placeholder="Select a client" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Clients</SelectLabel>
                {clients.map(client => (
                  <SelectItem key={client.id} value={client.id}>
                    {client.name}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium">Location</label>
          <Input
            id="location"
            name="location"
            value={formData.location}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="status" className="text-sm font-medium">Status</label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleSelectChange("status", value as Project["status"])}
            required
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="In Progress">In Progress</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Pending">Pending</SelectItem>
              <SelectItem value="Delayed">Delayed</SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="progress" className="text-sm font-medium">Progress (%)</label>
          <Input
            id="progress"
            type="number"
            min="0"
            max="100"
            value={formData.progress}
            onChange={(e) => handleNumberChange("progress", e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="projectManager" className="text-sm font-medium">Project Manager</label>
          <Input
            id="projectManager"
            name="projectManager"
            value={formData.projectManager}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="startDate" className="text-sm font-medium">Start Date</label>
          <Input
            id="startDate"
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="endDate" className="text-sm font-medium">End Date</label>
          <Input
            id="endDate"
            name="endDate"
            type="date"
            value={formData.endDate}
            onChange={handleChange}
            required
          />
        </div>
      </div>
      
      <div className="space-y-2">
        <label htmlFor="description" className="text-sm font-medium">Description</label>
        <Textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleChange}
          rows={4}
        />
      </div>
      
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {projectId ? "Update Project" : "Create Project"}
        </Button>
      </div>
    </form>
  );
}
