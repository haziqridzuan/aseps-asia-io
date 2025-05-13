
import { useState } from "react";
import { useData, Project, PurchaseOrder } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";

export default function Timeline() {
  const { projects, purchaseOrders } = useData();
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(projects.length > 0 ? projects[0].id : null);
  const [selectedPOId, setSelectedPOId] = useState<string | null>(null);
  
  // Get selected project
  const selectedProject = selectedProjectId ? projects.find(p => p.id === selectedProjectId) : null;
  
  // Get POs for selected project
  const projectPOs = selectedProject ? purchaseOrders.filter(po => po.projectId === selectedProject.id) : [];
  
  // Get selected PO
  const selectedPO = selectedPOId ? purchaseOrders.find(po => po.id === selectedPOId) : null;
  
  // Change project selection
  const handleProjectChange = (value: string) => {
    setSelectedProjectId(value);
    setSelectedPOId(null); // Reset PO selection when project changes
  };
  
  // Change PO selection
  const handlePOChange = (value: string) => {
    setSelectedPOId(value === "all" ? null : value);
  };
  
  // Generate timeline data based on selection
  const generateTimeline = () => {
    if (selectedPOId && selectedPO) {
      // Show PO timeline
      return generatePOTimeline(selectedPO);
    } else if (selectedProjectId && selectedProject) {
      // Show project timeline
      return generateProjectTimeline(selectedProject, projectPOs);
    }
    
    return [];
  };
  
  interface TimelineEvent {
    date: string;
    title: string;
    description?: string;
    type: "start" | "end" | "milestone" | "deadline";
    status?: "completed" | "in-progress" | "upcoming" | "delayed";
  }
  
  // Generate timeline for a project
  const generateProjectTimeline = (project: Project, pos: PurchaseOrder[]): TimelineEvent[] => {
    const timeline: TimelineEvent[] = [];
    
    // Add project start
    timeline.push({
      date: project.startDate,
      title: "Project Start",
      description: `${project.name} project launched`,
      type: "start",
      status: "completed"
    });
    
    // Add PO milestones
    pos.forEach(po => {
      timeline.push({
        date: po.issuedDate,
        title: `PO Issued: ${po.poNumber}`,
        description: `Purchase order issued`,
        type: "milestone",
        status: po.status === "Completed" ? "completed" : po.status === "Delayed" ? "delayed" : "in-progress"
      });
      
      timeline.push({
        date: po.deadline,
        title: `PO Deadline: ${po.poNumber}`,
        description: `Expected delivery date`,
        type: "deadline",
        status: po.status === "Completed" ? "completed" : 
                new Date(po.deadline) < new Date() ? "delayed" : "upcoming"
      });
    });
    
    // Add project end
    timeline.push({
      date: project.endDate,
      title: "Project Completion",
      description: `Target completion date`,
      type: "end",
      status: project.status === "Completed" ? "completed" : 
              new Date(project.endDate) < new Date() ? "delayed" : "upcoming"
    });
    
    // Sort by date
    return timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };
  
  // Generate timeline for a PO
  const generatePOTimeline = (po: PurchaseOrder): TimelineEvent[] => {
    const timeline: TimelineEvent[] = [];
    
    // Add PO issued
    timeline.push({
      date: po.issuedDate,
      title: "PO Issued",
      description: `Purchase order ${po.poNumber} issued`,
      type: "start",
      status: "completed"
    });
    
    // Add parts milestones
    po.parts.forEach((part, index) => {
      // Create estimated milestone dates based on PO issue and deadline
      const startDate = new Date(po.issuedDate);
      const deadlineDate = new Date(po.deadline);
      const totalDays = (deadlineDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24);
      const partDate = new Date(startDate);
      partDate.setDate(startDate.getDate() + Math.floor(totalDays * ((index + 1) / (po.parts.length + 1))));
      
      timeline.push({
        date: partDate.toISOString().split('T')[0],
        title: `Part: ${part.name}`,
        description: `${part.quantity} units`,
        type: "milestone",
        status: part.status === "Completed" ? "completed" : 
                part.status === "Delayed" ? "delayed" : 
                partDate < new Date() ? "in-progress" : "upcoming"
      });
    });
    
    // Add PO deadline
    timeline.push({
      date: po.deadline,
      title: "PO Deadline",
      description: `Expected completion date`,
      type: "end",
      status: po.status === "Completed" ? "completed" : 
              po.status === "Delayed" ? "delayed" :
              new Date(po.deadline) < new Date() ? "delayed" : "upcoming"
    });
    
    // Sort by date
    return timeline.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  };
  
  const timeline = generateTimeline();
  
  // Get status color
  const getStatusColor = (status?: string) => {
    switch (status) {
      case "completed":
        return "bg-green-500";
      case "in-progress":
        return "bg-blue-500";
      case "upcoming":
        return "bg-amber-500";
      case "delayed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };
  
  // Get icon color
  const getIconColor = (type: string) => {
    switch (type) {
      case "start":
        return "bg-green-500";
      case "end":
        return "bg-blue-500";
      case "milestone":
        return "bg-amber-500";
      case "deadline":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center">
          <Calendar className="h-6 w-6 mr-2" />
          Timeline
        </h1>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Select Project</label>
              <Select value={selectedProjectId || ""} onValueChange={handleProjectChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Projects</SelectLabel>
                    {projects.map(project => (
                      <SelectItem key={project.id} value={project.id}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Select Purchase Order</label>
              <Select 
                value={selectedPOId || "all"} 
                onValueChange={handlePOChange}
                disabled={!selectedProjectId}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a purchase order" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Purchase Orders</SelectLabel>
                    <SelectItem value="all">All POs</SelectItem>
                    {projectPOs.map(po => (
                      <SelectItem key={po.id} value={po.id}>
                        {po.poNumber}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Timeline */}
      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">
            {selectedPO ? `Timeline for PO ${selectedPO.poNumber}` : 
             selectedProject ? `Timeline for Project ${selectedProject.name}` :
             "Select a project to view timeline"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {timeline.length > 0 ? (
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[1.3rem] top-0 bottom-0 w-0.5 bg-gray-200"></div>
              
              {/* Timeline events */}
              <div className="space-y-8">
                {timeline.map((event, index) => (
                  <div 
                    key={index}
                    className="flex gap-4 relative animate-fade-in"
                    style={{ animationDelay: `${index * 100}ms` }}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center z-10 ${getIconColor(event.type)}`}>
                      <span className="text-white text-xs font-bold">
                        {event.type === "start" ? "S" : 
                         event.type === "end" ? "E" : 
                         event.type === "milestone" ? "M" : "D"}
                      </span>
                    </div>
                    
                    <div className="flex-1 bg-white p-4 rounded-lg border shadow-sm">
                      <div className="flex justify-between items-start">
                        <h3 className="font-medium">{event.title}</h3>
                        <Badge className={getStatusColor(event.status)}>
                          {event.status}
                        </Badge>
                      </div>
                      
                      {event.description && (
                        <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                      )}
                      
                      <p className="text-xs text-muted-foreground mt-2">
                        {new Date(event.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              {selectedProjectId ? "No timeline data available" : "Please select a project to view timeline"}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
