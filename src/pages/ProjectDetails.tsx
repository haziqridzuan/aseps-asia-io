
import { useParams, useNavigate } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, Ship, Package } from "lucide-react";

export default function ProjectDetails() {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { projects, clients, suppliers, purchaseOrders, shipments } = useData();
  
  // Find the project
  const project = projects.find(p => p.id === projectId);
  
  // If project not found, show error and return to projects list
  if (!project) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Project not found</h2>
        <Button onClick={() => navigate("/projects")}>Back to Projects</Button>
      </div>
    );
  }
  
  // Get client details
  const client = clients.find(c => c.id === project.clientId);
  
  // Get POs related to this project and count unique PO numbers
  const projectPOs = purchaseOrders.filter(po => po.projectId === project.id);
  const uniquePONumbers = [...new Set(projectPOs.map(po => po.poNumber))];
  const activePOs = uniquePONumbers.filter(poNumber => 
    projectPOs.some(po => po.poNumber === poNumber && po.status === "Active")
  ).length;
  const completedPOs = uniquePONumbers.filter(poNumber => 
    projectPOs.every(po => po.poNumber === poNumber && po.status === "Completed")
  ).length;
  const delayedPOs = uniquePONumbers.filter(poNumber => 
    projectPOs.some(po => po.poNumber === poNumber && po.status === "Delayed")
  ).length;
  
  // Get total parts count
  const totalParts = projectPOs.reduce((total, po) => total + po.parts.length, 0);
  
  // Get suppliers involved
  const supplierIds = [...new Set(projectPOs.map(po => po.supplierId))];
  const projectSuppliers = suppliers.filter(s => supplierIds.includes(s.id));
  
  // Get upcoming deadlines
  const upcomingDeadlines = projectPOs
    .filter(po => po.status === "Active")
    .sort((a, b) => new Date(a.deadline).getTime() - new Date(b.deadline).getTime());
  
  // Get shipments for this project
  const projectShipments = shipments.filter(s => s.projectId === project.id)
    .sort((a, b) => new Date(a.etaDate).getTime() - new Date(b.etaDate).getTime());
  
  // Calculate days remaining
  const calculateDaysRemaining = (deadline: string): number => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  // Get supplier name
  const getSupplierName = (supplierId: string): string => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : "Unknown Supplier";
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
      case "Active":
        return "bg-blue-500";
      case "In Transit":
        return "bg-blue-500";
      case "Delivered":
        return "bg-green-500";
      default:
        return "bg-gray-500";
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Button 
          variant="ghost" 
          className="mb-4 flex items-center" 
          onClick={() => navigate("/projects")}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Projects
        </Button>
        
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold animate-fade-in">{project.name}</h1>
            <p className="text-muted-foreground">{project.location}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge className={getStatusColor(project.status)}>
              {project.status}
            </Badge>
            <span className="text-sm text-muted-foreground">
              {new Date(project.startDate).toLocaleDateString()} - {new Date(project.endDate).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>
      
      {/* Project Progress */}
      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Project Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="font-medium">{project.progress}% Complete</span>
              <span className="text-sm text-muted-foreground">
                Target: {new Date(project.endDate).toLocaleDateString()}
              </span>
            </div>
            <Progress value={project.progress} className="h-2" />
          </div>
        </CardContent>
      </Card>
      
      {/* Project Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Client and Project Info */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Project Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Client</dt>
                <dd className="font-medium">{client?.name || "Unknown Client"}</dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Contact Person</dt>
                <dd>{client?.contactPerson || "N/A"}</dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Contact Info</dt>
                <dd>{client?.email || "N/A"}</dd>
                <dd>{client?.phone || "N/A"}</dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Project Manager</dt>
                <dd>{project.projectManager}</dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Description</dt>
                <dd>{project.description || "No description available"}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        {/* PO Summary */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">PO Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="stat-card">
                <div>
                  <p className="text-sm text-muted-foreground">Total POs</p>
                  <p className="text-xl font-bold">{uniquePONumbers.length}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div>
                  <p className="text-sm text-muted-foreground">Active POs</p>
                  <p className="text-xl font-bold">{activePOs}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div>
                  <p className="text-sm text-muted-foreground">Completed POs</p>
                  <p className="text-xl font-bold">{completedPOs}</p>
                </div>
              </div>
              
              <div className="stat-card">
                <div>
                  <p className="text-sm text-muted-foreground">Total Parts</p>
                  <p className="text-xl font-bold">{totalParts}</p>
                </div>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium mb-2">Suppliers Involved</h4>
              <div className="space-y-2">
                {projectSuppliers.map(supplier => (
                  <div key={supplier.id} className="flex items-center justify-between text-sm p-2 bg-secondary rounded-md">
                    <span>{supplier.name}</span>
                    <span className="text-xs text-muted-foreground">{supplier.country}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* PO Details */}
      <div className="grid grid-cols-1 gap-6">
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Purchase Orders</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>PO Number</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Parts</TableHead>
                  <TableHead>Deadline</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectPOs.length > 0 ? (
                  projectPOs.map((po) => (
                    <TableRow key={po.id} className="hover:bg-secondary/50 transition-colors animate-fade-in">
                      <TableCell className="font-medium">{po.poNumber}</TableCell>
                      <TableCell>{po.description || "No description"}</TableCell>
                      <TableCell>{getSupplierName(po.supplierId)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(po.status)}>
                          {po.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{po.parts.length} parts</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{new Date(po.deadline).toLocaleDateString()}</span>
                          {po.status !== "Completed" && (
                            <span className={`text-xs ${calculateDaysRemaining(po.deadline) < 7 ? 'text-red-500' : 'text-muted-foreground'}`}>
                              {calculateDaysRemaining(po.deadline)} days remaining
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      No purchase orders found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        
        {/* Upcoming Deadlines */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Upcoming PO Deadlines</CardTitle>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length > 0 ? (
              <div className="space-y-4">
                {upcomingDeadlines.slice(0, 5).map((po) => {
                  const daysRemaining = calculateDaysRemaining(po.deadline);
                  return (
                    <div key={po.id} className="flex items-center justify-between border-b pb-2">
                      <div>
                        <p className="font-medium">
                          {po.poNumber} - {getSupplierName(po.supplierId)}
                        </p>
                        <div className="flex flex-col space-y-1">
                          {po.parts.map(part => (
                            <div key={part.id} className="flex items-center text-sm">
                              <Badge variant="outline" className="mr-2">
                                {part.name}
                              </Badge>
                              <Badge className={getStatusColor(part.status)}>
                                {part.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm">{new Date(po.deadline).toLocaleDateString()}</p>
                        <Badge className={
                          daysRemaining < 7 ? "bg-red-500" : 
                          daysRemaining < 14 ? "bg-amber-500" : 
                          "bg-green-500"
                        }>
                          {daysRemaining} days left
                        </Badge>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-4 text-muted-foreground">
                No upcoming deadlines
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Shipments Section */}
        <Card className="card-hover">
          <CardHeader className="pb-2 flex items-center">
            <Ship className="h-5 w-5 mr-2 text-primary" />
            <CardTitle className="text-lg font-medium">Project Shipments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tracking/Container</TableHead>
                  <TableHead>Shipped Date</TableHead>
                  <TableHead>ETD</TableHead>
                  <TableHead>ETA</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectShipments.length > 0 ? (
                  projectShipments.map((shipment) => (
                    <TableRow key={shipment.id} className="hover:bg-secondary/50 transition-colors animate-fade-in">
                      <TableCell>
                        <div className="flex items-center">
                          <Package className="h-4 w-4 mr-2" />
                          {shipment.type}
                        </div>
                      </TableCell>
                      <TableCell>{getSupplierName(shipment.supplierId)}</TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(shipment.status)}>
                          {shipment.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {shipment.type === "Sea" 
                          ? shipment.containerNumber || "N/A" 
                          : shipment.trackingNumber || "N/A"}
                      </TableCell>
                      <TableCell>{new Date(shipment.shippedDate).toLocaleDateString()}</TableCell>
                      <TableCell>{new Date(shipment.etdDate).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <div className="flex flex-col">
                          <span>{new Date(shipment.etaDate).toLocaleDateString()}</span>
                          {shipment.status !== "Delivered" && (
                            <span className={`text-xs ${
                              calculateDaysRemaining(shipment.etaDate) < 7 ? 'text-red-500' : 'text-muted-foreground'
                            }`}>
                              {calculateDaysRemaining(shipment.etaDate)} days remaining
                            </span>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={7} className="h-24 text-center">
                      No shipments found for this project.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
