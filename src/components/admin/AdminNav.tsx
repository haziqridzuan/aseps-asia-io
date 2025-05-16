
import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { ChartBar, File, Users, Package, Calendar, Database, Settings, Ship } from "lucide-react";

const navItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: ChartBar,
  },
  {
    title: "Projects",
    href: "/admin/projects",
    icon: File,
  },
  {
    title: "Clients",
    href: "/admin/clients",
    icon: Users,
  },
  {
    title: "Suppliers",
    href: "/admin/suppliers",
    icon: Package,
  },
  {
    title: "Purchase Orders",
    href: "/admin/purchase-orders",
    icon: Calendar,
  },
  {
    title: "Shipments",
    href: "/admin/shipments",
    icon: Ship,
  },
  {
    title: "External Links",
    href: "/admin/external-links",
    icon: Database,
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

export function AdminNav() {
  const { logout } = useAuth();
  
  return (
    <nav className="space-y-4">
      <div className="px-4 py-2">
        <h2 className="mb-2 px-2 text-lg font-semibold">Admin Panel</h2>
        <div className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              className={({ isActive }) =>
                cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-all hover:bg-accent",
                  isActive ? "bg-accent text-accent-foreground" : "transparent"
                )
              }
            >
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </NavLink>
          ))}
        </div>
      </div>
      <div className="px-6">
        <Button variant="outline" className="w-full justify-start" onClick={logout}>
          <span>Logout</span>
        </Button>
      </div>
    </nav>
  );
}
