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
  description?: string;
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
  
  // Add clearAllData function
  clearAllData: () => Promise<void>;
}

// Create Context
const DataContext = createContext<DataContextType | undefined>(undefined);

// Provider Component
export function DataProvider({ children }: { children: ReactNode }) {
  // Initialize with empty data
  const [data, setData] = useState<DataState>(() => {
    // Initialize with empty data structure first
    return {
      projects: [],
      clients: [],
      suppliers: [],
      purchaseOrders: [],
      externalLinks: []
    };
  });
  
  const [isLoading, setIsLoading] = useState(true);

  // Load data from Supabase on component mount
  useEffect(() => {
    const loadInitialData = async () => {
      setIsLoading(true);
      try {
        const result = await loadFromSupabase();
        if (!result.success) {
          // If loading from Supabase fails, try local storage
          const savedData = localStorage.getItem('asepsData');
          if (savedData) {
            setData(JSON.parse(savedData));
            toast("Using locally saved data");
          } else {
            // As a last resort, use dummy data
            setData(createDummyData());
            toast("Using demo data - connect to Supabase for real data");
          }
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
        toast.error("Error loading data");
      } finally {
        setIsLoading(false);
      }
    };

    loadInitialData();
  }, []);
  
  // Save data to localStorage whenever it changes
  useEffect(() => {
    if (!isLoading) {
      localStorage.setItem('asepsData', JSON.stringify(data));
    }
  }, [data, isLoading]);
  
  // CRUD Operations for Projects
  const addProject = useCallback(async (project: Omit<Project, "id">) => {
    setIsLoading(true);
    try {
      const newProject = { ...project, id: uuidv4() };
      
      // Add to Supabase first
      const { data: supabaseData, error } = await supabase
        .from('projects')
        .insert([{
          id: newProject.id,
          name: newProject.name,
          client_id: newProject.clientId,
          location: newProject.location,
          status: newProject.status,
          progress: newProject.progress,
          start_date: newProject.startDate,
          end_date: newProject.endDate,
          project_manager: newProject.projectManager,
          description: newProject.description
        }])
        .select();
      
      if (error) throw error;
      
      // Update local state
      setData(prev => ({
        ...prev,
        projects: [...prev.projects, newProject]
      }));
      
      return supabaseData ? supabaseData[0] : newProject;
    } catch (error) {
      console.error("Error adding project:", error);
      toast.error("Failed to add project to database");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const updateProject = useCallback(async (id: string, project: Omit<Project, "id">) => {
    setIsLoading(true);
    try {
      // Update in Supabase first
      const { error } = await supabase
        .from('projects')
        .update({
          name: project.name,
          client_id: project.clientId,
          location: project.location,
          status: project.status,
          progress: project.progress,
          start_date: project.startDate,
          end_date: project.endDate,
          project_manager: project.projectManager,
          description: project.description
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setData(prev => ({
        ...prev,
        projects: prev.projects.map(p => p.id === id ? { ...project, id } : p)
      }));
    } catch (error) {
      console.error("Error updating project:", error);
      toast.error("Failed to update project in database");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const deleteProject = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      // Delete from Supabase first
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setData(prev => ({
        ...prev,
        projects: prev.projects.filter(p => p.id !== id),
        // Also delete related purchase orders
        purchaseOrders: prev.purchaseOrders.filter(po => po.projectId !== id),
        // Also delete related external links
        externalLinks: prev.externalLinks.filter(el => el.projectId !== id)
      }));
    } catch (error) {
      console.error("Error deleting project:", error);
      toast.error("Failed to delete project from database");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // CRUD Operations for Clients
  const addClient = useCallback(async (client: Omit<Client, "id">) => {
    setIsLoading(true);
    try {
      const newClient = { ...client, id: uuidv4() };
      
      // Add to Supabase first
      const { data: supabaseData, error } = await supabase
        .from('clients')
        .insert([{
          id: newClient.id,
          name: newClient.name,
          contact_person: newClient.contactPerson,
          email: newClient.email,
          phone: newClient.phone,
          location: newClient.location
        }])
        .select();
      
      if (error) throw error;
      
      // Update local state
      setData(prev => ({
        ...prev,
        clients: [...prev.clients, newClient]
      }));
      
      return supabaseData ? supabaseData[0] : newClient;
    } catch (error) {
      console.error("Error adding client:", error);
      toast.error("Failed to add client to database");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const updateClient = useCallback(async (id: string, client: Omit<Client, "id">) => {
    setIsLoading(true);
    try {
      // Update in Supabase first
      const { error } = await supabase
        .from('clients')
        .update({
          name: client.name,
          contact_person: client.contactPerson,
          email: client.email,
          phone: client.phone,
          location: client.location
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setData(prev => ({
        ...prev,
        clients: prev.clients.map(c => c.id === id ? { ...client, id } : c)
      }));
    } catch (error) {
      console.error("Error updating client:", error);
      toast.error("Failed to update client in database");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const deleteClient = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      // Delete from Supabase first
      const { error } = await supabase
        .from('clients')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setData(prev => ({
        ...prev,
        clients: prev.clients.filter(c => c.id !== id),
        // Update projects with this client to have null clientId
        projects: prev.projects.map(p => 
          p.clientId === id ? { ...p, clientId: "" } : p
        )
      }));
    } catch (error) {
      console.error("Error deleting client:", error);
      toast.error("Failed to delete client from database");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // CRUD Operations for Suppliers
  const addSupplier = useCallback(async (supplier: Omit<Supplier, "id">) => {
    setIsLoading(true);
    try {
      const newSupplier = { ...supplier, id: uuidv4() };
      
      // Add to Supabase first
      const { data: supabaseData, error } = await supabase
        .from('suppliers')
        .insert([{
          id: newSupplier.id,
          name: newSupplier.name,
          country: newSupplier.country,
          contact_person: newSupplier.contactPerson,
          email: newSupplier.email,
          phone: newSupplier.phone,
          rating: newSupplier.rating,
          on_time_delivery: newSupplier.onTimeDelivery,
          location: newSupplier.location,
          positive_comments: newSupplier.positiveComments || [],
          negative_comments: newSupplier.negativeComments || []
        }])
        .select();
      
      if (error) throw error;
      
      // Update local state
      setData(prev => ({
        ...prev,
        suppliers: [...prev.suppliers, newSupplier]
      }));
      
      return supabaseData ? supabaseData[0] : newSupplier;
    } catch (error) {
      console.error("Error adding supplier:", error);
      toast.error("Failed to add supplier to database");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const updateSupplier = useCallback(async (id: string, supplier: Omit<Supplier, "id">) => {
    setIsLoading(true);
    try {
      // Update in Supabase first
      const { error } = await supabase
        .from('suppliers')
        .update({
          name: supplier.name,
          country: supplier.country,
          contact_person: supplier.contactPerson,
          email: supplier.email,
          phone: supplier.phone,
          rating: supplier.rating,
          on_time_delivery: supplier.onTimeDelivery,
          location: supplier.location,
          positive_comments: supplier.positiveComments || [],
          negative_comments: supplier.negativeComments || []
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setData(prev => ({
        ...prev,
        suppliers: prev.suppliers.map(s => s.id === id ? { ...supplier, id } : s)
      }));
    } catch (error) {
      console.error("Error updating supplier:", error);
      toast.error("Failed to update supplier in database");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const deleteSupplier = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      // Delete from Supabase first
      const { error } = await supabase
        .from('suppliers')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
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
    } catch (error) {
      console.error("Error deleting supplier:", error);
      toast.error("Failed to delete supplier from database");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // CRUD Operations for Purchase Orders
  const addPurchaseOrder = useCallback(async (purchaseOrder: Omit<PurchaseOrder, "id">) => {
    setIsLoading(true);
    try {
      const newPurchaseOrder = { ...purchaseOrder, id: uuidv4() };
      const parts = [...newPurchaseOrder.parts];
      
      // Add to Supabase first
      const { data: supabaseData, error } = await supabase
        .from('purchase_orders')
        .insert([{
          id: newPurchaseOrder.id,
          po_number: newPurchaseOrder.poNumber,
          project_id: newPurchaseOrder.projectId,
          supplier_id: newPurchaseOrder.supplierId,
          status: newPurchaseOrder.status,
          deadline: newPurchaseOrder.deadline,
          issued_date: newPurchaseOrder.issuedDate,
          progress: newPurchaseOrder.progress || 0,
          amount: newPurchaseOrder.amount,
          description: newPurchaseOrder.description
        }])
        .select();
      
      if (error) throw error;
      
      // Add parts to Supabase
      if (parts.length > 0) {
        const partsWithPOId = parts.map(part => ({
          id: part.id.startsWith('part-') ? uuidv4() : part.id,
          name: part.name,
          quantity: part.quantity,
          status: part.status,
          po_id: newPurchaseOrder.id
        }));
        
        const { error: partsError } = await supabase
          .from('parts')
          .insert(partsWithPOId);
        
        if (partsError) throw partsError;
        
        // Update part IDs in the new purchase order
        newPurchaseOrder.parts = partsWithPOId.map(part => ({
          id: part.id,
          name: part.name,
          quantity: part.quantity,
          status: part.status
        }));
      }
      
      // Update local state
      setData(prev => ({
        ...prev,
        purchaseOrders: [...prev.purchaseOrders, newPurchaseOrder]
      }));
      
      return supabaseData ? supabaseData[0] : newPurchaseOrder;
    } catch (error) {
      console.error("Error adding purchase order:", error);
      toast.error("Failed to add purchase order to database");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const updatePurchaseOrder = useCallback(async (id: string, purchaseOrder: Omit<PurchaseOrder, "id">) => {
    setIsLoading(true);
    try {
      // Update in Supabase first
      const { error } = await supabase
        .from('purchase_orders')
        .update({
          po_number: purchaseOrder.poNumber,
          project_id: purchaseOrder.projectId,
          supplier_id: purchaseOrder.supplierId,
          status: purchaseOrder.status,
          deadline: purchaseOrder.deadline,
          issued_date: purchaseOrder.issuedDate,
          progress: purchaseOrder.progress || 0,
          amount: purchaseOrder.amount,
          description: purchaseOrder.description
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Get existing parts from Supabase
      const { data: existingParts } = await supabase
        .from('parts')
        .select('id')
        .eq('po_id', id);
      
      const existingPartIds = existingParts?.map(p => p.id) || [];
      const newParts = purchaseOrder.parts.filter(p => !existingPartIds.includes(p.id) || p.id.startsWith('part-'));
      const updatedParts = purchaseOrder.parts.filter(p => existingPartIds.includes(p.id) && !p.id.startsWith('part-'));
      const deletedPartIds = existingPartIds.filter(id => !purchaseOrder.parts.some(p => p.id === id));
      
      // Delete removed parts
      if (deletedPartIds.length > 0) {
        const { error: deleteError } = await supabase
          .from('parts')
          .delete()
          .in('id', deletedPartIds);
        
        if (deleteError) throw deleteError;
      }
      
      // Add new parts
      if (newParts.length > 0) {
        const partsToAdd = newParts.map(part => ({
          id: part.id.startsWith('part-') ? uuidv4() : part.id,
          name: part.name,
          quantity: part.quantity,
          status: part.status,
          po_id: id
        }));
        
        const { error: addError } = await supabase
          .from('parts')
          .insert(partsToAdd);
        
        if (addError) throw addError;
      }
      
      // Update existing parts
      for (const part of updatedParts) {
        const { error: updateError } = await supabase
          .from('parts')
          .update({
            name: part.name,
            quantity: part.quantity,
            status: part.status
          })
          .eq('id', part.id);
        
        if (updateError) throw updateError;
      }
      
      // Update local state
      setData(prev => ({
        ...prev,
        purchaseOrders: prev.purchaseOrders.map(po => po.id === id ? { ...purchaseOrder, id } : po)
      }));
    } catch (error) {
      console.error("Error updating purchase order:", error);
      toast.error("Failed to update purchase order in database");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const deletePurchaseOrder = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      // Delete parts first due to foreign key constraint
      const { error: partsError } = await supabase
        .from('parts')
        .delete()
        .eq('po_id', id);
      
      if (partsError) throw partsError;
      
      // Then delete the purchase order
      const { error } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setData(prev => ({
        ...prev,
        purchaseOrders: prev.purchaseOrders.filter(po => po.id !== id),
        // Also update external links
        externalLinks: prev.externalLinks.map(el => 
          el.poId === id ? { ...el, poId: undefined } : el
        )
      }));
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      toast.error("Failed to delete purchase order from database");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // CRUD Operations for External Links
  const addExternalLink = useCallback(async (externalLink: Omit<ExternalLink, "id">) => {
    setIsLoading(true);
    try {
      const newExternalLink = { ...externalLink, id: uuidv4() };
      
      // Add to Supabase first
      const { data: supabaseData, error } = await supabase
        .from('external_links')
        .insert([{
          id: newExternalLink.id,
          type: newExternalLink.type,
          project_id: newExternalLink.projectId,
          supplier_id: newExternalLink.supplierId,
          po_id: newExternalLink.poId,
          title: newExternalLink.title,
          url: newExternalLink.url,
          date: newExternalLink.date
        }])
        .select();
      
      if (error) throw error;
      
      // Update local state
      setData(prev => ({
        ...prev,
        externalLinks: [...prev.externalLinks, newExternalLink]
      }));
      
      return supabaseData ? supabaseData[0] : newExternalLink;
    } catch (error) {
      console.error("Error adding external link:", error);
      toast.error("Failed to add external link to database");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const updateExternalLink = useCallback(async (id: string, externalLink: Omit<ExternalLink, "id">) => {
    setIsLoading(true);
    try {
      // Update in Supabase first
      const { error } = await supabase
        .from('external_links')
        .update({
          type: externalLink.type,
          project_id: externalLink.projectId,
          supplier_id: externalLink.supplierId,
          po_id: externalLink.poId,
          title: externalLink.title,
          url: externalLink.url,
          date: externalLink.date
        })
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setData(prev => ({
        ...prev,
        externalLinks: prev.externalLinks.map(el => el.id === id ? { ...externalLink, id } : el)
      }));
    } catch (error) {
      console.error("Error updating external link:", error);
      toast.error("Failed to update external link in database");
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const deleteExternalLink = useCallback(async (id: string) => {
    setIsLoading(true);
    try {
      // Delete from Supabase first
      const { error } = await supabase
        .from('external_links')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setData(prev => ({
        ...prev,
        externalLinks: prev.externalLinks.filter(el => el.id !== id)
      }));
    } catch (error) {
      console.error("Error deleting external link:", error);
      toast.error("Failed to delete external link from database");
      throw error;
    } finally {
      setIsLoading(false);
    }
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
        progress: po.progress || 0,
        amount: po.amount,
        description: po.description
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
      
      const result = await syncAllData(
        projectsToSync,
        clientsToSync,
        suppliersToSync,
        purchaseOrdersToSync,
        externalLinksToSync
      );
      
      if (!result.success) {
        throw new Error(result.message);
      }
      
      toast.success("Data synchronized with Supabase successfully");
      
    } catch (error) {
      console.error("Error syncing with Supabase:", error);
      toast.error("Failed to sync with Supabase");
      throw error;
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
          amount: po.amount,
          description: po.description,
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
        
        console.info("Loaded data from Supabase successfully");
        return { success: true };
      }
      
      console.error("Failed to load data from Supabase");
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
        externalLinks: []
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
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};

// Import Supabase client
import { supabase } from "@/integrations/supabase/client";
