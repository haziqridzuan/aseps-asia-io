import { useState, useEffect } from "react";
import { useData, PurchaseOrder, Part } from "@/contexts/DataContext";
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
import { toast } from "@/components/ui/use-toast";
import { Trash, Plus } from "lucide-react";
import { Slider } from "@/components/ui/slider";

interface PurchaseOrderFormProps {
  open: boolean;
  onClose: () => void;
  purchaseOrder?: PurchaseOrder;
}

export default function PurchaseOrderForm({
  open,
  onClose,
  purchaseOrder,
}: PurchaseOrderFormProps) {
  const { suppliers, projects, addPurchaseOrder, updatePurchaseOrder } = useData();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState<Omit<PurchaseOrder, "id">>({
    poNumber: "",
    projectId: "",
    supplierId: "",
    status: "Active",
    deadline: "",
    issuedDate: new Date().toISOString().substring(0, 10),
    progress: 0,
    amount: 0,
    parts: [{ 
      id: `part-${Date.now()}`, 
      name: "", 
      quantity: 1, 
      status: "Pending",
      progress: 0 
    }],
  });
  
  useEffect(() => {
    if (purchaseOrder) {
      setFormData({
        poNumber: purchaseOrder.poNumber,
        projectId: purchaseOrder.projectId,
        supplierId: purchaseOrder.supplierId,
        status: purchaseOrder.status,
        deadline: purchaseOrder.deadline.substring(0, 10),
        issuedDate: purchaseOrder.issuedDate.substring(0, 10),
        progress: purchaseOrder.progress || 0, 
        amount: purchaseOrder.amount || 0,
        parts: purchaseOrder.parts.map(part => ({
          ...part,
          progress: part.progress || 0
        })),
      });
    } else {
      // Reset form for new PO
      setFormData({
        poNumber: "",
        projectId: "",
        supplierId: "",
        status: "Active",
        deadline: "",
        issuedDate: new Date().toISOString().substring(0, 10),
        progress: 0,
        amount: 0,
        parts: [{ 
          id: `part-${Date.now()}`, 
          name: "", 
          quantity: 1, 
          status: "Pending",
          progress: 0 
        }],
      });
    }
  }, [purchaseOrder, open]);
  
  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };
  
  const handlePartChange = (index: number, field: string, value: any) => {
    setFormData((prev) => {
      const newParts = [...prev.parts];
      newParts[index] = { 
        ...newParts[index], 
        [field]: field === 'quantity' || field === 'progress' ? Number(value) : value 
      };
      return { ...prev, parts: newParts };
    });
  };
  
  const addPart = () => {
    setFormData((prev) => ({
      ...prev,
      parts: [
        ...prev.parts,
        { 
          id: `part-${Date.now()}`, 
          name: "", 
          quantity: 1, 
          status: "Pending",
          progress: 0 
        },
      ],
    }));
  };
  
  const removePart = (index: number) => {
    if (formData.parts.length <= 1) {
      toast.error("Purchase order must have at least one part");
      return;
    }
    
    setFormData((prev) => {
      const newParts = [...prev.parts];
      newParts.splice(index, 1);
      return { ...prev, parts: newParts };
    });
  };

  // Calculate progress based on parts progress
  const calculateProgressFromParts = () => {
    if (!formData.parts.length) return 0;
    
    const totalProgress = formData.parts.reduce((sum, part) => sum + (part.progress || 0), 0);
    return Math.round(totalProgress / formData.parts.length);
  };
  
  // Update progress when parts status changes
  useEffect(() => {
    if (formData.progress === 0 || formData.progress === undefined) {
      const calculatedProgress = calculateProgressFromParts();
      setFormData(prev => ({ ...prev, progress: calculatedProgress }));
    }
  }, [formData.parts]);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.poNumber || !formData.projectId || !formData.supplierId || !formData.deadline) {
      toast.error("Please fill in all required fields");
      return;
    }
    
    if (formData.parts.some(part => !part.name)) {
      toast.error("All parts must have a name");
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (purchaseOrder) {
        // Update existing PO
        updatePurchaseOrder(purchaseOrder.id, formData);
        toast.success("Purchase order updated successfully");
      } else {
        // Add new PO
        addPurchaseOrder(formData);
        toast.success("Purchase order added successfully");
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
            {purchaseOrder ? "Edit Purchase Order" : "Create Purchase Order"}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="poNumber">PO Number*</Label>
              <Input
                id="poNumber"
                value={formData.poNumber}
                onChange={(e) => handleChange("poNumber", e.target.value)}
                placeholder="PO-2025-001"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="issuedDate">Issue Date*</Label>
              <Input
                id="issuedDate"
                type="date"
                value={formData.issuedDate}
                onChange={(e) => handleChange("issuedDate", e.target.value)}
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
              <Label htmlFor="status">Status*</Label>
              <Select
                value={formData.status}
                onValueChange={(value: "Active" | "Completed" | "Delayed") => 
                  handleChange("status", value)
                }
                required
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                  <SelectItem value="Delayed">Delayed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="deadline">Deadline*</Label>
              <Input
                id="deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => handleChange("deadline", e.target.value)}
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)*</Label>
              <Input
                id="amount"
                type="number"
                min="0"
                step="0.01"
                value={formData.amount}
                onChange={(e) => handleChange("amount", parseFloat(e.target.value) || 0)}
                required
                placeholder="0.00"
              />
            </div>
          </div>
          
          {/* Progress Section */}
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <Label htmlFor="progress">Progress: {formData.progress}%</Label>
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                onClick={() => handleChange("progress", calculateProgressFromParts())}
              >
                Auto-calculate
              </Button>
            </div>
            <Slider
              id="progress"
              value={[formData.progress]}
              min={0}
              max={100}
              step={1}
              onValueChange={(values) => handleChange("progress", values[0])}
            />
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">Parts</h3>
              <Button type="button" variant="outline" size="sm" onClick={addPart}>
                <Plus className="h-4 w-4 mr-2" />
                Add Part
              </Button>
            </div>
            
            {formData.parts.map((part, index) => (
              <div key={part.id} className="grid grid-cols-12 gap-4 mb-4 p-3 border rounded">
                <div className="space-y-2 col-span-6">
                  <Label htmlFor={`part-name-${index}`}>Part Name</Label>
                  <Input
                    id={`part-name-${index}`}
                    value={part.name}
                    onChange={(e) => handlePartChange(index, "name", e.target.value)}
                    placeholder="Part name"
                    required
                  />
                </div>
                
                <div className="space-y-2 col-span-2">
                  <Label htmlFor={`part-quantity-${index}`}>Quantity</Label>
                  <Input
                    id={`part-quantity-${index}`}
                    type="number"
                    min="1"
                    value={part.quantity}
                    onChange={(e) => handlePartChange(index, "quantity", e.target.value)}
                    required
                  />
                </div>
                
                <div className="space-y-2 col-span-3">
                  <Label htmlFor={`part-status-${index}`}>Status</Label>
                  <Select
                    value={part.status}
                    onValueChange={(value: "In Progress" | "Completed" | "Pending" | "Delayed") => 
                      handlePartChange(index, "status", value)
                    }
                  >
                    <SelectTrigger id={`part-status-${index}`}>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Pending">Pending</SelectItem>
                      <SelectItem value="In Progress">In Progress</SelectItem>
                      <SelectItem value="Completed">Completed</SelectItem>
                      <SelectItem value="Delayed">Delayed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2 col-span-9">
                  <div className="flex justify-between">
                    <Label htmlFor={`part-progress-${index}`}>Progress: {part.progress || 0}%</Label>
                  </div>
                  <Slider
                    id={`part-progress-${index}`}
                    value={[part.progress || 0]}
                    min={0}
                    max={100}
                    step={1}
                    onValueChange={(values) => handlePartChange(index, "progress", values[0])}
                  />
                </div>
                
                <div className="flex items-end justify-end col-span-3">
                  <Button 
                    type="button" 
                    variant="destructive" 
                    size="icon"
                    onClick={() => removePart(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Saving..." : purchaseOrder ? "Update" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
