
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
import PurchaseOrderForm from "@/components/admin/PurchaseOrderForm";
import { PurchaseOrder } from "@/contexts/DataContext";

export default function AdminPurchaseOrders() {
  const { purchaseOrders, suppliers, projects, deletePurchaseOrder } = useData();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedPO, setSelectedPO] = useState<PurchaseOrder | undefined>(undefined);
  
  // Display each PO independently instead of grouping by PO number
  const filteredPOs = purchaseOrders.filter(po => {
    const matchesSearch = 
      search === "" ||
      po.poNumber.toLowerCase().includes(search.toLowerCase()) ||
      getSupplierName(po.supplierId).toLowerCase().includes(search.toLowerCase()) ||
      getProjectName(po.projectId).toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter ? po.status === statusFilter : true;
    
    return matchesSearch && matchesStatus;
  });
  
  const handleDeletePO = (poId: string) => {
    if (confirm("Are you sure you want to delete this purchase order?")) {
      deletePurchaseOrder(poId);
      toast.success("Purchase order deleted successfully");
    }
  };
  
  const handleEditPO = (po: PurchaseOrder) => {
    setSelectedPO(po);
    setIsFormOpen(true);
  };
  
  const handleAddPO = () => {
    setSelectedPO(undefined);
    setIsFormOpen(true);
  };
  
  const closeForm = () => {
    setIsFormOpen(false);
    setSelectedPO(undefined);
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
        <h1 className="text-2xl font-bold">Manage Purchase Orders</h1>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search POs..."
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
              <SelectItem value="Active">Active</SelectItem>
              <SelectItem value="Completed">Completed</SelectItem>
              <SelectItem value="Delayed">Delayed</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={handleAddPO}>
            <Plus className="mr-2 h-4 w-4" />
            New PO
          </Button>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Purchase Order List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>PO Number</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>Project</TableHead>
                <TableHead>Issue Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Amount ($)</TableHead>
                <TableHead>Parts</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPOs.length > 0 ? (
                filteredPOs.map((po) => (
                  <TableRow key={po.id}>
                    <TableCell className="font-medium">{po.poNumber}</TableCell>
                    <TableCell>{getSupplierName(po.supplierId)}</TableCell>
                    <TableCell>{getProjectName(po.projectId)}</TableCell>
                    <TableCell>{format(new Date(po.issuedDate), "MMM d, yyyy")}</TableCell>
                    <TableCell>
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          po.status === "Active" ? "bg-green-100 text-green-800 dark:bg-green-800/20 dark:text-green-300" :
                          po.status === "Completed" ? "bg-blue-100 text-blue-800 dark:bg-blue-800/20 dark:text-blue-300" :
                          po.status === "Delayed" ? "bg-amber-100 text-amber-800 dark:bg-amber-800/20 dark:text-amber-300" :
                          "bg-red-100 text-red-800 dark:bg-red-800/20 dark:text-red-300"
                        }`}
                      >
                        {po.status}
                      </span>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">{po.description || '-'}</TableCell>
                    <TableCell>{po.amount ? `$${po.amount.toLocaleString()}` : '-'}</TableCell>
                    <TableCell>{po.parts.length}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={() => handleEditPO(po)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeletePO(po.id)}
                        >
                          <Trash className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="h-24 text-center">
                    No purchase orders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      
      <PurchaseOrderForm 
        open={isFormOpen}
        onClose={closeForm}
        purchaseOrder={selectedPO}
      />
    </div>
  );
}
