
import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from "react";
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
  progress?: number;
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
  amount?: number;
  description?: string; // Added description field
}

export interface Shipment {
  id: string;
  projectId: string;
  supplierId: string;
  poId: string;
  partId: string;
  type: "Air Freight" | "Ocean Freight";
  containerNumber?: string;
  containerSize?: string;
  containerType?: string;
  lockNumber?: string;
  shippedDate: string;
  etdDate: string;
  etaDate: string;
  status?: string;
  trackingNumber?: string;
  notes?: string;
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
  shipments: Shipment[];
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

  addShipment: (shipment: Omit<Shipment, "id">) => void;
  updateShipment: (id: string, data: Partial<Omit<Shipment, "id">>) => void;
  deleteShipment: (id: string) => void;
  
  // Utility Functions
  generateDummyData: () => void;
  syncWithSupabase: () => Promise<void>;
  loadFromSupabase: () => Promise<{ success: boolean }>;
  
  // Add clearAllData function
  clearAllData: () => Promise<void>;
}

// Create Context
const DataContext = createContext<DataContextType | null>(null);

// Provider Component
export function DataProvider({ children }: { children: ReactNode }) {
  // Initialize with empty data
  const [data, setData] = useState<DataState>(() => {
    // Try to load from localStorage first
    const savedData = localStorage.getItem('asepsData');
    return savedData ? JSON.parse(savedData) : createDummyData();
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [isSupabaseConnected, setIsSupabaseConnected] = useState(false);

  // Add shipments state
  const [shipments, setShipments] = useState<Shipment[]>([]);
  
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
      externalLinks: prev.externalLinks.filter(el => el.projectId !== id),
      // Also delete related shipments
      shipments: (prev.shipments || []).filter(s => s.projectId !== id)
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
      ),
      // Also delete related shipments
      shipments: (prev.shipments || []).filter(s => s.supplierId !== id)
    }));
  }, []);
  
  // Helper function to update project progress based on purchase orders
  const updateProjectProgress = useCallback((projectId: string) => {
    setData(prev => {
      // Find all POs for this project
      const projectPOs = prev.purchaseOrders.filter(po => po.projectId === projectId);
      
      // If no POs, don't update the progress
      if (projectPOs.length === 0) {
        return prev;
      }
      
      // Calculate average progress from all POs
      const totalProgress = projectPOs.reduce((sum, po) => sum + (po.progress || 0), 0);
      const averageProgress = Math.round(totalProgress / projectPOs.length);
      
      // Update the project progress
      return {
        ...prev,
        projects: prev.projects.map(project => 
          project.id === projectId 
            ? { ...project, progress: averageProgress }
            : project
        )
      };
    });
  }, []);
  
  // CRUD Operations for Purchase Orders
  const addPurchaseOrder = useCallback((purchaseOrder: Omit<PurchaseOrder, "id">) => {
    const newId = uuidv4();
    setData(prev => {
      const newPO = { ...purchaseOrder, id: newId };
      const newData = {
        ...prev, 
        purchaseOrders: [...prev.purchaseOrders, newPO]
      };
      
      // Update project progress
      const projectId = purchaseOrder.projectId;
      const projectPOs = [...prev.purchaseOrders, newPO].filter(po => po.projectId === projectId);
      const totalProgress = projectPOs.reduce((sum, po) => sum + (po.progress || 0), 0);
      const averageProgress = Math.round(totalProgress / projectPOs.length);
      
      newData.projects = prev.projects.map(project => 
        project.id === projectId 
          ? { ...project, progress: averageProgress }
          : project
      );
      
      return newData;
    });
  }, []);
  
  const updatePurchaseOrder = useCallback((id: string, purchaseOrder: Omit<PurchaseOrder, "id">) => {
    setData(prev => {
      const updatedPOs = prev.purchaseOrders.map(po => po.id === id ? { ...purchaseOrder, id } : po);
      const newData = {
        ...prev,
        purchaseOrders: updatedPOs
      };
      
      // Update project progress
      const projectId = purchaseOrder.projectId;
      const projectPOs = updatedPOs.filter(po => po.projectId === projectId);
      
      if (projectPOs.length > 0) {
        const totalProgress = projectPOs.reduce((sum, po) => sum + (po.progress || 0), 0);
        const averageProgress = Math.round(totalProgress / projectPOs.length);
        
        newData.projects = prev.projects.map(project => 
          project.id === projectId 
            ? { ...project, progress: averageProgress }
            : project
        );
      }
      
      return newData;
    });
  }, []);
  
  const deletePurchaseOrder = useCallback((id: string) => {
    setData(prev => {
      const poToDelete = prev.purchaseOrders.find(po => po.id === id);
      const projectId = poToDelete?.projectId;
      
      const filteredPOs = prev.purchaseOrders.filter(po => po.id !== id);
      const newData = {
        ...prev,
        purchaseOrders: filteredPOs,
        // Also update external links
        externalLinks: prev.externalLinks.map(el => 
          el.poId === id ? { ...el, poId: undefined } : el
        ),
        // Also delete related shipments
        shipments: (prev.shipments || []).filter(s => s.poId !== id)
      };
      
      // Update project progress if a project ID was found
      if (projectId) {
        const projectPOs = filteredPOs.filter(po => po.projectId === projectId);
        
        if (projectPOs.length > 0) {
          const totalProgress = projectPOs.reduce((sum, po) => sum + (po.progress || 0), 0);
          const averageProgress = Math.round(totalProgress / projectPOs.length);
          
          newData.projects = prev.projects.map(project => 
            project.id === projectId 
              ? { ...project, progress: averageProgress }
              : project
          );
        }
      }
      
      return newData;
    });
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

  // CRUD Operations for Shipments
  // Handle data loading on mount
  useEffect(() => {
    // If Supabase is connected, try to load data from there first
    if (isSupabaseConnected) {
      loadAllData().then((result) => {
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
            amount: po.amount || 0,
            description: po.description || "", // Add description
            parts: po.parts ? po.parts.map((part: any) => ({
              id: part.id,
              name: part.name,
              quantity: part.quantity,
              status: part.status || "Pending",
              progress: part.progress || 0
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

          const transformedShipments = result.shipments ? result.shipments.map((s: any) => ({
            id: s.id,
            projectId: s.project_id,
            supplierId: s.supplier_id,
            poId: s.po_id,
            partId: s.part_id,
            type: s.type,
            shippedDate: s.shipped_date,
            etdDate: s.etd_date,
            etaDate: s.eta_date,
            containerSize: s.container_size,
            containerType: s.container_type,
            containerNumber: s.container_number,
            lockNumber: s.lock_number
          })) : [];
          
          // Update local state with data from Supabase
          setData({
            projects: transformedProjects,
            clients: transformedClients,
            suppliers: transformedSuppliers,
            purchaseOrders: transformedPurchaseOrders,
            externalLinks: transformedExternalLinks,
            shipments: transformedShipments || []
          });
          
          // Set shipments
          setShipments(result.shipments || []);
        }
      });
    } else {
      // Initialize empty shipments array
      setShipments([]);
    }
  }, [isSupabaseConnected]);
  
  const addShipment = useCallback((shipmentData: Omit<Shipment, "id">) => {
    const id = uuidv4();
    const newShipment = { ...shipmentData, id };
    
    setShipments(prev => [...prev, newShipment]);
    
    if (isSupabaseConnected) {
      syncAllData(data.projects, data.clients, data.suppliers, data.purchaseOrders, data.externalLinks, [...shipments, newShipment])
        .then(result => {
          if (!result.success) {
            console.error("Failed to sync shipment data:", result.error);
          }
        });
    }
  }, [shipments, data, isSupabaseConnected]);
  
  const updateShipment = useCallback((id: string, shipmentData: Partial<Omit<Shipment, "id">>) => {
    setShipments(prev => prev.map(shipment => 
      shipment.id === id ? { ...shipment, ...shipmentData } : shipment
    ));
    
    if (isSupabaseConnected) {
      const updatedShipments = shipments.map(shipment => 
        shipment.id === id ? { ...shipment, ...shipmentData } : shipment
      );
      
      syncAllData(data.projects, data.clients, data.suppliers, data.purchaseOrders, data.externalLinks, updatedShipments)
        .then(result => {
          if (!result.success) {
            console.error("Failed to sync updated shipment data:", result.error);
          }
        });
    }
  }, [shipments, data, isSupabaseConnected]);
  
  const deleteShipment = useCallback((id: string) => {
    setShipments(prev => prev.filter(shipment => shipment.id !== id));
    
    if (isSupabaseConnected) {
      const remainingShipments = shipments.filter(shipment => shipment.id !== id);
      
      syncAllData(data.projects, data.clients, data.suppliers, data.purchaseOrders, data.externalLinks, remainingShipments)
        .then(result => {
          if (!result.success) {
            console.error("Failed to sync after shipment deletion:", result.error);
          }
        });
    }
  }, [shipments, data, isSupabaseConnected]);
  
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
        progress: po.progress || 0,
        amount: po.amount || 0,
        description: po.description || "" // Add description field
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

      const shipmentsToSync = (data.shipments || []).map(s => ({
        id: s.id,
        project_id: s.projectId,
        supplier_id: s.supplierId,
        po_id: s.poId,
        part_id: s.partId,
        type: s.type,
        shipped_date: s.shippedDate,
        etd_date: s.etdDate,
        eta_date: s.etaDate,
        container_size: s.containerSize,
        container_type: s.containerType,
        container_number: s.containerNumber,
        lock_number: s.lockNumber
      }));
      
      await syncAllData(
        projectsToSync,
        clientsToSync,
        suppliersToSync,
        purchaseOrdersToSync,
        externalLinksToSync,
        shipmentsToSync
      );
      
      setIsSupabaseConnected(true);
      
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
          amount: po.amount || 0,
          description: po.description || "", // Add description field
          parts: po.parts ? po.parts.map((part: any) => ({
            id: part.id,
            name: part.name,
            quantity: part.quantity,
            status: part.status || "Pending",
            progress: part.progress || 0
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

        const transformedShipments = result.shipments ? result.shipments.map((s: any) => ({
          id: s.id,
          projectId: s.project_id,
          supplierId: s.supplier_id,
          poId: s.po_id,
          partId: s.part_id,
          type: s.type,
          shippedDate: s.shipped_date,
          etdDate: s.etd_date,
          etaDate: s.eta_date,
          containerSize: s.container_size,
          containerType: s.container_type,
          containerNumber: s.container_number,
          lockNumber: s.lock_number
        })) : [];
        
        // Update local state with data from Supabase
        setData({
          projects: transformedProjects,
          clients: transformedClients,
          suppliers: transformedSuppliers,
          purchaseOrders: transformedPurchaseOrders,
          externalLinks: transformedExternalLinks,
          shipments: transformedShipments || []
        });
        
        setIsSupabaseConnected(true);
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
  
  // Add clearAllData implementation
  const clearAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      const emptyData = {
        projects: [],
        clients: [],
        suppliers: [],
        purchaseOrders: [],
        externalLinks: [],
        shipments: []
      };
      setData(emptyData);
      localStorage.removeItem('asepsData');
      return Promise.resolve();
    } catch (error) {
      console.error("Error clearing data:", error);
      return Promise.reject(error);
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
    shipments,
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
    
    addShipment,
    updateShipment,
    deleteShipment,
    
    // Utility Functions
    generateDummyData,
    syncWithSupabase,
    loadFromSupabase,
    clearAllData
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
  if (context === null) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
