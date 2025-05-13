
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ExternalLink, Search, File } from "lucide-react";
import { useNavigate } from "react-router-dom";

export default function ExternalLinks() {
  const { externalLinks, projects, suppliers } = useData();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [projectFilter, setProjectFilter] = useState<string | null>(null);
  const [supplierFilter, setSupplierFilter] = useState<string | null>(null);
  const navigate = useNavigate();
  
  // Filter external links based on search and filters
  const filteredLinks = externalLinks.filter(link => {
    const matchesSearch = search === "" || 
      link.title.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter === null || link.type === typeFilter;
    const matchesProject = projectFilter === null || link.projectId === projectFilter;
    const matchesSupplier = supplierFilter === null || (link.supplierId && link.supplierId === supplierFilter);
    
    return matchesSearch && matchesType && matchesProject && matchesSupplier;
  });
  
  // Function to get type badge color
  const getTypeBadgeColor = (type: string) => {
    switch (type) {
      case "Report":
        return "bg-blue-500";
      case "Photo":
        return "bg-green-500";
      case "Tracking":
        return "bg-amber-500";
      default:
        return "bg-gray-500";
    }
  };
  
  // Get project name by id
  const getProjectName = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };
  
  // Get supplier name by id
  const getSupplierName = (supplierId?: string): string => {
    if (!supplierId) return "N/A";
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : "Unknown Supplier";
  };
  
  // Simulate opening local file
  const handleOpenFile = (url: string) => {
    console.log(`Opening file at: ${url}`);
    
    // In a real app, this might link to a file server or cloud storage
    // For demo, show a notification
    alert(`Opening file: ${url}`);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center">
          <ExternalLink className="h-6 w-6 mr-2" />
          External Links
        </h1>
      </div>
      
      {/* Filters */}
      <Card>
        <CardContent className="py-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Search</label>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search files..."
                  className="pl-8"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={typeFilter || "all"} onValueChange={(value) => setTypeFilter(value === "all" ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="Report">Reports</SelectItem>
                  <SelectItem value="Photo">Photos</SelectItem>
                  <SelectItem value="Tracking">Tracking</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Project</label>
              <Select value={projectFilter || "all"} onValueChange={(value) => setProjectFilter(value === "all" ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects.map(project => (
                    <SelectItem key={project.id} value={project.id}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block">Supplier</label>
              <Select value={supplierFilter || "all"} onValueChange={(value) => setSupplierFilter(value === "all" ? null : value)}>
                <SelectTrigger>
                  <SelectValue placeholder="All Suppliers" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Suppliers</SelectItem>
                  {suppliers.map(supplier => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* External Links Table */}
      <Card className="card-hover">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg font-medium">Files and Documents</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLinks.length > 0 ? (
                filteredLinks.map((link, index) => (
                  <TableRow key={link.id} className="hover:bg-secondary/50 transition-colors animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <TableCell className="font-medium">
                      <div className="flex items-center">
                        <File className="h-4 w-4 mr-2 text-muted-foreground" />
                        {link.title}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getTypeBadgeColor(link.type)}>
                        {link.type}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="link"
                        className="p-0 h-auto"
                        onClick={() => navigate(`/projects/${link.projectId}`)}
                      >
                        {getProjectName(link.projectId)}
                      </Button>
                    </TableCell>
                    <TableCell>
                      {link.supplierId ? (
                        <Button
                          variant="link"
                          className="p-0 h-auto"
                          onClick={() => navigate(`/suppliers/${link.supplierId}`)}
                        >
                          {getSupplierName(link.supplierId)}
                        </Button>
                      ) : (
                        "N/A"
                      )}
                    </TableCell>
                    <TableCell>{new Date(link.date).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <Button 
                        size="sm"
                        onClick={() => handleOpenFile(link.url)}
                      >
                        Open
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No files found matching the selected filters.
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
