
import { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { ExternalLink } from "@/contexts/DataContext";

interface ExternalLinkFormProps {
  open: boolean;
  onClose: () => void;
  link?: ExternalLink;
}

export default function ExternalLinkForm({
  open,
  onClose,
  link,
}: ExternalLinkFormProps) {
  const { suppliers, projects, purchaseOrders, addExternalLink, updateExternalLink } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<{
    title: string;
    type: "Report" | "Photo" | "Tracking";
    projectId: string;
    supplierId?: string;
    poId?: string;
    url: string;
    date: string;
  }>({
    title: "",
    type: "Report",
    projectId: "",
    supplierId: undefined,
    poId: undefined,
    url: "",
    date: new Date().toISOString().substring(0, 10),
  });
  
  useEffect(() => {
    if (link) {
      setFormData({
        title: link.title,
        type: link.type,
        projectId: link.projectId,
        supplierId: link.supplierId,
        poId: link.poId,
        url: link.url,
        date: link.date.substring(0, 10),
      });
    } else {
      // Reset form for new link
      setFormData({
        title: "",
        type: "Report",
        projectId: "",
        supplierId: undefined,
        poId: undefined,
        url: "",
        date: new Date().toISOString().substring(0, 10),
      });
    }
  }, [link, open]);
  
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => {
      // If changing project, reset supplier and PO if they're not related to this project
      if (field === 'projectId') {
        return { 
          ...prev, 
          [field]: value, 
          supplierId: undefined, 
          poId: undefined 
        };
      }
      return { ...prev, [field]: value };
    });
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.title || !formData.url || !formData.projectId) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (link) {
        // Update existing link
        updateExternalLink(link.id, formData);
        toast.success("External link updated successfully");
      } else {
        // Add new link
        addExternalLink({
          ...formData,
          date: formData.date || new Date().toISOString(),
        });
        toast.success("External link added successfully");
      }
      onClose();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Filter purchase orders by selected project
  const filteredPOs = purchaseOrders.filter(po => po.projectId === formData.projectId);
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {link ? "Edit External Link" : "Add External Link"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Title*</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Link title"
              required
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Type*</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "Report" | "Photo" | "Tracking") => 
                  handleChange("type", value)
                }
                required
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Report">Report</SelectItem>
                  <SelectItem value="Photo">Photo</SelectItem>
                  <SelectItem value="Tracking">Tracking</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="date">Date*</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => handleChange("date", e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="url">URL*</Label>
            <Input
              id="url"
              value={formData.url}
              onChange={(e) => handleChange("url", e.target.value)}
              placeholder="https://example.com/document.pdf"
              required
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="project">Project*</Label>
            <Select
              value={formData.projectId}
              onValueChange={(value) => handleChange("projectId", value)}
              required
            >
              <SelectTrigger id="project">
                <SelectValue placeholder="Select a project" />
              </SelectTrigger>
              <SelectContent>
                {projects.map((project) => (
                  <SelectItem key={project.id} value={project.id}>
                    {project.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="supplier">Related Supplier (Optional)</Label>
              <Select
                value={formData.supplierId || ""}
                onValueChange={(value) => handleChange("supplierId", value || undefined)}
              >
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="po">Related Purchase Order (Optional)</Label>
              <Select
                value={formData.poId || ""}
                onValueChange={(value) => handleChange("poId", value || undefined)}
                disabled={!formData.projectId || filteredPOs.length === 0}
              >
                <SelectTrigger id="po">
                  <SelectValue placeholder={!formData.projectId ? "Select a project first" : filteredPOs.length === 0 ? "No POs for this project" : "Select a PO"} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {filteredPOs.map((po) => (
                    <SelectItem key={po.id} value={po.id}>
                      {po.poNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : link ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
