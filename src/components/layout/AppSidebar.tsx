
import { useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  ChartBar,
  ExternalLink,
  Calendar,
  Package,
  Settings,
  User,
  Users,
  List,
  File,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { cn } from "@/lib/utils";

const navItems = [
  {
    title: "Dashboard",
    path: "/",
    icon: ChartBar,
  },
  {
    title: "Projects",
    path: "/projects",
    icon: File,
  },
  {
    title: "Clients",
    path: "/clients",
    icon: Users,
  },
  {
    title: "Suppliers",
    path: "/suppliers",
    icon: Package,
  },
  {
    title: "Timeline",
    path: "/timeline",
    icon: Calendar,
  },
  {
    title: "Analytics",
    path: "/analytics",
    icon: ChartBar,
  },
  {
    title: "External Links",
    path: "/external-links",
    icon: ExternalLink,
  },
  {
    title: "Admin",
    path: "/admin",
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(isMobile);

  return (
    <Sidebar
      className={cn(
        "transition-all duration-300 ease-in-out",
        isCollapsed ? "w-[70px]" : "w-[240px]"
      )}
    >
      <SidebarHeader className="h-[60px] flex items-center justify-center">
        {!isCollapsed ? (
          <div className="text-xl font-bold text-white animate-slide-in">ASEPS Asia</div>
        ) : (
          <div className="text-xl font-bold text-white">A</div>
        )}
        <SidebarTrigger
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="absolute right-2 text-white hover:bg-sidebar-accent rounded-full p-1"
        />
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="px-2">
            <SidebarMenu>
              {navItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.path}
                      className={({ isActive }) =>
                        cn(
                          "flex items-center py-2 px-3 rounded-md transition-colors",
                          isActive
                            ? "bg-sidebar-accent text-white"
                            : "text-sidebar-foreground hover:bg-sidebar-accent/50"
                        )
                      }
                    >
                      <item.icon className="h-5 w-5 mr-2" />
                      {!isCollapsed && (
                        <span className="animate-slide-in">{item.title}</span>
                      )}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="pb-4">
        <div className="px-3 mt-2">
          {!isCollapsed && (
            <div className="animate-slide-in text-sidebar-foreground/80 text-xs text-center">
              © 2025 ASEPS Asia
            </div>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
