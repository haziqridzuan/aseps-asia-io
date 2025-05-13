
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ProjectForm } from "@/components/admin/ProjectForm";
import { File, Plus, Search, Pencil, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminProjects() {
  const { projects, clients, deleteProject } = useData();
  const { toast } = useToast();
  const [search, setSearch] = useState("");
  const [openDialog, setOpenDialog] = useState(false);
  const [openDeleteAlert, setOpenDeleteAlert] = useState(false);
  const [editingProjectId, setEditingProjectId] = useState<string | null>(null);
  const [deleteProjectId, setDeleteProjectId] = useState<string | null>(null);
  
  // Filter projects based on search
  const filteredProjects = projects.filter(project =>
    search === "" ||
    project.name.toLowerCase().includes(search.toLowerCase()) ||
    project.location.toLowerCase().includes(search.toLowerCase())
  );
  
  // Get client name by ID
  const getClientName = (clientId: string) => {
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
  
  // Handle edit project
  const handleEdit = (projectId: string) => {
    setEditingProjectId(projectId);
    setOpenDialog(true);
  };
  
  // Handle delete project
  const handleDelete = (projectId: string) => {
    setDeleteProjectId(projectId);
    setOpenDeleteAlert(true);
  };
  
  // Confirm delete project
  const confirmDelete = () => {
    if (deleteProjectId) {
      deleteProject(deleteProjectId);
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully",
      });
      setOpenDeleteAlert(false);
      setDeleteProjectId(null);
    }
  };
  
  // Get project name for delete confirmation
  const getDeleteProjectName = () => {
    if (!deleteProjectId) return "";
    const project = projects.find(p => p.id === deleteProjectId);
    return project ? project.name : "";
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center">
          <File className="h-6 w-6 mr-2" />
          Manage Projects
        </h1>
        
        <div className="flex gap-2">
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
          
          <Button
            onClick={() => {
              setEditingProjectId(null);
              setOpenDialog(true);
            }}
          >
            <Plus className="h-4 w-4 mr-2" /> Add Project
          </Button>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Client</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-secondary/50 transition-colors">
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{getClientName(project.clientId)}</TableCell>
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
                    <TableCell>{project.location}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleEdit(project.id)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(project.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No projects found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Add/Edit Project Dialog */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingProjectId ? "Edit Project" : "Add Project"}</DialogTitle>
          </DialogHeader>
          <ProjectForm
            projectId={editingProjectId || undefined}
            onSuccess={() => setOpenDialog(false)}
            onCancel={() => setOpenDialog(false)}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={openDeleteAlert} onOpenChange={setOpenDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the project "{getDeleteProjectName()}".
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
