
import { useState, useEffect } from "react";
import { useData, Shipment, PurchaseOrder } from "@/contexts/DataContext";
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

interface ShipmentFormProps {
  open: boolean;
  onClose: () => void;
  shipment?: Shipment;
}

export default function ShipmentForm({
  open,
  onClose,
  shipment,
}: ShipmentFormProps) {
  const { suppliers, projects, purchaseOrders, addShipment, updateShipment } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Shipment, "id">>({
    projectId: "",
    supplierId: "",
    poId: "",
    partId: "",
    type: "Air Freight",
    shippedDate: new Date().toISOString().substring(0, 10),
    etdDate: new Date().toISOString().substring(0, 10),
    etaDate: new Date().toISOString().substring(0, 10),
  });

  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | null>(null);
  
  useEffect(() => {
    if (shipment) {
      setFormData({
        projectId: shipment.projectId,
        supplierId: shipment.supplierId,
        poId: shipment.poId,
        partId: shipment.partId,
        type: shipment.type,
        shippedDate: shipment.shippedDate.substring(0, 10),
        etdDate: shipment.etdDate.substring(0, 10),
        etaDate: shipment.etaDate.substring(0, 10),
        containerSize: shipment.containerSize,
        containerType: shipment.containerType,
        containerNumber: shipment.containerNumber,
        lockNumber: shipment.lockNumber,
      });
      
      // Find the selected PO
      const po = purchaseOrders.find(p => p.id === shipment.poId);
      if (po) {
        setSelectedPO(po);
      }
    } else {
      // Reset form for new shipment
      setFormData({
        projectId: "",
        supplierId: "",
        poId: "",
        partId: "",
        type: "Air Freight",
        shippedDate: new Date().toISOString().substring(0, 10),
        etdDate: new Date().toISOString().substring(0, 10),
        etaDate: new Date().toISOString().substring(0, 10),
      });
      setSelectedPO(null);
    }
  }, [shipment, open, purchaseOrders]);
  
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    // Handle special cases
    if (field === "projectId") {
      setFormData((prev) => ({ ...prev, poId: "", partId: "" }));
      setSelectedPO(null);
    } else if (field === "supplierId") {
      setFormData((prev) => ({ ...prev, poId: "", partId: "" }));
      setSelectedPO(null);
    } else if (field === "poId") {
      const po = purchaseOrders.find(p => p.id === value);
      if (po) {
        setSelectedPO(po);
        setFormData((prev) => ({ ...prev, partId: "" }));
      } else {
        setSelectedPO(null);
      }
    }
  };
  
  // Filter POs based on the selected project and supplier
  const filteredPOs = purchaseOrders.filter(po => 
    po.projectId === formData.projectId && po.supplierId === formData.supplierId
  );
  
  // Get available parts based on the selected PO
  const availableParts = selectedPO ? selectedPO.parts : [];
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.projectId || !formData.supplierId || !formData.poId || !formData.partId) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    // If ocean freight, require container details
    if (formData.type === "Ocean Freight" && (!formData.containerSize || !formData.containerType || !formData.containerNumber)) {
      toast.error("Please fill in all container details for ocean freight");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (shipment) {
        // Update existing shipment
        updateShipment(shipment.id, formData);
        toast.success("Shipment updated successfully");
      } else {
        // Add new shipment
        addShipment(formData);
        toast.success("Shipment added successfully");
      }
      onClose();
    } catch (error) {
      toast.error("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {shipment ? "Edit Shipment" : "Create Shipment"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
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
            
            <div className="space-y-2">
              <Label htmlFor="supplier">Supplier*</Label>
              <Select
                value={formData.supplierId}
                onValueChange={(value) => handleChange("supplierId", value)}
                required
              >
                <SelectTrigger id="supplier">
                  <SelectValue placeholder="Select a supplier" />
                </SelectTrigger>
                <SelectContent>
                  {suppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>
                      {supplier.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="po">Purchase Order*</Label>
              <Select
                value={formData.poId}
                onValueChange={(value) => handleChange("poId", value)}
                required
                disabled={!formData.projectId || !formData.supplierId}
              >
                <SelectTrigger id="po">
                  <SelectValue placeholder="Select a PO" />
                </SelectTrigger>
                <SelectContent>
                  {filteredPOs.map((po) => (
                    <SelectItem key={po.id} value={po.id}>
                      {po.poNumber}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="part">Part*</Label>
              <Select
                value={formData.partId}
                onValueChange={(value) => handleChange("partId", value)}
                required
                disabled={!selectedPO}
              >
                <SelectTrigger id="part">
                  <SelectValue placeholder="Select a part" />
                </SelectTrigger>
                <SelectContent>
                  {availableParts.map((part) => (
                    <SelectItem key={part.id} value={part.id}>
                      {part.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="type">Shipment Type*</Label>
              <Select
                value={formData.type}
                onValueChange={(value: "Air Freight" | "Ocean Freight") => 
                  handleChange("type", value)
                }
                required
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Air Freight">Air Freight</SelectItem>
                  <SelectItem value="Ocean Freight">Ocean Freight</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="shippedDate">Shipped Date*</Label>
              <Input
                id="shippedDate"
                type="date"
                value={formData.shippedDate}
                onChange={(e) => handleChange("shippedDate", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="etdDate">ETD Date*</Label>
              <Input
                id="etdDate"
                type="date"
                value={formData.etdDate}
                onChange={(e) => handleChange("etdDate", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="etaDate">ETA Date*</Label>
              <Input
                id="etaDate"
                type="date"
                value={formData.etaDate}
                onChange={(e) => handleChange("etaDate", e.target.value)}
                required
              />
            </div>
          </div>
          
          {formData.type === "Ocean Freight" && (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="containerSize">Container Size*</Label>
                <Select
                  value={formData.containerSize || ""}
                  onValueChange={(value) => handleChange("containerSize", value)}
                  required
                >
                  <SelectTrigger id="containerSize">
                    <SelectValue placeholder="Select size" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="20ft">20ft</SelectItem>
                    <SelectItem value="40ft">40ft</SelectItem>
                    <SelectItem value="45ft">45ft</SelectItem>
                    <SelectItem value="LCL">LCL</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="containerType">Container Type*</Label>
                <Select
                  value={formData.containerType || ""}
                  onValueChange={(value) => handleChange("containerType", value)}
                  required
                >
                  <SelectTrigger id="containerType">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Dry">Dry</SelectItem>
                    <SelectItem value="Refrigerated">Refrigerated</SelectItem>
                    <SelectItem value="Open Top">Open Top</SelectItem>
                    <SelectItem value="Flat Rack">Flat Rack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="containerNumber">Container Number*</Label>
                <Input
                  id="containerNumber"
                  value={formData.containerNumber || ""}
                  onChange={(e) => handleChange("containerNumber", e.target.value)}
                  placeholder="ABCD1234567"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lockNumber">Lock Number</Label>
                <Input
                  id="lockNumber"
                  value={formData.lockNumber || ""}
                  onChange={(e) => handleChange("lockNumber", e.target.value)}
                  placeholder="Lock number"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : shipment ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
