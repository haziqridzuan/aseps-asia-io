
import { useState } from "react";
import { Link } from "react-router-dom";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Package, Search, Star } from "lucide-react";

export default function Suppliers() {
  const { suppliers, purchaseOrders, projects } = useData();
  const [search, setSearch] = useState("");
  
  // Filter suppliers based on search
  const filteredSuppliers = suppliers.filter(supplier =>
    search === "" ||
    supplier.name.toLowerCase().includes(search.toLowerCase()) ||
    supplier.country.toLowerCase().includes(search.toLowerCase()) ||
    supplier.contactPerson.toLowerCase().includes(search.toLowerCase())
  );
  
  // Get active project count for a supplier
  const getActiveProjectCount = (supplierId: string): number => {
    const projectIds = [...new Set(
      purchaseOrders
        .filter(po => po.supplierId === supplierId && po.status !== "Completed")
        .map(po => po.projectId)
    )];
    
    return projectIds.length;
  };
  
  // Render stars for rating
  const renderRating = (rating: number) => {
    const stars = [];
    
    for (let i = 0; i < 5; i++) {
      stars.push(
        <Star
          key={i}
          className={`h-4 w-4 ${i < rating ? "text-amber-500 fill-amber-500" : "text-gray-300"}`}
        />
      );
    }
    
    return <div className="flex">{stars}</div>;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center">
          <Package className="h-6 w-6 mr-2" />
          Suppliers
        </h1>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search suppliers..."
            className="pl-8 w-[300px]"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Supplier Name</TableHead>
                <TableHead>Country</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>On-Time Delivery</TableHead>
                <TableHead>Active Projects</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.length > 0 ? (
                filteredSuppliers.map((supplier, index) => (
                  <TableRow key={supplier.id} className="hover:bg-secondary/50 transition-colors animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <TableCell>
                      <Link to={`/suppliers/${supplier.id}`} className="font-medium hover:text-primary transition-colors">
                        {supplier.name}
                      </Link>
                    </TableCell>
                    <TableCell>{supplier.country}</TableCell>
                    <TableCell>{supplier.contactPerson}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        {renderRating(supplier.rating)}
                        <span className="text-sm">{supplier.rating.toFixed(1)}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-[100px] bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className="bg-primary h-2 rounded-full" 
                            style={{ width: `${supplier.onTimeDelivery}%` }}
                          ></div>
                        </div>
                        <span className="text-sm">{supplier.onTimeDelivery}%</span>
                      </div>
                    </TableCell>
                    <TableCell>{getActiveProjectCount(supplier.id)}</TableCell>
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
