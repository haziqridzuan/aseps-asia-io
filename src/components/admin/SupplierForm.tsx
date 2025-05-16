
import { useState, useEffect } from "react";
import { useData, Supplier } from "@/contexts/DataContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface SupplierFormProps {
  supplierId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function SupplierForm({ supplierId, onSuccess, onCancel }: SupplierFormProps) {
  const { suppliers, addSupplier, updateSupplier } = useData();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Supplier, "id">>({
    name: "",
    country: "",
    contactPerson: "",
    email: "",
    phone: "",
    rating: 3,
    onTimeDelivery: 80,
    positiveComments: [],
    negativeComments: [],
  });
  
  const [positiveComments, setPositiveComments] = useState("");
  const [negativeComments, setNegativeComments] = useState("");
  
  // If editing, load the supplier data
  useEffect(() => {
    if (supplierId) {
      const supplier = suppliers.find(s => s.id === supplierId);
      if (supplier) {
        setFormData({
          name: supplier.name,
          country: supplier.country || "",
          contactPerson: supplier.contactPerson || "",
          email: supplier.email || "",
          phone: supplier.phone || "",
          rating: supplier.rating || 3,
          onTimeDelivery: supplier.onTimeDelivery || 80,
          positiveComments: [...(supplier.positiveComments || [])],
          negativeComments: [...(supplier.negativeComments || [])],
        });
        
        setPositiveComments((supplier.positiveComments || []).join('\n'));
        setNegativeComments((supplier.negativeComments || []).join('\n'));
      }
    }
  }, [supplierId, suppliers]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === "positiveComments") {
      setPositiveComments(value);
    } else if (name === "negativeComments") {
      setNegativeComments(value);
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleNumberChange = (name: string, value: string) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      setFormData(prev => ({ ...prev, [name]: numValue }));
    }
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Process comments
      const processedFormData = {
        ...formData,
        positiveComments: positiveComments.split('\n').filter(c => c.trim() !== ''),
        negativeComments: negativeComments.split('\n').filter(c => c.trim() !== '')
      };
      
      if (supplierId) {
        updateSupplier(supplierId, processedFormData);
        toast({
          title: "Supplier updated",
          description: "The supplier has been updated successfully",
        });
      } else {
        addSupplier(processedFormData);
        toast({
          title: "Supplier created",
          description: "A new supplier has been created successfully",
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving supplier:", error);
      toast({
        title: "Error",
        description: "There was an error saving the supplier",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">Supplier Name</label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="country" className="text-sm font-medium">Country</label>
          <Input
            id="country"
            name="country"
            value={formData.country}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="contactPerson" className="text-sm font-medium">Contact Person</label>
          <Input
            id="contactPerson"
            name="contactPerson"
            value={formData.contactPerson}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">Email</label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="phone" className="text-sm font-medium">Phone</label>
          <Input
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="rating" className="text-sm font-medium">Rating (out of 5)</label>
          <Input
            id="rating"
            type="number"
            min="0"
            max="5"
            step="0.1"
            value={formData.rating}
            onChange={(e) => handleNumberChange("rating", e.target.value)}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="onTimeDelivery" className="text-sm font-medium">On-Time Delivery (%)</label>
          <Input
            id="onTimeDelivery"
            type="number"
            min="0"
            max="100"
            value={formData.onTimeDelivery}
            onChange={(e) => handleNumberChange("onTimeDelivery", e.target.value)}
            required
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <label htmlFor="positiveComments" className="text-sm font-medium">Positive Comments</label>
          <Textarea
            id="positiveComments"
            name="positiveComments"
            value={positiveComments}
            onChange={handleChange}
            placeholder="Enter one comment per line"
            rows={4}
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="negativeComments" className="text-sm font-medium">Areas for Improvement</label>
          <Textarea
            id="negativeComments"
            name="negativeComments"
            value={negativeComments}
            onChange={handleChange}
            placeholder="Enter one comment per line"
            rows={4}
          />
        </div>
      </div>
      
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {supplierId ? "Update Supplier" : "Create Supplier"}
        </Button>
      </div>
    </form>
  );
}
