
import React, { createContext, useContext, useState, ReactNode, useCallback } from "react";
import { v4 as uuidv4 } from 'uuid';
import { createDummyData, DataState } from '@/data/dummy-data';
import { syncAllData, loadAllData } from '@/integrations/supabase/dataSync';
import { toast } from "sonner";

// Define Types
export interface Project {
  id: string;
  name: string;
  clientId: string;
  location: string;
  status: "In Progress" | "Completed" | "Pending" | "Delayed";
  progress: number;
  startDate: string;
  endDate: string;
  projectManager?: string;
  description?: string;
}

export interface Client {
  id: string;
  name: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  location?: string;
}

export interface Supplier {
  id: string;
  name: string;
  country?: string;
  contactPerson?: string;
  email?: string;
  phone?: string;
  rating?: number;
  onTimeDelivery?: number;
  location?: string;
  positiveComments?: string[];
  negativeComments?: string[];
}

export interface Part {
  id: string;
  name: string;
  quantity: number;
  status: "In Progress" | "Completed" | "Pending" | "Delayed";
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  projectId: string;
  supplierId: string;
  status: "Active" | "Completed" | "Delayed";
  deadline: string;
  issuedDate: string;
  parts: Part[];
  progress?: number;
}

export interface ExternalLink {
  id: string;
  type: "Report" | "Photo" | "Tracking";
  projectId: string;
  supplierId?: string;
  poId?: string;
  title: string;
  url: string;
  date: string;
}

// Define Context Type
interface DataContextType {
  projects: Project[];
  clients: Client[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  externalLinks: ExternalLink[];
  isLoading: boolean;
  
  // CRUD Operations
  addProject: (project: Omit<Project, "id">) => void;
  updateProject: (id: string, project: Omit<Project, "id">) => void;
  deleteProject: (id: string) => void;
  
  addClient: (client: Omit<Client, "id">) => void;
  updateClient: (id: string, client: Omit<Client, "id">) => void;
  deleteClient: (id: string) => void;
  
  addSupplier: (supplier: Omit<Supplier, "id">) => void;
  updateSupplier: (id: string, supplier: Omit<Supplier, "id">) => void;
  deleteSupplier: (id: string) => void;
  
  addPurchaseOrder: (purchaseOrder: Omit<PurchaseOrder, "id">) => void;
  updatePurchaseOrder: (id: string, purchaseOrder: Omit<PurchaseOrder, "id">) => void;
  deletePurchaseOrder: (id: string) => void;
  
  addExternalLink: (externalLink: Omit<ExternalLink, "id">) => void;
  updateExternalLink: (id: string, externalLink: Omit<ExternalLink, "id">) => void;
  deleteExternalLink: (id: string) => void;
  
  // Utility Functions
  generateDummyData: () => void;
  syncWithSupabase: () => Promise<void>;
  loadFromSupabase: () => Promise<{ success: boolean }>;
}

// Create Context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider Component
export function DataProvider({ children }: { children: ReactNode }) {
  // Initialize with empty data
  const [data, setData] = useState<DataState>(() => {
    // Try to load from localStorage first
    const savedData = localStorage.getItem('asepsData');
    return savedData ? JSON.parse(savedData) : createDummyData();
  });
  
  const [isLoading, setIsLoading] = useState(false);
  
  // Save data to localStorage whenever it changes
  React.useEffect(() => {
    localStorage.setItem('asepsData', JSON.stringify(data));
  }, [data]);
  
  // CRUD Operations for Projects
  const addProject = useCallback((project: Omit<Project, "id">) => {
    setData(prev => {
      const newProject = { ...project, id: uuidv4() };
      return { ...prev, projects: [...prev.projects, newProject] };
    });
  }, []);
  
  const updateProject = useCallback((id: string, project: Omit<Project, "id">) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.map(p => p.id === id ? { ...project, id } : p)
    }));
  }, []);
  
  const deleteProject = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      projects: prev.projects.filter(p => p.id !== id),
      // Also delete related purchase orders
      purchaseOrders: prev.purchaseOrders.filter(po => po.projectId !== id),
      // Also delete related external links
      externalLinks: prev.externalLinks.filter(el => el.projectId !== id)
    }));
  }, []);
  
  // CRUD Operations for Clients
  const addClient = useCallback((client: Omit<Client, "id">) => {
    setData(prev => ({
      ...prev,
      clients: [...prev.clients, { ...client, id: uuidv4() }]
    }));
  }, []);
  
  const updateClient = useCallback((id: string, client: Omit<Client, "id">) => {
    setData(prev => ({
      ...prev,
      clients: prev.clients.map(c => c.id === id ? { ...client, id } : c)
    }));
  }, []);
  
  const deleteClient = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      clients: prev.clients.filter(c => c.id !== id),
      // Update projects with this client to have null clientId
      projects: prev.projects.map(p => 
        p.clientId === id ? { ...p, clientId: "" } : p
      )
    }));
  }, []);
  
  // CRUD Operations for Suppliers
  const addSupplier = useCallback((supplier: Omit<Supplier, "id">) => {
    setData(prev => ({
      ...prev,
      suppliers: [...prev.suppliers, { ...supplier, id: uuidv4() }]
    }));
  }, []);
  
  const updateSupplier = useCallback((id: string, supplier: Omit<Supplier, "id">) => {
    setData(prev => ({
      ...prev,
      suppliers: prev.suppliers.map(s => s.id === id ? { ...supplier, id } : s)
    }));
  }, []);
  
  const deleteSupplier = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      suppliers: prev.suppliers.filter(s => s.id !== id),
      // Also delete related purchase orders
      purchaseOrders: prev.purchaseOrders.filter(po => po.supplierId !== id),
      // Remove supplier from external links
      externalLinks: prev.externalLinks.map(el => 
        el.supplierId === id ? { ...el, supplierId: undefined } : el
      )
    }));
  }, []);
  
  // CRUD Operations for Purchase Orders
  const addPurchaseOrder = useCallback((purchaseOrder: Omit<PurchaseOrder, "id">) => {
    setData(prev => ({
      ...prev,
      purchaseOrders: [...prev.purchaseOrders, { ...purchaseOrder, id: uuidv4() }]
    }));
  }, []);
  
  const updatePurchaseOrder = useCallback((id: string, purchaseOrder: Omit<PurchaseOrder, "id">) => {
    setData(prev => ({
      ...prev,
      purchaseOrders: prev.purchaseOrders.map(po => po.id === id ? { ...purchaseOrder, id } : po)
    }));
  }, []);
  
  const deletePurchaseOrder = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      purchaseOrders: prev.purchaseOrders.filter(po => po.id !== id),
      // Also update external links
      externalLinks: prev.externalLinks.map(el => 
        el.poId === id ? { ...el, poId: undefined } : el
      )
    }));
  }, []);
  
  // CRUD Operations for External Links
  const addExternalLink = useCallback((externalLink: Omit<ExternalLink, "id">) => {
    setData(prev => ({
      ...prev,
      externalLinks: [...prev.externalLinks, { ...externalLink, id: uuidv4() }]
    }));
  }, []);
  
  const updateExternalLink = useCallback((id: string, externalLink: Omit<ExternalLink, "id">) => {
    setData(prev => ({
      ...prev,
      externalLinks: prev.externalLinks.map(el => el.id === id ? { ...externalLink, id } : el)
    }));
  }, []);
  
  const deleteExternalLink = useCallback((id: string) => {
    setData(prev => ({
      ...prev,
      externalLinks: prev.externalLinks.filter(el => el.id !== id)
    }));
  }, []);
  
  // Generate Dummy Data
  const generateDummyData = useCallback(() => {
    const dummyData = createDummyData();
    setData(dummyData);
  }, []);
  
  // Sync with Supabase
  const syncWithSupabase = useCallback(async () => {
    setIsLoading(true);
    try {
      // Transform data to match Supabase schema
      const projectsToSync = data.projects.map(p => ({
        id: p.id,
        name: p.name,
        client_id: p.clientId,
        location: p.location,
        status: p.status,
        progress: p.progress,
        start_date: p.startDate,
        end_date: p.endDate,
        project_manager: p.projectManager,
        description: p.description
      }));
      
      const clientsToSync = data.clients.map(c => ({
        id: c.id,
        name: c.name,
        contact_person: c.contactPerson,
        email: c.email,
        phone: c.phone,
        location: c.location
      }));
      
      const suppliersToSync = data.suppliers.map(s => ({
        id: s.id,
        name: s.name,
        country: s.country,
        contact_person: s.contactPerson,
        email: s.email,
        phone: s.phone,
        rating: s.rating,
        on_time_delivery: s.onTimeDelivery,
        location: s.location,
        positive_comments: s.positiveComments || [],
        negative_comments: s.negativeComments || []
      }));
      
      const purchaseOrdersToSync = data.purchaseOrders.map(po => ({
        id: po.id,
        po_number: po.poNumber,
        project_id: po.projectId,
        supplier_id: po.supplierId,
        status: po.status,
        deadline: po.deadline,
        issued_date: po.issuedDate,
        progress: po.progress || 0
      }));
      
      const externalLinksToSync = data.externalLinks.map(el => ({
        id: el.id,
        type: el.type,
        project_id: el.projectId,
        supplier_id: el.supplierId,
        po_id: el.poId,
        title: el.title,
        url: el.url,
        date: el.date
      }));
      
      await syncAllData(
        projectsToSync,
        clientsToSync,
        suppliersToSync,
        purchaseOrdersToSync,
        externalLinksToSync
      );
      
    } catch (error) {
      console.error("Error syncing with Supabase:", error);
      toast.error("Failed to sync with Supabase");
    } finally {
      setIsLoading(false);
    }
  }, [data]);
  
  // Load data from Supabase
  const loadFromSupabase = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await loadAllData();
      
      if (result.success) {
        // Transform data to match our app's schema
        const transformedProjects = result.projects.map((p: any) => ({
          id: p.id,
          name: p.name,
          clientId: p.client_id || "",
          location: p.location || "",
          status: p.status || "Pending",
          progress: p.progress || 0,
          startDate: p.start_date,
          endDate: p.end_date,
          projectManager: p.project_manager,
          description: p.description
        }));
        
        const transformedClients = result.clients.map((c: any) => ({
          id: c.id,
          name: c.name,
          contactPerson: c.contact_person,
          email: c.email,
          phone: c.phone,
          location: c.location
        }));
        
        const transformedSuppliers = result.suppliers.map((s: any) => ({
          id: s.id,
          name: s.name,
          country: s.country,
          contactPerson: s.contact_person,
          email: s.email,
          phone: s.phone,
          rating: s.rating,
          onTimeDelivery: s.on_time_delivery,
          location: s.location,
          positiveComments: s.positive_comments || [],
          negativeComments: s.negative_comments || []
        }));
        
        const transformedPurchaseOrders = result.purchaseOrders.map((po: any) => ({
          id: po.id,
          poNumber: po.po_number,
          projectId: po.project_id,
          supplierId: po.supplier_id,
          status: po.status,
          deadline: po.deadline,
          issuedDate: po.issued_date,
          progress: po.progress || 0,
          parts: po.parts ? po.parts.map((part: any) => ({
            id: part.id,
            name: part.name,
            quantity: part.quantity,
            status: part.status || "Pending"
          })) : []
        }));
        
        const transformedExternalLinks = result.externalLinks.map((el: any) => ({
          id: el.id,
          type: el.type,
          projectId: el.project_id,
          supplierId: el.supplier_id,
          poId: el.po_id,
          title: el.title,
          url: el.url,
          date: el.date
        }));
        
        // Update local state with data from Supabase
        setData({
          projects: transformedProjects,
          clients: transformedClients,
          suppliers: transformedSuppliers,
          purchaseOrders: transformedPurchaseOrders,
          externalLinks: transformedExternalLinks
        });
        
        return { success: true };
      }
      
      return { success: false };
    } catch (error) {
      console.error("Error loading from Supabase:", error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const value = {
    // Data State
    projects: data.projects,
    clients: data.clients,
    suppliers: data.suppliers,
    purchaseOrders: data.purchaseOrders,
    externalLinks: data.externalLinks,
    isLoading,
    
    // CRUD Operations
    addProject,
    updateProject,
    deleteProject,
    
    addClient,
    updateClient,
    deleteClient,
    
    addSupplier,
    updateSupplier,
    deleteSupplier,
    
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    
    addExternalLink,
    updateExternalLink,
    deleteExternalLink,
    
    // Utility Functions
    generateDummyData,
    syncWithSupabase,
    loadFromSupabase
  };
  
  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
}

// Custom Hook to use the context
export const useData = (): DataContextType => {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
