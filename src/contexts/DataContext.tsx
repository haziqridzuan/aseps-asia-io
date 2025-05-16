import React, { createContext, useContext, useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { loadDummyData, syncDummyToSupabase, updateSupabaseProject } from "@/integrations/supabase/dataSync";
import { createDummyData } from "@/data/dummy-data";

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
  contactPerson?: string;
  email?: string;
  phone?: string;
  country?: string;
  location?: string;
  rating?: number;
  onTimeDelivery?: number;
  positiveComments?: string[];
  negativeComments?: string[];
}

export interface Part {
  id: string;
  name: string;
  quantity: number;
  status: "Pending" | "In Progress" | "Completed" | "Delayed" | string;
  progress?: number;
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  projectId: string;
  supplierId: string;
  status: "Active" | "Completed" | "Delayed" | string;
  issuedDate: string;
  deadline: string;
  progress?: number;
  amount?: number;
  description?: string;
  parts: Part[];
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  location: string;
  status: "In Progress" | "Completed" | "Pending" | "Delayed" | string;
  progress: number;
  startDate: string;
  endDate: string;
  projectManager?: string;
  description?: string;
}

export interface ExternalLink {
  id: string;
  title: string;
  url: string;
  type?: string;
  date: string;
  supplierId?: string;
  projectId?: string;
  poId?: string;
}

export interface Shipment {
  id: string;
  type: string;
  projectId: string;
  supplierId: string;
  poId?: string;
  partId?: string;
  shippedDate: string;
  etdDate: string;
  etaDate: string;
  trackingNumber?: string;
  containerNumber?: string;
  containerSize?: string;
  containerType?: string;
  status: string;
  notes?: string;
}

interface DataContextType {
  clients: Client[];
  suppliers: Supplier[];
  projects: Project[];
  purchaseOrders: PurchaseOrder[];
  externalLinks: ExternalLink[];
  shipments: Shipment[];
  loading: boolean;
  error: any;
  
  // Added these missing properties for AdminDashboard.tsx and AdminSettings.tsx
  generateDummyData: () => void;
  syncWithSupabase: () => Promise<void>;
  loadFromSupabase: () => Promise<{ success: boolean }>;
  isLoading: boolean;
  clearAllData: () => Promise<void>;
  
  addProject: (project: Omit<Project, "id">) => Promise<void>;
  updateProject: (id: string, project: Partial<Project>) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  
  addSupplier: (supplier: Omit<Supplier, "id">) => Promise<void>;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;
  
  addClient: (client: Omit<Client, "id">) => Promise<void>;
  updateClient: (id: string, client: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  
  addPurchaseOrder: (po: Omit<PurchaseOrder, "id">) => Promise<void>;
  updatePurchaseOrder: (id: string, po: Partial<Omit<PurchaseOrder, "id">>) => Promise<void>;
  deletePurchaseOrder: (id: string) => Promise<void>;
  
  addExternalLink: (link: Omit<ExternalLink, "id">) => Promise<void>;
  updateExternalLink: (id: string, link: Partial<ExternalLink>) => Promise<void>;
  deleteExternalLink: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | null>(null);

export const DataProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [clients, setClients] = useState<Client[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>([]);
  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>([]);
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  
  // Load all data on initial render and setup real-time subscriptions
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        // Load data from Supabase
        await loadDataFromSupabase();
        
        // Setup real-time subscription for tables
        setupRealtimeSubscriptions();
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err);
        
        // Fallback to dummy data if Supabase fails
        const dummyData = createDummyData();
        setClients(dummyData.clients);
        setSuppliers(dummyData.suppliers);
        setProjects(dummyData.projects);
        setPurchaseOrders(dummyData.purchaseOrders);
        setExternalLinks(dummyData.externalLinks);
        // Try to sync dummy data with Supabase
        try {
          await syncDummyToSupabase(dummyData);
        } catch (syncErr) {
          console.error("Failed to sync dummy data with Supabase:", syncErr);
        }
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
    
    return () => {
      // Cleanup subscriptions
      const subscription = supabase.getChannels()[0];
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, []);

  // Update project progress based on POs
  useEffect(() => {
    const updateProjectsProgress = async () => {
      if (purchaseOrders.length === 0 || projects.length === 0) return;
      
      // Group purchase orders by project
      const posByProject: Record<string, PurchaseOrder[]> = {};
      
      purchaseOrders.forEach(po => {
        if (!posByProject[po.projectId]) {
          posByProject[po.projectId] = [];
        }
        posByProject[po.projectId].push(po);
      });
      
      // Deduplicate POs by PO number for each project (count them as 1)
      const deduplicatedPosByProject: Record<string, { [poNumber: string]: PurchaseOrder }> = {};
      
      Object.keys(posByProject).forEach(projectId => {
        deduplicatedPosByProject[projectId] = {};
        
        posByProject[projectId].forEach(po => {
          // Only keep the most recent PO for each PO number (based on max progress)
          const existingPo = deduplicatedPosByProject[projectId][po.poNumber];
          
          if (!existingPo || (po.progress || 0) > (existingPo.progress || 0)) {
            deduplicatedPosByProject[projectId][po.poNumber] = po;
          }
        });
      });
      
      // Calculate average progress for each project
      for (const project of projects) {
        const uniquePOs = deduplicatedPosByProject[project.id];
        if (!uniquePOs) continue;
        
        const uniquePOsList = Object.values(uniquePOs);
        if (uniquePOsList.length === 0) continue;
        
        const totalProgress = uniquePOsList.reduce((sum, po) => sum + (po.progress || 0), 0);
        const newProgress = Math.round(totalProgress / uniquePOsList.length);
        
        // Only update if progress has changed
        if (newProgress !== project.progress) {
          try {
            await updateSupabaseProject(project.id, { progress: newProgress });
            setProjects(prev => 
              prev.map(p => p.id === project.id ? { ...p, progress: newProgress } : p)
            );
          } catch (error) {
            console.error(`Failed to update progress for project ${project.id}:`, error);
          }
        }
      }
    };
    
    updateProjectsProgress();
  }, [purchaseOrders, projects]);
  
  const loadDataFromSupabase = async () => {
    try {
      // Load clients
      const { data: clientsData, error: clientsError } = await supabase
        .from('clients')
        .select('*');
        
      if (clientsError) throw clientsError;
      
      setClients(clientsData.map(client => ({
        id: client.id,
        name: client.name,
        contactPerson: client.contact_person,
        email: client.email,
        phone: client.phone,
        location: client.location,
      })));
      
      // Load suppliers
      const { data: suppliersData, error: suppliersError } = await supabase
        .from('suppliers')
        .select('*');
        
      if (suppliersError) throw suppliersError;
      
      setSuppliers(suppliersData.map(supplier => ({
        id: supplier.id,
        name: supplier.name,
        contactPerson: supplier.contact_person,
        email: supplier.email,
        phone: supplier.phone,
        country: supplier.country,
        location: supplier.location,
        rating: supplier.rating,
        onTimeDelivery: supplier.on_time_delivery,
        positiveComments: supplier.positive_comments,
        negativeComments: supplier.negative_comments,
      })));
      
      // Load projects
      const { data: projectsData, error: projectsError } = await supabase
        .from('projects')
        .select('*');
        
      if (projectsError) throw projectsError;
      
      setProjects(projectsData.map(project => ({
        id: project.id,
        name: project.name,
        clientId: project.client_id,
        location: project.location || '',
        status: project.status || 'Pending',
        progress: project.progress || 0,
        startDate: project.start_date,
        endDate: project.end_date,
        projectManager: project.project_manager,
        description: project.description,
      })));
      
      // Load purchase orders
      const { data: poData, error: poError } = await supabase
        .from('purchase_orders')
        .select('*');
        
      if (poError) throw poError;
      
      // Load parts for each purchase order
      const { data: partsData, error: partsError } = await supabase
        .from('parts')
        .select('*');
        
      if (partsError) throw partsError;
      
      const poWithParts = poData.map(po => {
        // Make sure to map parts properly with the progress field
        const poParts = partsData
          .filter(part => part.po_id === po.id)
          .map(part => ({
            id: part.id,
            name: part.name,
            quantity: part.quantity,
            status: part.status || 'Pending',
            progress: part.progress || 0, // Make sure to map progress correctly
          }));
          
        return {
          id: po.id,
          poNumber: po.po_number,
          projectId: po.project_id,
          supplierId: po.supplier_id,
          status: po.status || 'Active',
          issuedDate: po.issued_date,
          deadline: po.deadline,
          progress: po.progress || 0,
          amount: po.amount,
          description: po.description,
          parts: poParts,
        };
      });
      
      setPurchaseOrders(poWithParts);
      
      // Load external links
      const { data: linksData, error: linksError } = await supabase
        .from('external_links')
        .select('*');
        
      if (linksError) throw linksError;
      
      setExternalLinks(linksData.map(link => ({
        id: link.id,
        title: link.title,
        url: link.url,
        type: link.type,
        date: link.date,
        supplierId: link.supplier_id,
        projectId: link.project_id,
        poId: link.po_id,
      })));
      
      // Load shipments
      const { data: shipmentsData, error: shipmentsError } = await supabase
        .from('shipments')
        .select('*');
        
      if (shipmentsError) throw shipmentsError;
      
      // Map database fields to our shipment interface
      const mappedShipments = shipmentsData.map(shipment => ({
        id: shipment.id,
        type: shipment.type,
        projectId: shipment.project_id,
        supplierId: shipment.supplier_id,
        poId: shipment.po_id,
        partId: shipment.part_id,
        shippedDate: shipment.shipped_date,
        etdDate: shipment.etd_date,
        etaDate: shipment.eta_date,
        trackingNumber: shipment.tracking_number,
        containerNumber: shipment.container_number,
        containerSize: shipment.container_size,
        containerType: shipment.container_type,
        status: shipment.status,
        notes: shipment.notes,
      }));
      
      setShipments(mappedShipments);
      
    } catch (err) {
      console.error("Error in loadDataFromSupabase:", err);
      throw err;
    }
  };
  
  const setupRealtimeSubscriptions = () => {
    const channel = supabase
      .channel('db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'clients' }, reloadClients)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'suppliers' }, reloadSuppliers)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'projects' }, reloadProjects)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'purchase_orders' }, reloadPurchaseOrders)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'parts' }, reloadPurchaseOrders)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'external_links' }, reloadExternalLinks)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'shipments' }, reloadShipments)
      .subscribe();
  };
  
  // Reload functions for real-time updates
  
  const reloadClients = async () => {
    const { data, error } = await supabase.from('clients').select('*');
    if (error) {
      console.error("Error reloading clients:", error);
      return;
    }
    
    if (data) {
      setClients(data.map(client => ({
        id: client.id,
        name: client.name,
        contactPerson: client.contact_person,
        email: client.email,
        phone: client.phone,
        location: client.location,
      })));
    }
  };
  
  const reloadSuppliers = async () => {
    const { data, error } = await supabase.from('suppliers').select('*');
    if (error) {
      console.error("Error reloading suppliers:", error);
      return;
    }
    
    if (data) {
      setSuppliers(data.map(supplier => ({
        id: supplier.id,
        name: supplier.name,
        contactPerson: supplier.contact_person,
        email: supplier.email,
        phone: supplier.phone,
        country: supplier.country,
        location: supplier.location,
        rating: supplier.rating,
        onTimeDelivery: supplier.on_time_delivery,
        positiveComments: supplier.positive_comments,
        negativeComments: supplier.negative_comments,
      })));
    }
  };
  
  const reloadProjects = async () => {
    const { data, error } = await supabase.from('projects').select('*');
    if (error) {
      console.error("Error reloading projects:", error);
      return;
    }
    
    if (data) {
      setProjects(data.map(project => ({
        id: project.id,
        name: project.name,
        clientId: project.client_id,
        location: project.location || '',
        status: project.status || 'Pending',
        progress: project.progress || 0,
        startDate: project.start_date,
        endDate: project.end_date,
        projectManager: project.project_manager,
        description: project.description,
      })));
    }
  };
  
  const reloadPurchaseOrders = async () => {
    try {
      const { data: poData, error: poError } = await supabase.from('purchase_orders').select('*');
      if (poError) throw poError;
      
      const { data: partsData, error: partsError } = await supabase.from('parts').select('*');
      if (partsError) throw partsError;
      
      if (poData && partsData) {
        const poWithParts = poData.map(po => {
          // Make sure parts have the progress field here too
          const poParts = partsData
            .filter(part => part.po_id === po.id)
            .map(part => ({
              id: part.id,
              name: part.name,
              quantity: part.quantity,
              status: part.status || 'Pending',
              progress: part.progress || 0, // Make sure progress is mapped
            }));
            
          return {
            id: po.id,
            poNumber: po.po_number,
            projectId: po.project_id,
            supplierId: po.supplier_id,
            status: po.status || 'Active',
            issuedDate: po.issued_date,
            deadline: po.deadline,
            progress: po.progress || 0,
            amount: po.amount,
            description: po.description,
            parts: poParts,
          };
        });
        
        setPurchaseOrders(poWithParts);
      }
    } catch (error) {
      console.error("Error reloading purchase orders:", error);
    }
  };
  
  const reloadExternalLinks = async () => {
    const { data, error } = await supabase.from('external_links').select('*');
    if (error) {
      console.error("Error reloading external links:", error);
      return;
    }
    
    if (data) {
      setExternalLinks(data.map(link => ({
        id: link.id,
        title: link.title,
        url: link.url,
        type: link.type,
        date: link.date,
        supplierId: link.supplier_id,
        projectId: link.project_id,
        poId: link.po_id,
      })));
    }
  };
  
  const reloadShipments = async () => {
    const { data, error } = await supabase.from('shipments').select('*');
    if (error) {
      console.error("Error reloading shipments:", error);
      return;
    }
    
    if (data) {
      const mappedShipments = data.map(shipment => ({
        id: shipment.id,
        type: shipment.type,
        projectId: shipment.project_id,
        supplierId: shipment.supplier_id,
        poId: shipment.po_id,
        partId: shipment.part_id,
        shippedDate: shipment.shipped_date,
        etdDate: shipment.etd_date,
        etaDate: shipment.eta_date,
        trackingNumber: shipment.tracking_number,
        containerNumber: shipment.container_number,
        containerSize: shipment.container_size,
        containerType: shipment.container_type,
        status: shipment.status,
        notes: shipment.notes,
      }));
      
      setShipments(mappedShipments);
    }
  };
  
  // Implement the functions for AdminDashboard.tsx and AdminSettings.tsx
  const generateDummyData = () => {
    const dummyData = createDummyData();
    setClients(dummyData.clients);
    setSuppliers(dummyData.suppliers);
    setProjects(dummyData.projects);
    setPurchaseOrders(dummyData.purchaseOrders);
    setExternalLinks(dummyData.externalLinks);
  };

  const syncWithSupabase = async () => {
    setIsLoading(true);
    try {
      const data = {
        clients,
        suppliers,
        projects,
        purchaseOrders,
        externalLinks
      };
      await syncDummyToSupabase(data);
    } catch (error) {
      console.error("Error syncing with Supabase:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const loadFromSupabase = async () => {
    setIsLoading(true);
    try {
      await loadDataFromSupabase();
      return { success: true };
    } catch (error) {
      console.error("Error loading from Supabase:", error);
      return { success: false };
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllData = async () => {
    setIsLoading(true);
    try {
      setClients([]);
      setSuppliers([]);
      setProjects([]);
      setPurchaseOrders([]);
      setExternalLinks([]);
      setShipments([]);
    } catch (error) {
      console.error("Error clearing data:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };
  
  // Data modification functions
  
  const addProject = async (project: Omit<Project, "id">) => {
    try {
      const { data, error } = await supabase.from('projects').insert([{
        name: project.name,
        client_id: project.clientId,
        location: project.location,
        status: project.status,
        progress: project.progress,
        start_date: project.startDate,
        end_date: project.endDate,
        project_manager: project.projectManager,
        description: project.description,
      }]).select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newProject = {
          id: data[0].id,
          name: data[0].name,
          clientId: data[0].client_id,
          location: data[0].location || '',
          status: data[0].status || 'Pending',
          progress: data[0].progress || 0,
          startDate: data[0].start_date,
          endDate: data[0].end_date,
          projectManager: data[0].project_manager,
          description: data[0].description,
        };
        
        setProjects(prev => [...prev, newProject]);
      }
    } catch (error) {
      console.error("Error adding project:", error);
      throw error;
    }
  };
  
  const updateProject = async (id: string, projectUpdate: Partial<Project>) => {
    try {
      const updateData: any = {};
      
      if (projectUpdate.name !== undefined) updateData.name = projectUpdate.name;
      if (projectUpdate.clientId !== undefined) updateData.client_id = projectUpdate.clientId;
      if (projectUpdate.location !== undefined) updateData.location = projectUpdate.location;
      if (projectUpdate.status !== undefined) updateData.status = projectUpdate.status;
      if (projectUpdate.progress !== undefined) updateData.progress = projectUpdate.progress;
      if (projectUpdate.startDate !== undefined) updateData.start_date = projectUpdate.startDate;
      if (projectUpdate.endDate !== undefined) updateData.end_date = projectUpdate.endDate;
      if (projectUpdate.projectManager !== undefined) updateData.project_manager = projectUpdate.projectManager;
      if (projectUpdate.description !== undefined) updateData.description = projectUpdate.description;
      
      const { error } = await supabase.from('projects').update(updateData).eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setProjects(prev => prev.map(p => p.id === id ? { ...p, ...projectUpdate } : p));
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  };
  
  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (error) {
      console.error("Error deleting project:", error);
      throw error;
    }
  };
  
  const addSupplier = async (supplier: Omit<Supplier, "id">) => {
    try {
      const { data, error } = await supabase.from('suppliers').insert([{
        name: supplier.name,
        contact_person: supplier.contactPerson,
        email: supplier.email,
        phone: supplier.phone,
        country: supplier.country,
        location: supplier.location,
        rating: supplier.rating,
        on_time_delivery: supplier.onTimeDelivery,
        positive_comments: supplier.positiveComments,
        negative_comments: supplier.negativeComments,
      }]).select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newSupplier = {
          id: data[0].id,
          name: data[0].name,
          contactPerson: data[0].contact_person,
          email: data[0].email,
          phone: data[0].phone,
          country: data[0].country,
          location: data[0].location,
          rating: data[0].rating,
          onTimeDelivery: data[0].on_time_delivery,
          positiveComments: data[0].positive_comments,
          negativeComments: data[0].negative_comments,
        };
        
        setSuppliers(prev => [...prev, newSupplier]);
      }
    } catch (error) {
      console.error("Error adding supplier:", error);
      throw error;
    }
  };
  
  const updateSupplier = async (id: string, supplierUpdate: Partial<Supplier>) => {
    try {
      const updateData: any = {};
      
      if (supplierUpdate.name !== undefined) updateData.name = supplierUpdate.name;
      if (supplierUpdate.contactPerson !== undefined) updateData.contact_person = supplierUpdate.contactPerson;
      if (supplierUpdate.email !== undefined) updateData.email = supplierUpdate.email;
      if (supplierUpdate.phone !== undefined) updateData.phone = supplierUpdate.phone;
      if (supplierUpdate.country !== undefined) updateData.country = supplierUpdate.country;
      if (supplierUpdate.location !== undefined) updateData.location = supplierUpdate.location;
      if (supplierUpdate.rating !== undefined) updateData.rating = supplierUpdate.rating;
      if (supplierUpdate.onTimeDelivery !== undefined) updateData.on_time_delivery = supplierUpdate.onTimeDelivery;
      if (supplierUpdate.positiveComments !== undefined) updateData.positive_comments = supplierUpdate.positiveComments;
      if (supplierUpdate.negativeComments !== undefined) updateData.negative_comments = supplierUpdate.negativeComments;
      
      const { error } = await supabase.from('suppliers').update(updateData).eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setSuppliers(prev => prev.map(s => s.id === id ? { ...s, ...supplierUpdate } : s));
    } catch (error) {
      console.error("Error updating supplier:", error);
      throw error;
    }
  };
  
  const deleteSupplier = async (id: string) => {
    try {
      const { error } = await supabase.from('suppliers').delete().eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setSuppliers(prev => prev.filter(s => s.id !== id));
    } catch (error) {
      console.error("Error deleting supplier:", error);
      throw error;
    }
  };
  
  const addClient = async (client: Omit<Client, "id">) => {
    try {
      const { data, error } = await supabase.from('clients').insert([{
        name: client.name,
        contact_person: client.contactPerson,
        email: client.email,
        phone: client.phone,
        location: client.location,
      }]).select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newClient = {
          id: data[0].id,
          name: data[0].name,
          contactPerson: data[0].contact_person,
          email: data[0].email,
          phone: data[0].phone,
          location: data[0].location,
        };
        
        setClients(prev => [...prev, newClient]);
      }
    } catch (error) {
      console.error("Error adding client:", error);
      throw error;
    }
  };
  
  const updateClient = async (id: string, clientUpdate: Partial<Client>) => {
    try {
      const updateData: any = {};
      
      if (clientUpdate.name !== undefined) updateData.name = clientUpdate.name;
      if (clientUpdate.contactPerson !== undefined) updateData.contact_person = clientUpdate.contactPerson;
      if (clientUpdate.email !== undefined) updateData.email = clientUpdate.email;
      if (clientUpdate.phone !== undefined) updateData.phone = clientUpdate.phone;
      if (clientUpdate.location !== undefined) updateData.location = clientUpdate.location;
      
      const { error } = await supabase.from('clients').update(updateData).eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setClients(prev => prev.map(c => c.id === id ? { ...c, ...clientUpdate } : c));
    } catch (error) {
      console.error("Error updating client:", error);
      throw error;
    }
  };
  
  const deleteClient = async (id: string) => {
    try {
      const { error } = await supabase.from('clients').delete().eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setClients(prev => prev.filter(c => c.id !== id));
    } catch (error) {
      console.error("Error deleting client:", error);
      throw error;
    }
  };
  
  const addPurchaseOrder = async (po: Omit<PurchaseOrder, "id">) => {
    try {
      // Check if this PO number exists with the same deadline
      const { data: existingPOs, error: checkError } = await supabase
        .from('purchase_orders')
        .select('*')
        .eq('po_number', po.poNumber)
        .eq('deadline', po.deadline);
      
      if (checkError) throw checkError;
      
      // If a PO with the same number and deadline exists, prevent creation
      if (existingPOs && existingPOs.length > 0) {
        throw new Error("A purchase order with this number and deadline already exists");
      }
      
      // Insert the new purchase order
      const { data: poData, error: poError } = await supabase.from('purchase_orders').insert([{
        po_number: po.poNumber,
        project_id: po.projectId,
        supplier_id: po.supplierId,
        status: po.status,
        issued_date: po.issuedDate,
        deadline: po.deadline,
        progress: po.progress || 0,
        amount: po.amount,
        description: po.description,
      }]).select();
      
      if (poError) throw poError;
      
      if (!poData || poData.length === 0) {
        throw new Error("Failed to create purchase order");
      }
      
      const newPoId = poData[0].id;
      
      // Insert parts
      const partsToInsert = po.parts.map(part => ({
        name: part.name,
        quantity: part.quantity,
        status: part.status,
        progress: part.progress || 0,
        po_id: newPoId,
      }));
      
      const { data: partsData, error: partsError } = await supabase
        .from('parts')
        .insert(partsToInsert)
        .select();
        
      if (partsError) throw partsError;
      
      // Map inserted parts to our format
      const insertedParts = partsData.map(part => ({
        id: part.id,
        name: part.name,
        quantity: part.quantity,
        status: part.status,
        progress: part.progress || 0,
      }));
      
      // Create new purchase order with parts
      const newPurchaseOrder = {
        id: newPoId,
        poNumber: po.poNumber,
        projectId: po.projectId,
        supplierId: po.supplierId,
        status: po.status,
        issuedDate: po.issuedDate,
        deadline: po.deadline,
        progress: po.progress || 0,
        amount: po.amount,
        description: po.description,
        parts: insertedParts,
      };
      
      // Update local state
      setPurchaseOrders(prev => [...prev, newPurchaseOrder]);
    } catch (error: any) {
      console.error("Error adding purchase order:", error);
      throw error;
    }
  };
  
  const updatePurchaseOrder = async (id: string, poUpdate: Partial<Omit<PurchaseOrder, "id">>) => {
    try {
      // Update purchase order
      const updateData: any = {};
      
      if (poUpdate.poNumber !== undefined) updateData.po_number = poUpdate.poNumber;
      if (poUpdate.projectId !== undefined) updateData.project_id = poUpdate.projectId;
      if (poUpdate.supplierId !== undefined) updateData.supplier_id = poUpdate.supplierId;
      if (poUpdate.status !== undefined) updateData.status = poUpdate.status;
      if (poUpdate.issuedDate !== undefined) updateData.issued_date = poUpdate.issuedDate;
      if (poUpdate.deadline !== undefined) updateData.deadline = poUpdate.deadline;
      if (poUpdate.progress !== undefined) updateData.progress = poUpdate.progress;
      if (poUpdate.amount !== undefined) updateData.amount = poUpdate.amount;
      if (poUpdate.description !== undefined) updateData.description = poUpdate.description;
      
      const { error: poError } = await supabase
        .from('purchase_orders')
        .update(updateData)
        .eq('id', id);
        
      if (poError) throw poError;
      
      // Update parts if provided
      if (poUpdate.parts) {
        // Get existing parts
        const { data: existingParts, error: getPartsError } = await supabase
          .from('parts')
          .select('*')
          .eq('po_id', id);
          
        if (getPartsError) throw getPartsError;
        
        const existingPartsMap = new Map(existingParts.map(part => [part.id, part]));
        const updatedPartsMap = new Map(poUpdate.parts.map(part => [part.id, part]));
        
        // Parts to update
        for (const part of poUpdate.parts) {
          if (part.id.startsWith('part-')) {
            // New part to create
            const { error: createPartError } = await supabase
              .from('parts')
              .insert([{
                name: part.name,
                quantity: part.quantity,
                status: part.status,
                progress: part.progress || 0, // Make sure progress is included
                po_id: id,
              }]);
              
            if (createPartError) throw createPartError;
          } else if (existingPartsMap.has(part.id)) {
            // Update existing part
            const { error: updatePartError } = await supabase
              .from('parts')
              .update({
                name: part.name,
                quantity: part.quantity,
                status: part.status,
                progress: part.progress || 0, // Make sure progress is included
                po_id: id,
              })
              .eq('id', part.id);
              
            if (updatePartError) throw updatePartError;
          }
        }
        
        // Delete parts that were removed
        const partsToDelete = Array.from(existingPartsMap.keys())
          .filter(partId => !updatedPartsMap.has(partId));
          
        if (partsToDelete.length > 0) {
          const { error: deletePartsError } = await supabase
            .from('parts')
            .delete()
            .in('id', partsToDelete);
            
          if (deletePartsError) throw deletePartsError;
        }
      }
      
      // Refresh purchase orders to get latest state
      await reloadPurchaseOrders();
    } catch (error) {
      console.error("Error updating purchase order:", error);
      throw error;
    }
  };
  
  const deletePurchaseOrder = async (id: string) => {
    try {
      // Delete parts first (foreign key constraint)
      const { error: partsError } = await supabase
        .from('parts')
        .delete()
        .eq('po_id', id);
        
      if (partsError) throw partsError;
      
      // Then delete the purchase order
      const { error: poError } = await supabase
        .from('purchase_orders')
        .delete()
        .eq('id', id);
        
      if (poError) throw poError;
      
      // Update local state
      setPurchaseOrders(prev => prev.filter(po => po.id !== id));
    } catch (error) {
      console.error("Error deleting purchase order:", error);
      throw error;
    }
  };
  
  const addExternalLink = async (link: Omit<ExternalLink, "id">) => {
    try {
      const { data, error } = await supabase.from('external_links').insert([{
        title: link.title,
        url: link.url,
        type: link.type,
        date: link.date,
        supplier_id: link.supplierId,
        project_id: link.projectId,
        po_id: link.poId,
      }]).select();
      
      if (error) throw error;
      
      if (data && data.length > 0) {
        const newLink = {
          id: data[0].id,
          title: data[0].title,
          url: data[0].url,
          type: data[0].type,
          date: data[0].date,
          supplierId: data[0].supplier_id,
          projectId: data[0].project_id,
          poId: data[0].po_id,
        };
        
        setExternalLinks(prev => [...prev, newLink]);
      }
    } catch (error) {
      console.error("Error adding external link:", error);
      throw error;
    }
  };
  
  const updateExternalLink = async (id: string, linkUpdate: Partial<ExternalLink>) => {
    try {
      const updateData: any = {};
      
      if (linkUpdate.title !== undefined) updateData.title = linkUpdate.title;
      if (linkUpdate.url !== undefined) updateData.url = linkUpdate.url;
      if (linkUpdate.type !== undefined) updateData.type = linkUpdate.type;
      if (linkUpdate.date !== undefined) updateData.date = linkUpdate.date;
      if (linkUpdate.supplierId !== undefined) updateData.supplier_id = linkUpdate.supplierId;
      if (linkUpdate.projectId !== undefined) updateData.project_id = linkUpdate.projectId;
      if (linkUpdate.poId !== undefined) updateData.po_id = linkUpdate.poId;
      
      const { error } = await supabase.from('external_links').update(updateData).eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setExternalLinks(prev => prev.map(link => link.id === id ? { ...link, ...linkUpdate } : link));
    } catch (error) {
      console.error("Error updating external link:", error);
      throw error;
    }
  };
  
  const deleteExternalLink = async (id: string) => {
    try {
      const { error } = await supabase.from('external_links').delete().eq('id', id);
      
      if (error) throw error;
      
      // Update local state
      setExternalLinks(prev => prev.filter(link => link.id !== id));
    } catch (error) {
      console.error("Error deleting external link:", error);
      throw error;
    }
  };
  
  const value = {
    clients,
    suppliers,
    projects,
    purchaseOrders,
    externalLinks,
    shipments,
    loading,
    error,
    
    // Include the newly implemented functions
    generateDummyData,
    syncWithSupabase,
    loadFromSupabase,
    isLoading,
    clearAllData,
    
    addProject,
    updateProject,
    deleteProject,
    
    addSupplier,
    updateSupplier,
    deleteSupplier,
    
    addClient,
    updateClient,
    deleteClient,
    
    addPurchaseOrder,
    updatePurchaseOrder,
    deletePurchaseOrder,
    
    addExternalLink,
    updateExternalLink,
    deleteExternalLink,
  };
  
  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
};
