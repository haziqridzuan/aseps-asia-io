
import { useState, useEffect } from "react";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/dashboard/StatCard";
import { Loader2, Database, File as FileIcon, Users as UsersIcon, Package as PackageIcon } from "lucide-react";
import { toast } from "sonner";
import { checkSupabaseConnection } from "@/integrations/supabase/client";

export default function AdminDashboard() {
  const { 
    projects, 
    clients, 
    suppliers, 
    purchaseOrders, 
    externalLinks, 
    generateDummyData, 
    syncWithSupabase, 
    loadFromSupabase,
    isLoading: dataLoading 
  } = useData();
  
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  
  // Check Supabase connection on mount
  useEffect(() => {
    const checkConnection = async () => {
      const connected = await checkSupabaseConnection();
      setIsConnected(connected);
    };
    
    checkConnection();
  }, []);
  
  const handleSyncWithSupabase = async () => {
    setIsSyncing(true);
    
    try {
      toast.info("Syncing data with Supabase...");
      await syncWithSupabase();
      toast.success("Data synchronized successfully!");
    } catch (error) {
      console.error("Error syncing with Supabase:", error);
      toast.error("Failed to sync with Supabase");
    } finally {
      setIsSyncing(false);
    }
  };
  
  const handleLoadFromSupabase = async () => {
    setIsLoadingData(true);
    
    try {
      toast.info("Loading data from Supabase...");
      const result = await loadFromSupabase();
      if (result.success) {
        toast.success("Data loaded successfully from Supabase!");
      } else {
        toast.error("Failed to load data from Supabase");
      }
    } catch (error) {
      console.error("Error loading from Supabase:", error);
      toast.error("Failed to load data from Supabase");
    } finally {
      setIsLoadingData(false);
    }
  };
  
  const handleGenerateDummyData = () => {
    generateDummyData();
    toast.success("Demo data generated successfully!");
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline"
            disabled={isLoadingData || isSyncing || dataLoading}
            onClick={handleGenerateDummyData}
          >
            Generate Demo Data
          </Button>
          
          <Button 
            variant="outline"
            disabled={isLoadingData || isSyncing || dataLoading || !isConnected}
            onClick={handleLoadFromSupabase}
          >
            {isLoadingData ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Loading...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Load from Supabase
              </>
            )}
          </Button>
          
          <Button 
            disabled={isSyncing || dataLoading || !isConnected} 
            onClick={handleSyncWithSupabase}
          >
            {isSyncing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Sync with Supabase
              </>
            )}
          </Button>
        </div>
      </div>
      
      {!isConnected && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <p className="text-amber-800">
              Supabase connection issue. Please check your connection settings or try again later.
            </p>
          </CardContent>
        </Card>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Projects"
          value={projects.length}
          className="bg-blue-50"
        />
        <StatCard
          title="Clients"
          value={clients.length}
          className="bg-green-50"
        />
        <StatCard
          title="Suppliers"
          value={suppliers.length}
          className="bg-amber-50"
        />
        <StatCard
          title="Purchase Orders"
          value={purchaseOrders.length}
          className="bg-purple-50"
        />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Project Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Total Projects</dt>
                <dd className="font-bold">{projects.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">In Progress</dt>
                <dd className="font-bold">{projects.filter(p => p.status === "In Progress").length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Completed</dt>
                <dd className="font-bold">{projects.filter(p => p.status === "Completed").length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Delayed</dt>
                <dd className="font-bold">{projects.filter(p => p.status === "Delayed").length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Pending</dt>
                <dd className="font-bold">{projects.filter(p => p.status === "Pending").length}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">PO Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Total POs</dt>
                <dd className="font-bold">{purchaseOrders.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Active POs</dt>
                <dd className="font-bold">{purchaseOrders.filter(po => po.status === "Active").length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Completed POs</dt>
                <dd className="font-bold">{purchaseOrders.filter(po => po.status === "Completed").length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Delayed POs</dt>
                <dd className="font-bold">{purchaseOrders.filter(po => po.status === "Delayed").length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Total Parts</dt>
                <dd className="font-bold">{
                  purchaseOrders.reduce((total, po) => total + po.parts.length, 0)
                }</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
        
        <Card className="card-hover">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">External Data</CardTitle>
          </CardHeader>
          <CardContent>
            <dl className="space-y-4">
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">External Links</dt>
                <dd className="font-bold">{externalLinks.length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Reports</dt>
                <dd className="font-bold">{externalLinks.filter(link => link.type === "Report").length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Photos</dt>
                <dd className="font-bold">{externalLinks.filter(link => link.type === "Photo").length}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="font-medium text-muted-foreground">Tracking</dt>
                <dd className="font-bold">{externalLinks.filter(link => link.type === "Tracking").length}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>
      </div>
      
      <Card className="card-hover">
        <CardHeader>
          <CardTitle>Admin Controls</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Use the Admin Panel to manage all data in the ASEPS Asia system. You can add, edit, and delete projects, clients, suppliers, purchase orders, and external links.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => window.location.href = "/admin/projects"}
            >
              <FileIcon className="mr-2 h-4 w-4" />
              Manage Projects
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => window.location.href = "/admin/clients"}
            >
              <UsersIcon className="mr-2 h-4 w-4" />
              Manage Clients
            </Button>
            
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={() => window.location.href = "/admin/suppliers"}
            >
              <PackageIcon className="mr-2 h-4 w-4" />
              Manage Suppliers
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
