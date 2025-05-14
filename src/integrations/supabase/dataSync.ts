
import { supabase } from './client';
import type { Project, Client, Supplier, PurchaseOrder, Part, ExternalLink } from "@/contexts/DataContext";

// Interface for sync operations
export interface SyncResult {
  success: boolean;
  message: string;
  error?: any;
  insertedCount?: number;
  updatedCount?: number;
  erroredItems?: any[];
}

// Function to sync all data with Supabase
export const syncAllData = async (
  projects: Project[], 
  clients: Client[], 
  suppliers: Supplier[],
  purchaseOrders: PurchaseOrder[], 
  externalLinks: ExternalLink[]
): Promise<SyncResult> => {
  try {
    // Clear existing data (optional - comment out if you want to preserve existing data)
    await clearTables();
    
    // Sync data in the correct order to maintain referential integrity
    const clientsResult = await syncClients(clients);
    if (!clientsResult.success) {
      return { 
        success: false, 
        message: "Failed to sync clients", 
        error: clientsResult.error 
      };
    }

    const projectsResult = await syncProjects(projects);
    if (!projectsResult.success) {
      return { 
        success: false, 
        message: "Failed to sync projects", 
        error: projectsResult.error 
      };
    }

    const suppliersResult = await syncSuppliers(suppliers);
    if (!suppliersResult.success) {
      return { 
        success: false, 
        message: "Failed to sync suppliers", 
        error: suppliersResult.error 
      };
    }

    const purchaseOrdersResult = await syncPurchaseOrders(purchaseOrders);
    if (!purchaseOrdersResult.success) {
      return { 
        success: false, 
        message: "Failed to sync purchase orders", 
        error: purchaseOrdersResult.error 
      };
    }

    // Extract all parts from purchase orders and sync them
    const allParts = purchaseOrders.flatMap(po => 
      po.parts.map(part => ({ ...part, po_id: po.id }))
    );
    const partsResult = await syncParts(allParts);
    if (!partsResult.success) {
      return { 
        success: false, 
        message: "Failed to sync parts", 
        error: partsResult.error 
      };
    }

    const externalLinksResult = await syncExternalLinks(externalLinks);
    if (!externalLinksResult.success) {
      return { 
        success: false, 
        message: "Failed to sync external links", 
        error: externalLinksResult.error 
      };
    }

    return {
      success: true,
      message: "All data synchronized successfully",
      insertedCount: 
        clientsResult.insertedCount! + 
        projectsResult.insertedCount! + 
        suppliersResult.insertedCount! + 
        purchaseOrdersResult.insertedCount! + 
        partsResult.insertedCount! + 
        externalLinksResult.insertedCount!
    };

  } catch (error) {
    console.error("Failed to sync all data:", error);
    return {
      success: false,
      message: "Failed to sync all data",
      error
    };
  }
};

// Clear all tables (optional - use carefully)
const clearTables = async (): Promise<void> => {
  try {
    await supabase.from('external_links').delete().gt('id', '');
    await supabase.from('parts').delete().gt('id', '');
    await supabase.from('purchase_orders').delete().gt('id', '');
    await supabase.from('projects').delete().gt('id', '');
    await supabase.from('suppliers').delete().gt('id', '');
    await supabase.from('clients').delete().gt('id', '');
  } catch (error) {
    console.error("Error clearing tables:", error);
  }
};

// Sync clients data
export const syncClients = async (clients: Client[]): Promise<SyncResult> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .upsert(clients, { 
        onConflict: 'id',
        ignoreDuplicates: false,
        returning: 'minimal'
      });

    if (error) throw error;

    return {
      success: true,
      message: "Clients synchronized successfully",
      insertedCount: clients.length
    };
  } catch (error) {
    console.error("Failed to sync clients:", error);
    return {
      success: false,
      message: "Failed to sync clients",
      error
    };
  }
};

// Sync projects data
export const syncProjects = async (projects: Project[]): Promise<SyncResult> => {
  try {
    const { data, error } = await supabase
      .from('projects')
      .upsert(projects, { 
        onConflict: 'id',
        ignoreDuplicates: false,
        returning: 'minimal'
      });

    if (error) throw error;

    return {
      success: true,
      message: "Projects synchronized successfully",
      insertedCount: projects.length
    };
  } catch (error) {
    console.error("Failed to sync projects:", error);
    return {
      success: false,
      message: "Failed to sync projects",
      error
    };
  }
};

// Sync suppliers data
export const syncSuppliers = async (suppliers: Supplier[]): Promise<SyncResult> => {
  try {
    const { data, error } = await supabase
      .from('suppliers')
      .upsert(suppliers, { 
        onConflict: 'id',
        ignoreDuplicates: false,
        returning: 'minimal'
      });

    if (error) throw error;

    return {
      success: true,
      message: "Suppliers synchronized successfully",
      insertedCount: suppliers.length
    };
  } catch (error) {
    console.error("Failed to sync suppliers:", error);
    return {
      success: false,
      message: "Failed to sync suppliers",
      error
    };
  }
};

// Sync purchase orders data
export const syncPurchaseOrders = async (purchaseOrders: PurchaseOrder[]): Promise<SyncResult> => {
  try {
    // Remove parts array before sending to Supabase
    const poToSync = purchaseOrders.map(({ parts, ...po }) => po);
    
    const { data, error } = await supabase
      .from('purchase_orders')
      .upsert(poToSync, { 
        onConflict: 'id',
        ignoreDuplicates: false,
        returning: 'minimal'
      });

    if (error) throw error;

    return {
      success: true,
      message: "Purchase orders synchronized successfully",
      insertedCount: purchaseOrders.length
    };
  } catch (error) {
    console.error("Failed to sync purchase orders:", error);
    return {
      success: false,
      message: "Failed to sync purchase orders",
      error
    };
  }
};

// Sync parts data
export const syncParts = async (parts: any[]): Promise<SyncResult> => {
  try {
    const { data, error } = await supabase
      .from('parts')
      .upsert(parts, { 
        onConflict: 'id',
        ignoreDuplicates: false,
        returning: 'minimal'
      });

    if (error) throw error;

    return {
      success: true,
      message: "Parts synchronized successfully",
      insertedCount: parts.length
    };
  } catch (error) {
    console.error("Failed to sync parts:", error);
    return {
      success: false,
      message: "Failed to sync parts",
      error
    };
  }
};

// Sync external links data
export const syncExternalLinks = async (externalLinks: ExternalLink[]): Promise<SyncResult> => {
  try {
    const { data, error } = await supabase
      .from('external_links')
      .upsert(externalLinks, { 
        onConflict: 'id',
        ignoreDuplicates: false,
        returning: 'minimal'
      });

    if (error) throw error;

    return {
      success: true,
      message: "External links synchronized successfully",
      insertedCount: externalLinks.length
    };
  } catch (error) {
    console.error("Failed to sync external links:", error);
    return {
      success: false,
      message: "Failed to sync external links",
      error
    };
  }
};

// Function to load all data from Supabase
export const loadAllData = async () => {
  try {
    // Load clients
    const { data: clientsData, error: clientsError } = await supabase
      .from('clients')
      .select('*');
    
    if (clientsError) throw clientsError;

    // Load projects
    const { data: projectsData, error: projectsError } = await supabase
      .from('projects')
      .select('*');
    
    if (projectsError) throw projectsError;

    // Load suppliers
    const { data: suppliersData, error: suppliersError } = await supabase
      .from('suppliers')
      .select('*');
    
    if (suppliersError) throw suppliersError;

    // Load purchase orders
    const { data: purchaseOrdersData, error: purchaseOrdersError } = await supabase
      .from('purchase_orders')
      .select('*');
    
    if (purchaseOrdersError) throw purchaseOrdersError;

    // Load parts
    const { data: partsData, error: partsError } = await supabase
      .from('parts')
      .select('*');
    
    if (partsError) throw partsError;

    // Load external links
    const { data: externalLinksData, error: externalLinksError } = await supabase
      .from('external_links')
      .select('*');
    
    if (externalLinksError) throw externalLinksError;

    // Combine parts with purchase orders
    const purchaseOrdersWithParts = purchaseOrdersData.map(po => {
      const relatedParts = partsData.filter(part => part.po_id === po.id);
      return {
        ...po,
        parts: relatedParts
      };
    });

    return {
      success: true,
      clients: clientsData,
      projects: projectsData,
      suppliers: suppliersData,
      purchaseOrders: purchaseOrdersWithParts,
      externalLinks: externalLinksData
    };
  } catch (error) {
    console.error("Failed to load data from Supabase:", error);
    return {
      success: false,
      error,
      clients: [],
      projects: [],
      suppliers: [],
      purchaseOrders: [],
      externalLinks: []
    };
  }
};
