
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Link } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { File, Search, ChevronDown } from "lucide-react";

export default function Projects() {
  const { projects, clients } = useData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  
  // Get client name
  const getClientName = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : "Unknown Client";
  };
  
  // Filter projects based on search and status
  const filteredProjects = projects.filter(project => {
    const matchesSearch = search === "" || 
      project.name.toLowerCase().includes(search.toLowerCase()) ||
      getClientName(project.clientId).toLowerCase().includes(search.toLowerCase()) ||
      project.location.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === null || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });
  
  // Function to get badge color based on status
  const getStatusColor = (status: string) => {
    switch (status) {
      case "In Progress":
        return "bg-blue-500";
      case "Completed":
        return "bg-green-500";
      case "Pending":
        return "bg-amber-500";
      case "Delayed":
        return "bg-red-500";
      default:
        return "bg-gray-500";
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center">
          <File className="h-6 w-6 mr-2" />
          Projects
        </h1>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search projects..."
              className="pl-8 w-[200px] md:w-[300px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center">
                {statusFilter || "All Statuses"} <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => setStatusFilter(null)}>
                All Statuses
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("In Progress")}>
                In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Completed")}>
                Completed
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Pending")}>
                Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter("Delayed")}>
                Delayed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project, index) => (
                  <TableRow key={project.id} className="hover:bg-secondary/50 transition-colors animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <TableCell>
                      <Link to={`/projects/${project.id}`} className="font-medium hover:text-primary transition-colors">
                        {project.name}
                      </Link>
                    </TableCell>
                    <TableCell>{getClientName(project.clientId)}</TableCell>
                    <TableCell>{project.location}</TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={project.progress} className="h-2 w-[100px]" />
                        <span className="text-sm font-medium">{project.progress}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No projects found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
