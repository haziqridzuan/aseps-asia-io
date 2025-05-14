import { useParams, useNavigate, Link } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ChevronLeft, Star } from "lucide-react";

export default function SupplierDetails() {
  const { supplierId } = useParams<{ supplierId: string }>();
  const navigate = useNavigate();
  const { suppliers, purchaseOrders, projects } = useData();
  
  // Find the supplier
  const supplier = suppliers.find(s => s.id === supplierId);
  
  // If supplier not found, show error and return to suppliers list
  if (!supplier) {
    return (
      <div className="flex flex-col items-center justify-center h-[50vh]">
        <h2 className="text-2xl font-bold mb-4">Supplier not found</h2>
        <Button onClick={() => navigate("/suppliers")}>Back to Suppliers</Button>
      </div>
    );
  }
  
  // Get POs related to this supplier
  const supplierPOs = purchaseOrders.filter(po => po.supplierId === supplier.id);
  const activePOs = supplierPOs.filter(po => po.status === "Active").length;
  const completedPOs = supplierPOs.filter(po => po.status === "Completed").length;
  
  // Get projects involving this supplier
  const projectIds = [...new Set(supplierPOs.map(po => po.projectId))];
  const supplierProjects = projects.filter(p => projectIds.includes(p.id));
  
  // Render stars for rating
  const renderRating = (rating: number) => {
    const stars = [];
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-5 w-5 ${i < rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
        />
      );
    }
    
    return <div className="flex">{stars}</div>;
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
      case "Active":
        return "bg-red-500";
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
          onClick={() => navigate("/suppliers")}
        >
          <ChevronLeft className="h-4 w-4 mr-1" /> Back to Suppliers
        </Button>
        
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold animate-fade-in">{supplier.name}</h1>
            <p className="text-muted-foreground">{supplier.country}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Supplier Information */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Contact Information</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Contact Person</dt>
                <dd className="font-medium">{supplier.contactPerson}</dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Email</dt>
                <dd>{supplier.email}</dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Phone</dt>
                <dd>{supplier.phone}</dd>
              </div>
              
              <div className="flex flex-col">
                <dt className="text-sm font-medium text-muted-foreground">Location</dt>
                <dd>{supplier.country}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        {/* Supplier Performance */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Performance Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">Rating</p>
                <div className="flex items-center gap-2">
                  {renderRating(supplier.rating)}
                  <span className="text-lg font-medium">{supplier.rating.toFixed(1)}/5</span>
                </div>
              </div>
              
              <div>
                <p className="text-sm font-medium text-muted-foreground mb-1">On-Time Delivery</p>
                <div className="flex items-center gap-2">
                  <div className="w-full h-4 bg-gray-200 rounded-full">
                    <div 
                      className={`h-4 rounded-full ${supplier.onTimeDelivery > 90 ? 'bg-green-500' : supplier.onTimeDelivery > 75 ? 'bg-amber-500' : 'bg-red-500'}`}
                      style={{ width: `${supplier.onTimeDelivery}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-medium">{supplier.onTimeDelivery}%</span>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="stat-card">
                  <div>
                    <p className="text-sm text-muted-foreground">Total POs</p>
                    <p className="text-xl font-bold">{supplierPOs.length}</p>
                  </div>
                </div>
                
                <div className="stat-card">
                  <div>
                    <p className="text-sm text-muted-foreground">Completed POs</p>
                    <p className="text-xl font-bold">{completedPOs}</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Projects Involved */}
      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Projects Involved</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project Name</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Progress</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplierProjects.length > 0 ? (
                supplierProjects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-secondary/50 transition-colors animate-fade-in">
                    <TableCell>
                      <Button
                        variant="link"
                        asChild
                        className="p-0 h-auto font-medium text-foreground hover:text-primary"
                      >
                        <Link to={`/projects/${project.id}`}>{project.name}</Link>
                      </Button>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(project.status)}>
                        {project.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-[100px] bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${project.progress}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{project.progress}%</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    No projects found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Purchase Orders */}
      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Purchase Orders</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Parts</TableHead>
                <TableHead>Deadline</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {supplierPOs.length > 0 ? (
                supplierPOs.map((po) => {
                  const project = projects.find(p => p.id === po.projectId);
                  return (
                    <TableRow key={po.id} className="hover:bg-secondary/50 transition-colors animate-fade-in">
                      <TableCell className="font-medium">{po.poNumber}</TableCell>
                      <TableCell>
                        {project ? (
                          <Button
                            variant="link"
                            asChild
                            className="p-0 h-auto font-medium text-foreground hover:text-primary"
                          >
                            <Link to={`/projects/${project.id}`}>{project.name}</Link>
                          </Button>
                        ) : (
                          "Unknown Project"
                        )}
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusColor(po.status)}>
                          {po.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{po.parts.length} parts</TableCell>
                      <TableCell>{new Date(po.deadline).toLocaleDateString()}</TableCell>
                    </TableRow>
                  );
                })
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No purchase orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      {/* Comments */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Positive Comments */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-green-600">Positive Comments</CardTitle>
          </CardHeader>
          <CardContent>
            {supplier.positiveComments && supplier.positiveComments.length > 0 ? (
              <ul className="space-y-2">
                {supplier.positiveComments.map((comment, index) => (
                  <li key={index} className="p-2 bg-green-50 rounded-md text-green-800 animate-fade-in">
                    • {comment}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No positive comments yet.</p>
            )}
          </CardContent>
        </Card>
        
        {/* Negative Comments */}
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium text-red-600">Areas for Improvement</CardTitle>
          </CardHeader>
          <CardContent>
            {supplier.negativeComments && supplier.negativeComments.length > 0 ? (
              <ul className="space-y-2">
                {supplier.negativeComments.map((comment, index) => (
                  <li key={index} className="p-2 bg-red-50 rounded-md text-red-800 animate-fade-in">
                    • {comment}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">No negative comments yet.</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
