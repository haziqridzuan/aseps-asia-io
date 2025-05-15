
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
import { Plus, Search, Pencil, Trash } from "lucide-react";
import { format } from "date-fns";
import ShipmentForm from "@/components/admin/ShipmentForm";
import { Shipment } from "@/contexts/DataContext";

export default function AdminShipments() {
  const { shipments, suppliers, projects, deleteShipment } = useData();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState<Shipment | undefined>(undefined);
  
  const filteredShipments = shipments.filter(shipment => {
    const matchesSearch = 
      search === "" ||
      getSupplierName(shipment.supplierId).toLowerCase().includes(search.toLowerCase()) ||
      getProjectName(shipment.projectId).toLowerCase().includes(search.toLowerCase());
    
    const matchesType = typeFilter ? shipment.type === typeFilter : true;
    
    return matchesSearch && matchesType;
  });
  
  const handleDeleteShipment = (id: string) => {
    if (confirm("Are you sure you want to delete this shipment?")) {
      deleteShipment(id);
      toast.success("Shipment deleted successfully");
    }
  };
  
  const handleEditShipment = (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setIsFormOpen(true);
  };
  
  const handleAddShipment = () => {
    setSelectedShipment(undefined);
    setIsFormOpen(true);
  };
  
  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedShipment(undefined);
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
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Manage Shipments</h1>
        
        <div className="flex items-center gap-2">
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
            value={typeFilter || "all"}
            onValueChange={(value) => setTypeFilter(value === "all" ? null : value)}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="Air Freight">Air Freight</SelectItem>
              <SelectItem value="Ocean Freight">Ocean Freight</SelectItem>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Project</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Shipped Date</TableHead>
                <TableHead>ETD</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredShipments.length > 0 ? (
                filteredShipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-medium">{getProjectName(shipment.projectId)}</TableCell>
                    <TableCell>{getSupplierName(shipment.supplierId)}</TableCell>
                    <TableCell>
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          shipment.type === "Air Freight" ? "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300" :
                          "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300"
                        }`}
                      >
                        {shipment.type}
                      </span>
                    </TableCell>
                    <TableCell>{format(new Date(shipment.shippedDate), "MMM d, yyyy")}</TableCell>
                    <TableCell>{format(new Date(shipment.etdDate), "MMM d, yyyy")}</TableCell>
                    <TableCell>{format(new Date(shipment.etaDate), "MMM d, yyyy")}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleEditShipment(shipment)}
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
                  <TableCell colSpan={7} className="h-24 text-center">
                    No shipments found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <ShipmentForm 
        open={isFormOpen}
        onClose={closeForm}
        shipment={selectedShipment}
      />
    </div>
  );
}
