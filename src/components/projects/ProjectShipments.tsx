
import { useState, useEffect } from "react";
import { useData, Shipment } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format } from "date-fns";
import { Truck, Plane } from "lucide-react";

interface ProjectShipmentsProps {
  projectId: string;
}

export function ProjectShipments({ projectId }: ProjectShipmentsProps) {
  const { shipments, suppliers, purchaseOrders } = useData();
  const [projectShipments, setProjectShipments] = useState<Shipment[]>([]);
  
  useEffect(() => {
    const filteredShipments = shipments.filter(s => s.projectId === projectId);
    setProjectShipments(filteredShipments);
  }, [projectId, shipments]);
  
  // Helper functions
  const getSupplierName = (supplierId: string): string => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : "Unknown Supplier";
  };
  
  const getPoNumber = (poId: string): string => {
    const po = purchaseOrders.find(p => p.id === poId);
    return po ? po.poNumber : "Unknown PO";
  };
  
  const getPartName = (poId: string, partId: string): string => {
    const po = purchaseOrders.find(p => p.id === poId);
    if (!po) return "Unknown Part";
    
    const part = po.parts.find(part => part.id === partId);
    return part ? part.name : "Unknown Part";
  };
  
  if (projectShipments.length === 0) {
    return null;
  }
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-medium flex items-center">
          <Truck className="h-5 w-5 mr-2 text-primary" />
          Project Shipments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Supplier</TableHead>
                <TableHead>PO</TableHead>
                <TableHead>Part</TableHead>
                <TableHead>Ship Date</TableHead>
                <TableHead>ETD</TableHead>
                <TableHead>ETA</TableHead>
                <TableHead>Container Info</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {projectShipments.map((shipment) => (
                <TableRow key={shipment.id}>
                  <TableCell>
                    <div className="flex items-center">
                      {shipment.type === "Air Freight" ? (
                        <Plane className="h-4 w-4 mr-2 text-blue-500" />
                      ) : (
                        <Truck className="h-4 w-4 mr-2 text-green-500" />
                      )}
                      {shipment.type}
                    </div>
                  </TableCell>
                  <TableCell>{getSupplierName(shipment.supplierId)}</TableCell>
                  <TableCell>{getPoNumber(shipment.poId)}</TableCell>
                  <TableCell>{getPartName(shipment.poId, shipment.partId)}</TableCell>
                  <TableCell>{format(new Date(shipment.shippedDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>{format(new Date(shipment.etdDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>{format(new Date(shipment.etaDate), "MMM d, yyyy")}</TableCell>
                  <TableCell>
                    {shipment.type === "Ocean Freight" ? (
                      <span className="text-sm">
                        {shipment.containerSize} {shipment.containerType} - {shipment.containerNumber}
                      </span>
                    ) : (
                      "-"
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
