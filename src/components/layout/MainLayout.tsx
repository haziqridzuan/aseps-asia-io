
import { Outlet } from "react-router-dom";
import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "./AppSidebar";
import { Header } from "./Header";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function MainLayout() {
  const { toast } = useToast();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Simulate data loading
    setTimeout(() => {
      setIsLoaded(true);
      toast({
        title: "Welcome to ASEPS Asia",
        description: "Your manufacturing progress tracker",
      });
    }, 500);
  }, [toast]);

  return (
    <>
      <SidebarProvider>
        <div className="min-h-screen flex w-full">
          <AppSidebar />
          <div className="flex-1 flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 p-4 md:p-6 transition-all">
              {isLoaded ? (
                <div className="animate-fade-in">
                  <Outlet />
                </div>
              ) : (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-pulse text-primary">Loading...</div>
                </div>
              )}
            </main>
          </div>
        </div>
      </SidebarProvider>
      <Toaster />
      <Sonner />
    </>
  );
}
