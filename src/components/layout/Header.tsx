
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

export function Header() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [pageTitle, setPageTitle] = useState("");
  
  useEffect(() => {
    const path = location.pathname;
    
    // Set page title based on current route
    if (path === "/") {
      setPageTitle("Dashboard");
    } else if (path.startsWith("/projects/")) {
      setPageTitle("Project Details");
    } else if (path.startsWith("/suppliers/")) {
      setPageTitle("Supplier Details");
    } else if (path.startsWith("/clients/")) {
      setPageTitle("Client Details");
    } else {
      // Convert "/some-route" to "Some Route"
      const title = path.substring(1).split("-").map(word => 
        word.charAt(0).toUpperCase() + word.slice(1)
      ).join(" ");
      setPageTitle(title);
    }
  }, [location]);

  return (
    <header className={cn(
      "h-[60px] border-b border-border bg-white flex items-center justify-between px-4",
      "sticky top-0 z-10"
    )}>
      <div className="animate-fade-in">
        <h1 className="text-xl font-semibold">{pageTitle}</h1>
      </div>
      
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="sm"
          className="hidden md:flex"
        >
          Help
        </Button>
        
        <div className="relative">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white">
              <span className="text-xs font-medium">UA</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
