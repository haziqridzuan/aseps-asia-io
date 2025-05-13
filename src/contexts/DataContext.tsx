
import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { useToast } from "@/hooks/use-toast";

// Types for our data
export interface Project {
  id: string;
  name: string;
  clientId: string;
  location: string;
  status: "In Progress" | "Completed" | "Pending" | "Delayed";
  progress: number;
  startDate: string;
  endDate: string;
  projectManager: string;
  description?: string;
}

export interface Client {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  location: string;
}

export interface Supplier {
  id: string;
  name: string;
  country: string;
  contactPerson: string;
  email: string;
  phone: string;
  rating: number;
  onTimeDelivery: number;
  comments: { positive: string[]; negative: string[] };
  location?: string; // Adding location property
}

export interface PurchaseOrder {
  id: string;
  poNumber: string;
  projectId: string;
  supplierId: string;
  parts: Part[];
  status: "Active" | "Completed" | "Delayed";
  deadline: string;
  issuedDate: string;
}

export interface Part {
  id: string;
  name: string;
  quantity: number;
  status: "In Progress" | "Completed" | "Pending" | "Delayed";
}

export interface ExternalLink {
  id: string;
  type: "Report" | "Photo" | "Tracking";
  projectId: string;
  poId?: string;
  supplierId?: string;
  title: string;
  url: string;
  date: string;
}

interface DataContextType {
  projects: Project[];
  clients: Client[];
  suppliers: Supplier[];
  purchaseOrders: PurchaseOrder[];
  externalLinks: ExternalLink[];
  isLoading: boolean;
  error: string | null;
  addProject: (project: Omit<Project, "id">) => void;
  updateProject: (id: string, project: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  addClient: (client: Omit<Client, "id">) => void;
  updateClient: (id: string, client: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  addSupplier: (supplier: Omit<Supplier, "id">) => void;
  updateSupplier: (id: string, supplier: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  addPurchaseOrder: (po: Omit<PurchaseOrder, "id">) => void;
  updatePurchaseOrder: (id: string, po: Partial<PurchaseOrder>) => void;
  deletePurchaseOrder: (id: string) => void;
  addExternalLink: (link: Omit<ExternalLink, "id">) => void;
  updateExternalLink: (id: string, link: Partial<ExternalLink>) => void;
  deleteExternalLink: (id: string) => void;
  generateDummyData: () => void;
  syncWithSupabase: () => Promise<void>;
  clearAllData: () => Promise<void>; // Adding clearAllData function
}

const DataContext = createContext<DataContextType | undefined>(undefined);

// Sample data for demonstration
const sampleProjects: Project[] = [
  {
    id: "p1",
    name: "Factory Automation System",
    clientId: "c1",
    location: "Shanghai, China",
    status: "In Progress",
    progress: 65,
    startDate: "2025-01-15",
    endDate: "2025-07-30",
    projectManager: "John Smith",
    description: "Factory automation system for consumer electronics production line.",
  },
  {
    id: "p2",
    name: "Healthcare Equipment",
    clientId: "c2",
    location: "Bangkok, Thailand",
    status: "Delayed",
    progress: 40,
    startDate: "2024-11-01",
    endDate: "2025-06-15",
    projectManager: "Jessica Chen",
    description: "Medical device manufacturing for hospital equipment.",
  },
  {
    id: "p3",
    name: "Automotive Parts",
    clientId: "c3",
    location: "Jakarta, Indonesia",
    status: "Completed",
    progress: 100,
    startDate: "2024-08-15",
    endDate: "2025-02-28",
    projectManager: "Michael Wong",
    description: "Precision automotive parts for luxury vehicle manufacturer.",
  },
];

const sampleClients: Client[] = [
  {
    id: "c1",
    name: "Tech Innovations Inc.",
    contactPerson: "Thomas Anderson",
    email: "tanderson@techinnovations.com",
    phone: "+1-555-234-5678",
    location: "San Francisco, USA",
  },
  {
    id: "c2",
    name: "MediHealth Solutions",
    contactPerson: "Sarah Johnson",
    email: "sjohnson@medihealth.com",
    phone: "+1-555-876-5432",
    location: "Boston, USA",
  },
  {
    id: "c3",
    name: "AutoPrecision GmbH",
    contactPerson: "Klaus Mueller",
    email: "kmueller@autoprecision.de",
    phone: "+49-555-123-4567",
    location: "Munich, Germany",
  },
];

const sampleSuppliers: Supplier[] = [
  {
    id: "s1",
    name: "Shanghai Electronics Co.",
    country: "China",
    contactPerson: "Li Wei",
    email: "liwei@shanghaielectronics.cn",
    phone: "+86-555-123-4567",
    rating: 4.5,
    onTimeDelivery: 92,
    comments: {
      positive: ["High quality components", "Responsive communication"],
      negative: ["Occasional shipping delays"],
    },
  },
  {
    id: "s2",
    name: "Bangkok Precision Parts",
    country: "Thailand",
    contactPerson: "Somchai Thongchai",
    email: "somchai@bangkokprecision.th",
    phone: "+66-555-987-6543",
    rating: 4.2,
    onTimeDelivery: 88,
    comments: {
      positive: ["Competitive pricing", "Reliable quality"],
      negative: ["Communication can be slow"],
    },
  },
  {
    id: "s3",
    name: "Jakarta Industrial Solutions",
    country: "Indonesia",
    contactPerson: "Budi Santoso",
    email: "budi@jakartaindustrial.id",
    phone: "+62-555-765-4321",
    rating: 3.8,
    onTimeDelivery: 85,
    comments: {
      positive: ["Flexible with custom orders", "Good pricing"],
      negative: ["Quality control issues", "Delivery delays"],
    },
  },
];

const samplePurchaseOrders: PurchaseOrder[] = [
  {
    id: "po1",
    poNumber: "PO-2025-001",
    projectId: "p1",
    supplierId: "s1",
    parts: [
      { id: "part1", name: "Control Panel", quantity: 50, status: "In Progress" },
      { id: "part2", name: "Sensor Array", quantity: 200, status: "Completed" },
    ],
    status: "Active",
    deadline: "2025-06-15",
    issuedDate: "2025-01-20",
  },
  {
    id: "po2",
    poNumber: "PO-2025-002",
    projectId: "p2",
    supplierId: "s2",
    parts: [
      { id: "part3", name: "Surgical Steel Components", quantity: 500, status: "Delayed" },
      { id: "part4", name: "Plastic Casings", quantity: 300, status: "In Progress" },
    ],
    status: "Delayed",
    deadline: "2025-05-10",
    issuedDate: "2024-12-05",
  },
  {
    id: "po3",
    poNumber: "PO-2025-003",
    projectId: "p3",
    supplierId: "s3",
    parts: [
      { id: "part5", name: "Transmission Gears", quantity: 100, status: "Completed" },
      { id: "part6", name: "Interior Panels", quantity: 50, status: "Completed" },
    ],
    status: "Completed",
    deadline: "2025-01-30",
    issuedDate: "2024-09-15",
  },
];

const sampleExternalLinks: ExternalLink[] = [
  {
    id: "l1",
    type: "Report",
    projectId: "p1",
    poId: "po1",
    title: "Weekly Progress Report - Factory Automation",
    url: "/reports/factory-automation-week12.pdf",
    date: "2025-03-15",
  },
  {
    id: "l2",
    type: "Photo",
    projectId: "p2",
    supplierId: "s2",
    title: "Healthcare Equipment Production Photos",
    url: "/photos/healthcare-production-mar2025.zip",
    date: "2025-03-10",
  },
  {
    id: "l3",
    type: "Tracking",
    projectId: "p3",
    poId: "po3",
    title: "Automotive Parts Shipment Tracking",
    url: "/tracking/auto-parts-shipment-feb2025.xlsx",
    date: "2025-02-20",
  },
];

export function DataProvider({ children }: { children: ReactNode }) {
  const [projects, setProjects] = useState<Project[]>(sampleProjects);
  const [clients, setClients] = useState<Client[]>(sampleClients);
  const [suppliers, setSuppliers] = useState<Supplier[]>(sampleSuppliers);
  const [purchaseOrders, setPurchaseOrders] = useState<PurchaseOrder[]>(samplePurchaseOrders);
  const [externalLinks, setExternalLinks] = useState<ExternalLink[]>(sampleExternalLinks);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  // CRUD operations for projects
  const addProject = (project: Omit<Project, "id">) => {
    const newProject = { ...project, id: `p${Date.now()}` };
    setProjects([...projects, newProject]);
  };

  const updateProject = (id: string, project: Partial<Project>) => {
    setProjects(projects.map(p => p.id === id ? { ...p, ...project } : p));
  };

  const deleteProject = (id: string) => {
    setProjects(projects.filter(p => p.id !== id));
  };

  // CRUD operations for clients
  const addClient = (client: Omit<Client, "id">) => {
    const newClient = { ...client, id: `c${Date.now()}` };
    setClients([...clients, newClient]);
  };

  const updateClient = (id: string, client: Partial<Client>) => {
    setClients(clients.map(c => c.id === id ? { ...c, ...client } : c));
  };

  const deleteClient = (id: string) => {
    setClients(clients.filter(c => c.id !== id));
  };

  // CRUD operations for suppliers
  const addSupplier = (supplier: Omit<Supplier, "id">) => {
    const newSupplier = {
      ...supplier,
      id: `s${Date.now()}`,
      comments: supplier.comments || { positive: [], negative: [] }
    };
    setSuppliers([...suppliers, newSupplier]);
  };

  const updateSupplier = (id: string, supplier: Partial<Supplier>) => {
    setSuppliers(suppliers.map(s => s.id === id ? { ...s, ...supplier } : s));
  };

  const deleteSupplier = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
  };

  // CRUD operations for purchase orders
  const addPurchaseOrder = (po: Omit<PurchaseOrder, "id">) => {
    const newPO = { ...po, id: `po${Date.now()}` };
    setPurchaseOrders([...purchaseOrders, newPO]);
  };

  const updatePurchaseOrder = (id: string, po: Partial<PurchaseOrder>) => {
    setPurchaseOrders(purchaseOrders.map(p => p.id === id ? { ...p, ...po } : p));
  };

  const deletePurchaseOrder = (id: string) => {
    setPurchaseOrders(purchaseOrders.filter(p => p.id !== id));
  };

  // CRUD operations for external links
  const addExternalLink = (link: Omit<ExternalLink, "id">) => {
    const newLink = { ...link, id: `l${Date.now()}` };
    setExternalLinks([...externalLinks, newLink]);
  };

  const updateExternalLink = (id: string, link: Partial<ExternalLink>) => {
    setExternalLinks(externalLinks.map(l => l.id === id ? { ...l, ...link } : l));
  };

  const deleteExternalLink = (id: string) => {
    setExternalLinks(externalLinks.filter(l => l.id !== id));
  };

  // Generate dummy data for demo purposes
  const generateDummyData = () => {
    setProjects(sampleProjects);
    setClients(sampleClients);
    setSuppliers(sampleSuppliers);
    setPurchaseOrders(samplePurchaseOrders);
    setExternalLinks(sampleExternalLinks);
    
    toast({
      title: "Demo data generated",
      description: "Sample data has been loaded successfully",
    });
  };

  // This function would sync data with Supabase in a real implementation
  const syncWithSupabase = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Simulate API call to Supabase
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      toast({
        title: "Data synchronized",
        description: "All changes have been saved to the database",
      });
    } catch (err) {
      setError("Failed to sync with database");
      toast({
        title: "Sync failed",
        description: "Could not connect to the database",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  // Clear all data
  const clearAllData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Clear all data arrays
      setProjects([]);
      setClients([]);
      setSuppliers([]);
      setPurchaseOrders([]);
      setExternalLinks([]);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Data cleared",
        description: "All data has been cleared successfully",
      });
    } catch (err) {
      setError("Failed to clear data");
      toast({
        title: "Clear failed",
        description: "Could not clear the data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DataContext.Provider value={{
      projects, clients, suppliers, purchaseOrders, externalLinks,
      isLoading, error,
      addProject, updateProject, deleteProject,
      addClient, updateClient, deleteClient,
      addSupplier, updateSupplier, deleteSupplier,
      addPurchaseOrder, updatePurchaseOrder, deletePurchaseOrder,
      addExternalLink, updateExternalLink, deleteExternalLink,
      generateDummyData, syncWithSupabase, clearAllData
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error("useData must be used within a DataProvider");
  }
  return context;
}
