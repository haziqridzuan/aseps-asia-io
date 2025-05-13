
import { useState } from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SupplierForm } from "@/components/admin/SupplierForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

export default function AdminSuppliers() {
  const { suppliers, deleteSupplier, purchaseOrders } = useData();
  const [search, setSearch] = useState("");
  
  const filteredSuppliers = suppliers.filter(supplier =>
    supplier.name.toLowerCase().includes(search.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(search.toLowerCase()) ||
    supplier.email.toLowerCase().includes(search.toLowerCase()) ||
    supplier.country.toLowerCase().includes(search.toLowerCase())
  );
  
  const handleDeleteSupplier = (supplierId: string) => {
    // Check if supplier has associated purchase orders
    const supplierPOs = purchaseOrders.filter(po => po.supplierId === supplierId);
    
    if (supplierPOs.length > 0) {
      toast.error("Cannot delete supplier with associated purchase orders");
      return;
    }
    
    if (confirm("Are you sure you want to delete this supplier?")) {
      deleteSupplier(supplierId);
      toast.success("Supplier deleted successfully");
    }
  };
  
  // Get purchase order count for a supplier
  const getSupplierPOCount = (supplierId: string): number => {
    return purchaseOrders.filter(po => po.supplierId === supplierId).length;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Manage Suppliers</h1>
        
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search suppliers..."
              className="pl-8 w-[200px] md:w-[300px]"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Supplier
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>Add New Supplier</DialogTitle>
              </DialogHeader>
              <SupplierForm 
                onSuccess={() => {
                  toast.success("Supplier created successfully");
                  document.querySelector<HTMLButtonElement>("[data-state='open'] button[aria-label='Close']")?.click();
                }}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle>Supplier List</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Purchase Orders</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell className="font-medium">{supplier.name}</TableCell>
                    <TableCell>{supplier.contactPerson}</TableCell>
                    <TableCell>{supplier.email}</TableCell>
                    <TableCell>{supplier.country}</TableCell>
                    <TableCell>{getSupplierPOCount(supplier.id)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="icon"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Edit Supplier</DialogTitle>
                            </DialogHeader>
                            <SupplierForm 
                              supplierId={supplier.id}
                              onSuccess={() => {
                                toast.success("Supplier updated successfully");
                                document.querySelector<HTMLButtonElement>("[data-state='open'] button[aria-label='Close']")?.click();
                              }}
                            />
                          </DialogContent>
                        </Dialog>
                        
                        <Button
                          variant="destructive"
                          size="icon"
                          onClick={() => handleDeleteSupplier(supplier.id)}
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
                    No suppliers found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
