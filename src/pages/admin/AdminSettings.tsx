
import { useState } from "react";
import { useTheme } from "@/contexts/ThemeContext";
import { useData } from "@/contexts/DataContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Moon, Sun, Database, RefreshCw, Save, Trash } from "lucide-react";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function AdminSettings() {
  const { theme, toggleTheme } = useTheme();
  const { syncWithSupabase, clearAllData } = useData();
  const { logout } = useAuth();
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [isEmailNotifications, setIsEmailNotifications] = useState(true);
  const [apiEndpoint, setApiEndpoint] = useState("https://api.asepsasia.com");
  const [isSyncing, setIsSyncing] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [autoSync, setAutoSync] = useState(() => {
    return localStorage.getItem('autoSync') === 'true';
  });
  
  const handleSyncWithSupabase = async () => {
    setIsSyncing(true);
    try {
      await syncWithSupabase();
      toast.success("Successfully synced with Supabase");
    } catch (error) {
      toast.error("Failed to sync with Supabase");
    } finally {
      setIsSyncing(false);
    }
  };
  
  const handleClearAllData = async () => {
    if (confirm("Are you sure you want to clear all data? This action cannot be undone.")) {
      setIsClearing(true);
      try {
        await clearAllData();
        toast.success("All data has been cleared");
      } catch (error) {
        toast.error("Failed to clear data");
      } finally {
        setIsClearing(false);
      }
    }
  };
  
  const handleSaveSettings = () => {
    localStorage.setItem('autoSync', autoSync.toString());
    toast.success("Settings saved successfully");
  };
  
  const toggleAutoSync = (checked: boolean) => {
    setAutoSync(checked);
    localStorage.setItem('autoSync', checked.toString());
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold">Admin Settings</h1>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
            <CardDescription>Customize the look and feel of the application</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="theme">Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Switch between light and dark theme
                </p>
              </div>
              <Button 
                variant="outline" 
                size="icon" 
                onClick={toggleTheme}
              >
                {theme === "dark" ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="advanced">Advanced Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Enable additional features for advanced users
                </p>
              </div>
              <Switch
                id="advanced"
                checked={isAdvancedMode}
                onCheckedChange={setIsAdvancedMode}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configure how you receive notifications</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">Email Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications via email
                </p>
              </div>
              <Switch
                id="email-notifications"
                checked={isEmailNotifications}
                onCheckedChange={setIsEmailNotifications}
              />
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <Label htmlFor="api-endpoint">API Endpoint</Label>
              <Input 
                id="api-endpoint" 
                value={apiEndpoint} 
                onChange={(e) => setApiEndpoint(e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="auto-sync">Auto Sync with Supabase</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically sync data changes with Supabase
                </p>
              </div>
              <Switch
                id="auto-sync"
                checked={autoSync}
                onCheckedChange={toggleAutoSync}
              />
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Data Management</CardTitle>
          <CardDescription>Manage your application data</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Database Sync</h3>
              <p className="text-sm text-muted-foreground">
                Synchronize your local data with the Supabase database
              </p>
              <Button
                variant="outline"
                className="w-full sm:w-auto"
                onClick={handleSyncWithSupabase}
                disabled={isSyncing}
              >
                {isSyncing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
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
            
            <div className="space-y-2">
              <h3 className="text-lg font-medium">Clear Data</h3>
              <p className="text-sm text-muted-foreground">
                Clear all application data. This action cannot be undone.
              </p>
              <Button
                variant="destructive"
                className="w-full sm:w-auto"
                onClick={handleClearAllData}
                disabled={isClearing}
              >
                {isClearing ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Clearing...
                  </>
                ) : (
                  <>
                    <Trash className="mr-2 h-4 w-4" />
                    Clear All Data
                  </>
                )}
              </Button>
            </div>
          </div>
          
          <Separator />
          
          <div className="flex justify-between items-center">
            <Button 
              onClick={handleSaveSettings}
              className="px-8"
            >
              <Save className="mr-2 h-4 w-4" />
              Save Settings
            </Button>
            
            <Button 
              variant="outline" 
              onClick={logout}
            >
              Logout
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
