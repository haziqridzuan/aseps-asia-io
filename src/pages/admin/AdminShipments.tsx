
import React, { useState } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, FileEdit, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from "sonner";

export default function AdminShipments() {
  const { shipments, suppliers, projects } = useData();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingShipment, setEditingShipment] = useState<null | string>(null);

  const handleOpenNewForm = () => {
    setEditingShipment(null);
    setIsFormOpen(true);
  };

  const handleOpenEditForm = (shipmentId: string) => {
    setEditingShipment(shipmentId);
    setIsFormOpen(true);
  };

  const handleDeleteShipment = (id: string) => {
    toast.error("Delete functionality not yet implemented", {
      description: "This feature will be available soon."
    });
  };
  
  const getProjectName = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  };
  
  const getSupplierName = (supplierId: string) => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : 'Unknown Supplier';
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Shipments</h1>
        <Button onClick={handleOpenNewForm}>
          <Plus className="mr-2 h-4 w-4" /> Add Shipment
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Shipments</CardTitle>
          <CardDescription>Manage shipments for all projects</CardDescription>
        </CardHeader>
        <CardContent>
          {shipments.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No shipments found. Add a shipment to get started.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Supplier</TableHead>
                  <TableHead>Shipped Date</TableHead>
                  <TableHead>ETA</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {shipments.map((shipment) => (
                  <TableRow key={shipment.id}>
                    <TableCell>{shipment.type}</TableCell>
                    <TableCell>{getProjectName(shipment.projectId)}</TableCell>
                    <TableCell>{getSupplierName(shipment.supplierId)}</TableCell>
                    <TableCell>{format(new Date(shipment.shippedDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{format(new Date(shipment.etaDate), 'MMM dd, yyyy')}</TableCell>
                    <TableCell>{shipment.status}</TableCell>
                    <TableCell>
                      <div className="flex space-x-2">
                        <Button variant="ghost" size="icon" onClick={() => handleOpenEditForm(shipment.id)}>
                          <FileEdit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => handleDeleteShipment(shipment.id)}>
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>{editingShipment ? 'Edit Shipment' : 'Add New Shipment'}</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-center text-muted-foreground">Shipment form will be implemented soon.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
