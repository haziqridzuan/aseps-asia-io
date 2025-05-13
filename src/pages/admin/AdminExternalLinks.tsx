
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";
import { Plus, Search, Pencil, Trash, ExternalLink as ExternalLinkIcon } from "lucide-react";
import { ExternalLink } from "@/contexts/DataContext";
import ExternalLinkForm from "@/components/admin/ExternalLinkForm";

export default function AdminExternalLinks() {
  const { externalLinks, projects, suppliers, deleteExternalLink } = useData();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<ExternalLink | undefined>(undefined);
  
  const filteredLinks = externalLinks.filter(link => {
    const matchesSearch = 
      search === "" ||
      link.title.toLowerCase().includes(search.toLowerCase()) ||
      link.url.toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter ? link.type === typeFilter : true;
    
    return matchesSearch && matchesType;
  });
  
  const handleDeleteLink = (linkId: string) => {
    if (confirm("Are you sure you want to delete this external link?")) {
      deleteExternalLink(linkId);
      toast.success("External link deleted successfully");
    }
  };
  
  const handleEditLink = (link: ExternalLink) => {
    setSelectedLink(link);
    setIsFormOpen(true);
  };
  
  const handleAddLink = () => {
    setSelectedLink(undefined);
    setIsFormOpen(true);
  };
  
  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedLink(undefined);
  };
  
  // Helper functions to get names
  const getProjectName = (projectId: string | null): string => {
    if (!projectId) return "N/A";
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };
  
  const getSupplierName = (supplierId: string | null): string => {
    if (!supplierId) return "N/A";
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : "Unknown Supplier";
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Manage External Links</h1>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search links..."
              className="pl-8 w-[200px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Select
            value={typeFilter || "all"}
            onValueChange={(value) => setTypeFilter(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Report">Reports</SelectItem>
              <SelectItem value="Photo">Photos</SelectItem>
              <SelectItem value="Tracking">Tracking</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleAddLink}>
            <Plus className="mr-2 h-4 w-4" />
            Add Link
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>External Links List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>URL</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLinks.length > 0 ? (
                filteredLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">{link.title}</TableCell>
                    <TableCell>
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          link.type === "Report" ? "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300" :
                          link.type === "Photo" ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300" :
                          link.type === "Tracking" ? "bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-300" :
                          "bg-gray-100 text-gray-800 dark:bg-gray-800/20 dark:text-gray-300"
                        }`}
                      >
                        {link.type}
                      </span>
                    </TableCell>
                    <TableCell>{getProjectName(link.projectId)}</TableCell>
                    <TableCell>{getSupplierName(link.supplierId)}</TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      <a 
                        href={link.url} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-primary hover:underline flex items-center"
                      >
                        <span className="truncate">{link.url}</span>
                        <ExternalLinkIcon className="ml-1 h-3 w-3" />
                      </a>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleEditLink(link)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteLink(link.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No external links found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <ExternalLinkForm 
        open={isFormOpen}
        onClose={closeForm}
        link={selectedLink}
      />
    </div>
  );
}
