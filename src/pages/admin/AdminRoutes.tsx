
import { Routes, Route } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import AdminDashboard from "./AdminDashboard";
import AdminProjects from "./AdminProjects";
import AdminClients from "./AdminClients";
import AdminSuppliers from "./AdminSuppliers";
import AdminPurchaseOrders from "./AdminPurchaseOrders";
import AdminExternalLinks from "./AdminExternalLinks";
import AdminSettings from "./AdminSettings";
import AdminLogin from "./AdminLogin";
import AdminShipments from "./AdminShipments";

export default function AdminRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<AdminLogin />} />
      <Route element={<AdminLayout />}>
        <Route index element={<AdminDashboard />} />
        <Route path="/dashboard" element={<AdminDashboard />} />
        <Route path="/projects" element={<AdminProjects />} />
        <Route path="/clients" element={<AdminClients />} />
        <Route path="/suppliers" element={<AdminSuppliers />} />
        <Route path="/purchase-orders" element={<AdminPurchaseOrders />} />
        <Route path="/shipments" element={<AdminShipments />} />
        <Route path="/external-links" element={<AdminExternalLinks />} />
        <Route path="/settings" element={<AdminSettings />} />
      </Route>
    </Routes>
  );
}
