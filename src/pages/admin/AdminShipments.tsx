
import { useState, useEffect } from "react";
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
import { Plus, Search, Pencil, Trash, Ship, Calendar } from "lucide-react";
import { format } from "date-fns";
import ShipmentForm from "@/components/admin/ShipmentForm";
import { supabase } from "@/integrations/supabase/client";

interface Shipment {
  id: string;
  type: string;
  project_id: string;
  supplier_id: string;
  po_id?: string;
  part_id?: string;
  shipped_date: string;
  etd_date: string;
  eta_date: string;
  tracking_number?: string;
  container_number?: string;
  container_size?: string;
  container_type?: string;
  status: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export default function AdminShipments() {
  const { suppliers, projects, purchaseOrders } = useData();
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedShipmentId, setSelectedShipmentId] = useState<string | undefined>(undefined);
  
  // Load shipments from Supabase
  useEffect(() => {
    const loadShipments = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('shipments')
          .select('*')
          .order('created_at', { ascending: false });
        
        if (error) throw error;
        setShipments(data || []);
      } catch (error) {
        console.error("Error loading shipments:", error);
        toast.error("Failed to load shipments");
      } finally {
        setLoading(false);
      }
    };
    
    loadShipments();
  }, []);
  
  // Filter shipments
  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = 
      search === "" ||
      getProjectName(shipment.project_id).toLowerCase().includes(search.toLowerCase()) ||
      getSupplierName(shipment.supplier_id).toLowerCase().includes(search.toLowerCase()) ||
      (shipment.tracking_number || "").toLowerCase().includes(search.toLowerCase()) ||
      (shipment.container_number || "").toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter ? shipment.status === statusFilter : true;
    const matchesType = typeFilter ? shipment.type === typeFilter : true;
    
    return matchesSearch && matchesStatus && matchesType;
  });
  
  const handleDeleteShipment = async (id: string) => {
    if (confirm("Are you sure you want to delete this shipment?")) {
      try {
        const { error } = await supabase
          .from('shipments')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        setShipments(prev => prev.filter(s => s.id !== id));
        toast.success("Shipment deleted successfully");
      } catch (error) {
        console.error("Error deleting shipment:", error);
        toast.error("Failed to delete shipment");
      }
    }
  };
  
  const handleEditShipment = (id: string) => {
    setSelectedShipmentId(id);
    setIsFormOpen(true);
  };
  
  const handleAddShipment = () => {
    setSelectedShipmentId(undefined);
    setIsFormOpen(true);
  };
  
  const closeForm = async () => {
    setIsFormOpen(false);
    setSelectedShipmentId(undefined);
    
    // Reload shipments after form close
    try {
      const { data, error } = await supabase
        .from('shipments')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      setShipments(data || []);
    } catch (error) {
      console.error("Error reloading shipments:", error);
    }
  };
  
  // Helper functions to get names
  const getSupplierName = (supplierId: string): string => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : "Unknown Supplier";
  };
  
  const getProjectName = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };
  
  const getPoNumber = (poId?: string): string => {
    if (!poId) return "N/A";
    const po = purchaseOrders.find(p => p.id === poId);
    return po ? po.poNumber : "Unknown PO";
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold flex items-center">
          <Ship className="h-6 w-6 mr-2" /> Manage Shipments
        </h1>
        
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search shipments..."
              className="pl-8 w-[200px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Select
            value={statusFilter || "all"}
            onValueChange={(value) => setStatusFilter(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="In Transit">In Transit</SelectItem>
              <SelectItem value="Delivered">Delivered</SelectItem>
              <SelectItem value="Delayed">Delayed</SelectItem>
              <SelectItem value="Cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          
          <Select
            value={typeFilter || "all"}
            onValueChange={(value) => setTypeFilter(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-[130px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Sea">Sea Freight</SelectItem>
              <SelectItem value="Air">Air Freight</SelectItem>
              <SelectItem value="Land">Land Transport</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleAddShipment}>
            <Plus className="mr-2 h-4 w-4" />
            New Shipment
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Shipment List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center items-center h-40">
              <p>Loading shipments...</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>PO</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" /> ETA
                    </div>
                  </TableHead>
                  <TableHead>Tracking/Container</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredShipments.length > 0 ? (
                  filteredShipments.map((shipment) => (
                    <TableRow key={shipment.id}>
                      <TableCell>{shipment.type}</TableCell>
                      <TableCell>{getSupplierName(shipment.supplier_id)}</TableCell>
                      <TableCell>{getProjectName(shipment.project_id)}</TableCell>
                      <TableCell>{getPoNumber(shipment.po_id)}</TableCell>
                      <TableCell>
                        <span 
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            shipment.status === "In Transit" ? "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300" :
                            shipment.status === "Delivered" ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300" :
                            shipment.status === "Delayed" ? "bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-300" :
                            "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300"
                          }`}
                        >
                          {shipment.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {format(new Date(shipment.eta_date), "MMM d, yyyy")}
                      </TableCell>
                      <TableCell>
                        {shipment.type === "Sea" 
                          ? shipment.container_number || "N/A"
                          : shipment.tracking_number || "N/A"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="outline" 
                            size="icon"
                            onClick={() => handleEditShipment(shipment.id)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => handleDeleteShipment(shipment.id)}
                          >
                            <Trash className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="h-24 text-center">
                      No shipments found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <ShipmentForm 
        open={isFormOpen}
        onClose={closeForm}
        shipmentId={selectedShipmentId}
      />
    </div>
  );
}
