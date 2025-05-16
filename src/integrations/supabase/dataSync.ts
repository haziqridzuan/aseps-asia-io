
import { supabase } from "./client";
import { Client, ExternalLink, Project, PurchaseOrder, Supplier } from "@/contexts/DataContext";
import { createDummyData } from "@/data/dummy-data";

// Convert camelCase to snake_case for database fields
const camelToSnake = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);

// Load dummy data
export const loadDummyData = () => {
  return createDummyData();
};

// Sync dummy data with Supabase
export const syncDummyToSupabase = async (data: any) => {
  try {
    // Clients
    await syncClientsToSupabase(data.clients);
    
    // Suppliers
    await syncSuppliersToSupabase(data.suppliers);
    
    // Projects
    await syncProjectsToSupabase(data.projects);
    
    // Purchase Orders
    await syncPurchaseOrdersToSupabase(data.purchaseOrders);
    
    // External Links
    await syncExternalLinksToSupabase(data.externalLinks);
    
    console.log("Successfully synced dummy data with Supabase");
  } catch (error) {
    console.error("Error syncing dummy data with Supabase:", error);
    throw error;
  }
};

// Sync clients with Supabase
export const syncClientsToSupabase = async (clients: Client[]) => {
  try {
    // Check existing clients
    const { data: existingClients, error: fetchError } = await supabase
      .from('clients')
      .select('id');
      
    if (fetchError) throw fetchError;
    
    const existingIds = new Set(existingClients?.map(client => client.id) || []);
    
    // Filter clients that don't exist yet
    const newClients = clients.filter(client => !existingIds.has(client.id));
    
    if (newClients.length === 0) return;
    
    // Insert new clients
    const clientsToInsert = newClients.map(client => ({
      id: client.id,
      name: client.name,
      contact_person: client.contactPerson,
      email: client.email,
      phone: client.phone,
      location: client.location,
    }));
    
    const { error: insertError } = await supabase
      .from('clients')
      .insert(clientsToInsert);
      
    if (insertError) throw insertError;
    
    console.log(`Synced ${newClients.length} clients to Supabase`);
  } catch (error) {
    console.error("Error syncing clients:", error);
    throw error;
  }
};

// Sync suppliers with Supabase
export const syncSuppliersToSupabase = async (suppliers: Supplier[]) => {
  try {
    // Check existing suppliers
    const { data: existingSuppliers, error: fetchError } = await supabase
      .from('suppliers')
      .select('id');
      
    if (fetchError) throw fetchError;
    
    const existingIds = new Set(existingSuppliers?.map(supplier => supplier.id) || []);
    
    // Filter suppliers that don't exist yet
    const newSuppliers = suppliers.filter(supplier => !existingIds.has(supplier.id));
    
    if (newSuppliers.length === 0) return;
    
    // Insert new suppliers
    const suppliersToInsert = newSuppliers.map(supplier => ({
      id: supplier.id,
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
    }));
    
    const { error: insertError } = await supabase
      .from('suppliers')
      .insert(suppliersToInsert);
      
    if (insertError) throw insertError;
    
    console.log(`Synced ${newSuppliers.length} suppliers to Supabase`);
  } catch (error) {
    console.error("Error syncing suppliers:", error);
    throw error;
  }
};

// Sync projects with Supabase
export const syncProjectsToSupabase = async (projects: Project[]) => {
  try {
    // Check existing projects
    const { data: existingProjects, error: fetchError } = await supabase
      .from('projects')
      .select('id');
      
    if (fetchError) throw fetchError;
    
    const existingIds = new Set(existingProjects?.map(project => project.id) || []);
    
    // Filter projects that don't exist yet
    const newProjects = projects.filter(project => !existingIds.has(project.id));
    
    if (newProjects.length === 0) return;
    
    // Insert new projects
    const projectsToInsert = newProjects.map(project => ({
      id: project.id,
      name: project.name,
      client_id: project.clientId,
      location: project.location,
      status: project.status,
      progress: project.progress,
      start_date: project.startDate,
      end_date: project.endDate,
      project_manager: project.projectManager,
      description: project.description,
    }));
    
    const { error: insertError } = await supabase
      .from('projects')
      .insert(projectsToInsert);
      
    if (insertError) throw insertError;
    
    console.log(`Synced ${newProjects.length} projects to Supabase`);
  } catch (error) {
    console.error("Error syncing projects:", error);
    throw error;
  }
};

// Sync purchase orders with Supabase
export const syncPurchaseOrdersToSupabase = async (purchaseOrders: PurchaseOrder[]) => {
  try {
    // Check existing purchase orders
    const { data: existingPOs, error: fetchError } = await supabase
      .from('purchase_orders')
      .select('id');
      
    if (fetchError) throw fetchError;
    
    const existingIds = new Set(existingPOs?.map(po => po.id) || []);
    
    // Filter purchase orders that don't exist yet
    const newPurchaseOrders = purchaseOrders.filter(po => !existingIds.has(po.id));
    
    if (newPurchaseOrders.length === 0) return;
    
    // Insert new purchase orders
    for (const po of newPurchaseOrders) {
      // Insert PO
      const { data: poData, error: poError } = await supabase
        .from('purchase_orders')
        .insert([{
          id: po.id,
          po_number: po.poNumber,
          project_id: po.projectId,
          supplier_id: po.supplierId,
          status: po.status,
          issued_date: po.issuedDate,
          deadline: po.deadline,
          progress: po.progress || 0,
          amount: po.amount,
          description: po.description,
        }])
        .select();
        
      if (poError) throw poError;
      
      // Insert parts
      if (po.parts && po.parts.length > 0) {
        const partsToInsert = po.parts.map(part => ({
          id: part.id,
          name: part.name,
          quantity: part.quantity,
          status: part.status,
          progress: part.progress || 0, // Make sure progress is included
          po_id: po.id,
        }));
        
        const { error: partsError } = await supabase
          .from('parts')
          .insert(partsToInsert);
          
        if (partsError) throw partsError;
      }
    }
    
    console.log(`Synced ${newPurchaseOrders.length} purchase orders to Supabase`);
  } catch (error) {
    console.error("Error syncing purchase orders:", error);
    throw error;
  }
};

// Sync external links with Supabase
export const syncExternalLinksToSupabase = async (externalLinks: ExternalLink[]) => {
  try {
    // Check existing external links
    const { data: existingLinks, error: fetchError } = await supabase
      .from('external_links')
      .select('id');
      
    if (fetchError) throw fetchError;
    
    const existingIds = new Set(existingLinks?.map(link => link.id) || []);
    
    // Filter external links that don't exist yet
    const newExternalLinks = externalLinks.filter(link => !existingIds.has(link.id));
    
    if (newExternalLinks.length === 0) return;
    
    // Insert new external links
    const linksToInsert = newExternalLinks.map(link => ({
      id: link.id,
      title: link.title,
      url: link.url,
      type: link.type,
      date: link.date,
      supplier_id: link.supplierId,
      project_id: link.projectId,
      po_id: link.poId,
    }));
    
    const { error: insertError } = await supabase
      .from('external_links')
      .insert(linksToInsert);
      
    if (insertError) throw insertError;
    
    console.log(`Synced ${newExternalLinks.length} external links to Supabase`);
  } catch (error) {
    console.error("Error syncing external links:", error);
    throw error;
  }
};

// Update a project in Supabase
export const updateSupabaseProject = async (id: string, data: any) => {
  try {
    const updateData: any = {};
    
    // Convert camelCase keys to snake_case for database
    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        const snakeKey = camelToSnake(key);
        updateData[snakeKey] = data[key];
      }
    }
    
    const { error } = await supabase
      .from('projects')
      .update(updateData)
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error(`Error updating project ${id}:`, error);
    throw error;
  }
};
