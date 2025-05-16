
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
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

interface Shipment {
  id?: string;
  type: string;
  projectId: string;
  supplierId: string;
  poId?: string;
  partId?: string;
  shippedDate: string;
  etdDate: string;
  etaDate: string;
  trackingNumber?: string;
  containerNumber?: string;
  containerSize?: string;
  containerType?: string;
  status: string;
  notes?: string;
}

interface ShipmentFormProps {
  open: boolean;
  onClose: () => void;
  shipmentId?: string;
  poId?: string;
}

export default function ShipmentForm({
  open,
  onClose,
  shipmentId,
  poId,
}: ShipmentFormProps) {
  const { suppliers, projects, purchaseOrders } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shipment, setShipment] = useState<Shipment | null>(null);
  
  const [formData, setFormData] = useState<Shipment>({
    type: "Sea",
    projectId: "",
    supplierId: "",
    shippedDate: new Date().toISOString().substring(0, 10),
    etdDate: new Date().toISOString().substring(0, 10),
    etaDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
    status: "In Transit",
    notes: "",
  });
  
  // Load shipment data if editing
  useEffect(() => {
    const loadShipment = async () => {
      if (shipmentId) {
        try {
          const { data, error } = await supabase
            .from('shipments')
            .select('*')
            .eq('id', shipmentId)
            .single();
            
          if (error) throw error;
          
          if (data) {
            setShipment(data);
            setFormData({
              type: data.type || "Sea",
              projectId: data.project_id || "",
              supplierId: data.supplier_id || "",
              poId: data.po_id,
              partId: data.part_id,
              shippedDate: data.shipped_date,
              etdDate: data.etd_date,
              etaDate: data.eta_date,
              trackingNumber: data.tracking_number,
              containerNumber: data.container_number,
              containerSize: data.container_size,
              containerType: data.container_type,
              status: data.status || "In Transit",
              notes: data.notes,
            });
          }
        } catch (error) {
          console.error("Error loading shipment:", error);
          toast.error("Failed to load shipment data");
        }
      } else if (poId) {
        // Find the PO to pre-fill some data
        const po = purchaseOrders.find(p => p.id === poId);
        if (po) {
          setFormData(prev => ({
            ...prev,
            projectId: po.projectId,
            supplierId: po.supplierId,
            poId
          }));
        }
      }
    };
    
    if (open) {
      loadShipment();
    }
  }, [shipmentId, poId, open, purchaseOrders]);
  
  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      if (!shipmentId) {
        setFormData({
          type: "Sea",
          projectId: "",
          supplierId: "",
          shippedDate: new Date().toISOString().substring(0, 10),
          etdDate: new Date().toISOString().substring(0, 10),
          etaDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().substring(0, 10),
          status: "In Transit",
          notes: "",
        });
      }
    }
  }, [open, shipmentId]);
  
  const handleChange = (field: keyof Shipment, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Transform data for Supabase
      const shipmentData = {
        type: formData.type,
        project_id: formData.projectId,
        supplier_id: formData.supplierId,
        po_id: formData.poId,
        part_id: formData.partId,
        shipped_date: formData.shippedDate,
        etd_date: formData.etdDate,
        eta_date: formData.etaDate,
        tracking_number: formData.trackingNumber,
        container_number: formData.containerNumber,
        container_size: formData.containerSize,
        container_type: formData.containerType,
        status: formData.status,
        notes: formData.notes,
      };
      
      if (shipmentId) {
        // Update existing shipment
        const { error } = await supabase
          .from('shipments')
          .update(shipmentData)
          .eq('id', shipmentId);
          
        if (error) throw error;
        
        toast.success("Shipment updated successfully");
      } else {
        // Create new shipment
        const { error } = await supabase
          .from('shipments')
          .insert([shipmentData]);
          
        if (error) throw error;
        
        toast.success("Shipment created successfully");
      }
      
      onClose();
    } catch (error) {
      console.error("Error saving shipment:", error);
      toast.error("Failed to save shipment");
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {shipmentId ? "Edit Shipment" : "Create Shipment"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="type">Shipment Type*</Label>
              <Select
                value={formData.type}
                onValueChange={(value) => handleChange("type", value)}
                required
              >
                <SelectTrigger id="type">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Sea">Sea Freight</SelectItem>
                  <SelectItem value="Air">Air Freight</SelectItem>
                  <SelectItem value="Land">Land Transport</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status*</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => handleChange("status", value)}
                required
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="In Transit">In Transit</SelectItem>
                  <SelectItem value="Delivered">Delivered</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
                  <SelectItem value="Cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
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
              <Label htmlFor="po">Purchase Order</Label>
              <Select
                value={formData.poId || ""}
                onValueChange={(value) => handleChange("poId", value || undefined)}
              >
                <SelectTrigger id="po">
                  <SelectValue placeholder="Select a PO (optional)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">None</SelectItem>
                  {purchaseOrders
                    .filter(po => po.supplierId === formData.supplierId)
                    .map((po) => (
                      <SelectItem key={po.id} value={po.id}>
                        {po.poNumber}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="trackingNumber">Tracking Number</Label>
              <Input
                id="trackingNumber"
                value={formData.trackingNumber || ""}
                onChange={(e) => handleChange("trackingNumber", e.target.value)}
                placeholder="Enter tracking number"
              />
            </div>
            
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
              <Label htmlFor="etdDate">ETD (Estimated Time of Departure)*</Label>
              <Input
                id="etdDate"
                type="date"
                value={formData.etdDate}
                onChange={(e) => handleChange("etdDate", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="etaDate">ETA (Estimated Time of Arrival)*</Label>
              <Input
                id="etaDate"
                type="date"
                value={formData.etaDate}
                onChange={(e) => handleChange("etaDate", e.target.value)}
                required
              />
            </div>
          </div>
          
          {/* Container info - show only for sea freight */}
          {formData.type === "Sea" && (
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="containerNumber">Container Number</Label>
                <Input
                  id="containerNumber"
                  value={formData.containerNumber || ""}
                  onChange={(e) => handleChange("containerNumber", e.target.value)}
                  placeholder="Container number"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="containerSize">Container Size</Label>
                <Select
                  value={formData.containerSize || ""}
                  onValueChange={(value) => handleChange("containerSize", value)}
                >
                  <SelectTrigger id="containerSize">
                    <SelectValue placeholder="Size (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value="20ft">20ft</SelectItem>
                    <SelectItem value="40ft">40ft</SelectItem>
                    <SelectItem value="40ft HC">40ft High Cube</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="containerType">Container Type</Label>
                <Select
                  value={formData.containerType || ""}
                  onValueChange={(value) => handleChange("containerType", value)}
                >
                  <SelectTrigger id="containerType">
                    <SelectValue placeholder="Type (optional)" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    <SelectItem value="Dry">Dry</SelectItem>
                    <SelectItem value="Reefer">Reefer</SelectItem>
                    <SelectItem value="Open Top">Open Top</SelectItem>
                    <SelectItem value="Flat Rack">Flat Rack</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          
          {/* Notes Section */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ""}
              onChange={(e) => handleChange("notes", e.target.value)}
              placeholder="Enter any additional notes..."
              rows={3}
            />
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : shipmentId ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
