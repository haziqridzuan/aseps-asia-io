
import { useEffect } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { AdminNav } from "@/components/admin/AdminNav";

export default function AdminLayout() {
  const { user, isAdmin, isLoading } = useAuth();
  const navigate = useNavigate();
  
  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !user) {
      navigate("/admin/login");
    } else if (!isLoading && user && !isAdmin) {
      navigate("/");
    }
  }, [user, isAdmin, isLoading, navigate]);
  
  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-pulse text-primary">Loading...</div>
      </div>
    );
  }
  
  // Only render if authenticated and admin
  if (!user || !isAdmin) {
    return null;
  }
  
  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <div className="hidden md:block w-64 border-r bg-background">
        <AdminNav />
      </div>
      
      {/* Main Content */}
      <div className="flex-1">
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
