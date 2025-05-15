
import { supabase } from './client';
import type { Project, Client, Supplier, PurchaseOrder, Part, ExternalLink, Shipment } from "@/contexts/DataContext";

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
  projects: any[], 
  clients: any[], 
  suppliers: any[],
  purchaseOrders: any[], 
  externalLinks: any[],
  shipments: any[] = []
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
      po.parts ? po.parts.map((part: any) => ({ ...part, po_id: po.id })) : []
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

    // Sync shipments if available
    if (shipments && shipments.length > 0) {
      const shipmentsResult = await syncShipments(shipments);
      if (!shipmentsResult.success) {
        return { 
          success: false, 
          message: "Failed to sync shipments", 
          error: shipmentsResult.error 
        };
      }
    }

    return {
      success: true,
      message: "All data synchronized successfully",
      insertedCount: 
        (clientsResult.insertedCount || 0) + 
        (projectsResult.insertedCount || 0) + 
        (suppliersResult.insertedCount || 0) + 
        (purchaseOrdersResult.insertedCount || 0) + 
        (partsResult.insertedCount || 0) + 
        (externalLinksResult.insertedCount || 0)
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
    await supabase.from('shipments').delete().gt('id', '');
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
export const syncClients = async (clients: any[]): Promise<SyncResult> => {
  try {
    // Use upsert instead of insert to handle both inserts and updates
    const { error } = await supabase
      .from('clients')
      .upsert(clients, { 
        onConflict: 'id',
        ignoreDuplicates: false
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
export const syncProjects = async (projects: any[]): Promise<SyncResult> => {
  try {
    const { error } = await supabase
      .from('projects')
      .upsert(projects, { 
        onConflict: 'id',
        ignoreDuplicates: false
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
export const syncSuppliers = async (suppliers: any[]): Promise<SyncResult> => {
  try {
    const { error } = await supabase
      .from('suppliers')
      .upsert(suppliers, { 
        onConflict: 'id',
        ignoreDuplicates: false
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
export const syncPurchaseOrders = async (purchaseOrders: any[]): Promise<SyncResult> => {
  try {
    // Create a new array without 'parts' property for PO syncing
    const poToSync = purchaseOrders.map(({ parts, ...po }) => po);
    
    const { error } = await supabase
      .from('purchase_orders')
      .upsert(poToSync, { 
        onConflict: 'id',
        ignoreDuplicates: false
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
    if (parts.length === 0) {
      return {
        success: true,
        message: "No parts to synchronize",
        insertedCount: 0
      };
    }
    
    const partsToSync = parts.map(part => ({
      ...part,
      progress: part.progress || 0
    }));
    
    const { error } = await supabase
      .from('parts')
      .upsert(partsToSync, { 
        onConflict: 'id',
        ignoreDuplicates: false
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
export const syncExternalLinks = async (externalLinks: any[]): Promise<SyncResult> => {
  try {
    const { error } = await supabase
      .from('external_links')
      .upsert(externalLinks, { 
        onConflict: 'id',
        ignoreDuplicates: false
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

// Sync shipments data
export const syncShipments = async (shipments: any[]): Promise<SyncResult> => {
  try {
    if (shipments.length === 0) {
      return {
        success: true,
        message: "No shipments to synchronize",
        insertedCount: 0
      };
    }
    
    const { error } = await supabase
      .from('shipments')
      .upsert(shipments, { 
        onConflict: 'id',
        ignoreDuplicates: false
      });

    if (error) throw error;

    return {
      success: true,
      message: "Shipments synchronized successfully",
      insertedCount: shipments.length
    };
  } catch (error) {
    console.error("Failed to sync shipments:", error);
    return {
      success: false,
      message: "Failed to sync shipments",
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

    // Load shipments
    const { data: shipmentsData, error: shipmentsError } = await supabase
      .from('shipments')
      .select('*');
    
    // It's okay if shipments table doesn't exist yet
    let shipments = [];
    if (!shipmentsError) {
      shipments = shipmentsData || [];
    }

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
      externalLinks: externalLinksData,
      shipments
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
      externalLinks: [],
      shipments: []
    };
  }
};
