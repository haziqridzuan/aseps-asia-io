
import { v4 as uuidv4 } from 'uuid';

// Define the data state type
export interface DataState {
  projects: any[];
  clients: any[];
  suppliers: any[];
  purchaseOrders: any[];
  externalLinks: any[];
}

// Function to create dummy data
export function createDummyData(): DataState {
  const clients = [
    {
      id: uuidv4(),
      name: "Tech Solutions Inc.",
      contactPerson: "John Smith",
      email: "john@techsolutions.com",
      phone: "+1 555-123-4567",
      location: "San Francisco, CA"
    },
    {
      id: uuidv4(),
      name: "Global Industries",
      contactPerson: "Sarah Johnson",
      email: "sarah@globalindustries.com",
      phone: "+1 555-234-5678",
      location: "New York, NY"
    },
    {
      id: uuidv4(),
      name: "Innovative Systems",
      contactPerson: "Michael Chen",
      email: "michael@innovative.com",
      phone: "+1 555-345-6789",
      location: "Austin, TX"
    }
  ];

  const suppliers = [
    {
      id: uuidv4(),
      name: "Parts & Components Co.",
      country: "China",
      contactPerson: "Li Wei",
      email: "liwei@partsco.com",
      phone: "+86 10 1234 5678",
      rating: 4.5,
      onTimeDelivery: 95,
      location: "Shenzhen",
      positiveComments: ["Fast delivery", "Good quality"],
      negativeComments: []
    },
    {
      id: uuidv4(),
      name: "Electronics Supply Ltd.",
      country: "Taiwan",
      contactPerson: "David Chen",
      email: "david@electronicsupply.com",
      phone: "+886 2 2345 6789",
      rating: 4.2,
      onTimeDelivery: 92,
      location: "Taipei",
      positiveComments: ["Responsive", "Competitive prices"],
      negativeComments: ["Occasional delays"]
    },
    {
      id: uuidv4(),
      name: "Quality Manufacturing",
      country: "Vietnam",
      contactPerson: "Nguyen Van",
      email: "nguyen@qualitymfg.com",
      phone: "+84 28 3456 7890",
      rating: 4.0,
      onTimeDelivery: 88,
      location: "Ho Chi Minh City",
      positiveComments: ["Good value"],
      negativeComments: ["Communication issues"]
    }
  ];

  const projects = [
    {
      id: uuidv4(),
      name: "Project Alpha",
      clientId: clients[0].id,
      location: "California",
      status: "In Progress",
      progress: 45,
      startDate: "2023-01-15",
      endDate: "2023-06-30",
      projectManager: "Alex Thompson",
      description: "Development of next-gen product line"
    },
    {
      id: uuidv4(),
      name: "Project Beta",
      clientId: clients[1].id,
      location: "New York",
      status: "Pending",
      progress: 10,
      startDate: "2023-03-01",
      endDate: "2023-09-15",
      projectManager: "Jessica Kim",
      description: "Supply chain optimization"
    },
    {
      id: uuidv4(),
      name: "Project Gamma",
      clientId: clients[2].id,
      location: "Texas",
      status: "Completed",
      progress: 100,
      startDate: "2022-11-01",
      endDate: "2023-02-28",
      projectManager: "Robert Chen",
      description: "Software integration project"
    },
    {
      id: uuidv4(),
      name: "Project Delta",
      clientId: clients[0].id,
      location: "Washington",
      status: "Delayed",
      progress: 35,
      startDate: "2022-12-15",
      endDate: "2023-05-30",
      projectManager: "Mark Wilson",
      description: "Hardware component redesign"
    }
  ];

  const purchaseOrders = [
    {
      id: uuidv4(),
      poNumber: "PO-2023-001",
      projectId: projects[0].id,
      supplierId: suppliers[0].id,
      status: "Active",
      deadline: "2023-04-15",
      issuedDate: "2023-01-20",
      progress: 60,
      parts: [
        {
          id: uuidv4(),
          name: "Circuit Board A2",
          quantity: 500,
          status: "In Progress"
        },
        {
          id: uuidv4(),
          name: "Connector Type B",
          quantity: 1000,
          status: "Completed"
        }
      ]
    },
    {
      id: uuidv4(),
      poNumber: "PO-2023-002",
      projectId: projects[1].id,
      supplierId: suppliers[1].id,
      status: "Active",
      deadline: "2023-05-30",
      issuedDate: "2023-03-10",
      progress: 30,
      parts: [
        {
          id: uuidv4(),
          name: "Power Supply Unit",
          quantity: 200,
          status: "In Progress"
        }
      ]
    },
    {
      id: uuidv4(),
      poNumber: "PO-2023-003",
      projectId: projects[2].id,
      supplierId: suppliers[2].id,
      status: "Completed",
      deadline: "2023-02-15",
      issuedDate: "2022-12-05",
      progress: 100,
      parts: [
        {
          id: uuidv4(),
          name: "LCD Display 7\"",
          quantity: 300,
          status: "Completed"
        },
        {
          id: uuidv4(),
          name: "Touch Panel",
          quantity: 300,
          status: "Completed"
        }
      ]
    },
    {
      id: uuidv4(),
      poNumber: "PO-2023-004",
      projectId: projects[3].id,
      supplierId: suppliers[0].id,
      status: "Delayed",
      deadline: "2023-03-30",
      issuedDate: "2023-01-05",
      progress: 40,
      parts: [
        {
          id: uuidv4(),
          name: "Custom Chassis",
          quantity: 150,
          status: "Delayed"
        },
        {
          id: uuidv4(),
          name: "Cooling System",
          quantity: 150,
          status: "In Progress"
        }
      ]
    }
  ];

  const externalLinks = [
    {
      id: uuidv4(),
      type: "Report",
      projectId: projects[0].id,
      supplierId: suppliers[0].id,
      title: "Quality Inspection Report",
      url: "https://example.com/reports/qa-report-123",
      date: "2023-02-15"
    },
    {
      id: uuidv4(),
      type: "Photo",
      projectId: projects[0].id,
      title: "Production Line Setup",
      url: "https://example.com/photos/prod-line-456",
      date: "2023-01-25"
    },
    {
      id: uuidv4(),
      type: "Tracking",
      projectId: projects[1].id,
      supplierId: suppliers[1].id,
      title: "Shipment Tracking",
      url: "https://example.com/tracking/shipment-789",
      date: "2023-03-20"
    },
    {
      id: uuidv4(),
      type: "Report",
      projectId: projects[2].id,
      title: "Final Project Report",
      url: "https://example.com/reports/final-234",
      date: "2023-02-25"
    },
    {
      id: uuidv4(),
      type: "Photo",
      projectId: projects[3].id,
      supplierId: suppliers[0].id,
      title: "Component Photos",
      url: "https://example.com/photos/components-567",
      date: "2023-01-15"
    }
  ];

  return {
    projects,
    clients,
    suppliers,
    purchaseOrders,
    externalLinks
  };
}
