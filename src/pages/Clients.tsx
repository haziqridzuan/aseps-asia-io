
import { useState } from "react";
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
import { Users, Search } from "lucide-react";

export default function Clients() {
  const { clients, projects } = useData();
  const [search, setSearch] = useState("");
  
  // Filter clients based on search
  const filteredClients = clients.filter(client =>
    search === "" ||
    client.name.toLowerCase().includes(search.toLowerCase()) ||
    client.location.toLowerCase().includes(search.toLowerCase()) ||
    client.contactPerson.toLowerCase().includes(search.toLowerCase())
  );
  
  // Get project count for a client
  const getClientProjectCount = (clientId: string): number => {
    return projects.filter(p => p.clientId === clientId).length;
  };
  
  // Get active project count for a client
  const getActiveProjectCount = (clientId: string): number => {
    return projects.filter(p => p.clientId === clientId && p.status === "In Progress").length;
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold flex items-center">
          <Users className="h-6 w-6 mr-2" />
          Clients
        </h1>
        
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search clients..."
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
                <TableHead>Client Name</TableHead>
                <TableHead>Contact Person</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Location</TableHead>
                <TableHead>Projects</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClients.length > 0 ? (
                filteredClients.map((client, index) => (
                  <TableRow key={client.id} className="hover:bg-secondary/50 transition-colors animate-fade-in" style={{ animationDelay: `${index * 50}ms` }}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>{client.contactPerson}</TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell>{client.phone}</TableCell>
                    <TableCell>{client.location}</TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span>{getClientProjectCount(client.id)} total</span>
                        <span className="text-xs text-muted-foreground">
                          {getActiveProjectCount(client.id)} active
                        </span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={6} className="h-24 text-center">
                    No clients found.
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
