
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { File } from "lucide-react";
import { Link } from "react-router-dom";

export function RecentProjects() {
  const { projects, clients } = useData();
  
  // Get 5 most recent projects based on start date
  const recentProjects = [...projects]
    .sort((a, b) => {
      return new Date(b.startDate).getTime() - new Date(a.startDate).getTime();
    })
    .slice(0, 5);
  
  // Get client name
  const getClientName = (clientId: string): string => {
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : "Unknown Client";
  };
  
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
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <File className="h-5 w-5 mr-2 text-primary" />
          Recent Projects
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentProjects.map((project, index) => (
            <div key={project.id} className="space-y-2 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
              <div className="flex items-center justify-between">
                <Link to={`/projects/${project.id}`} className="font-medium hover:text-primary transition-colors">
                  {project.name}
                </Link>
                <Badge className={getStatusColor(project.status)}>
                  {project.status}
                </Badge>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <span>{getClientName(project.clientId)}</span>
                <span className="mx-2">•</span>
                <span>{project.location}</span>
              </div>
              <div className="flex items-center justify-between">
                <Progress value={project.progress} className="h-2" />
                <span className="text-sm font-medium ml-2">{project.progress}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
