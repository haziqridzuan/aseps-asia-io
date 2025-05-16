
import { useState, useEffect } from "react";
import { useData, Client } from "@/contexts/DataContext";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface ClientFormProps {
  clientId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ClientForm({ clientId, onSuccess, onCancel }: ClientFormProps) {
  const { clients, addClient, updateClient } = useData();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  
  const [formData, setFormData] = useState<Omit<Client, "id">>({
    name: "",
    contactPerson: "",
    email: "",
    phone: "",
    location: "",
  });
  
  // If editing, load the client data
  useEffect(() => {
    if (clientId) {
      const client = clients.find(c => c.id === clientId);
      if (client) {
        setFormData({
          name: client.name,
          contactPerson: client.contactPerson || "",
          email: client.email || "",
          phone: client.phone || "",
          location: client.location || "",
        });
      }
    }
  }, [clientId, clients]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      if (clientId) {
        updateClient(clientId, formData);
        toast({
          title: "Client updated",
          description: "The client has been updated successfully",
        });
      } else {
        addClient(formData);
        toast({
          title: "Client created",
          description: "A new client has been created successfully",
        });
      }
      
      if (onSuccess) {
        onSuccess();
      }
    } catch (error) {
      console.error("Error saving client:", error);
      toast({
        title: "Error",
        description: "There was an error saving the client",
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
          <label htmlFor="name" className="text-sm font-medium">Client Name</label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="space-y-2">
          <label htmlFor="location" className="text-sm font-medium">Location</label>
          <Input
            id="location"
            name="location"
            value={formData.location}
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
      </div>
      
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
        )}
        
        <Button type="submit" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {clientId ? "Update Client" : "Create Client"}
        </Button>
      </div>
    </form>
  );
}
