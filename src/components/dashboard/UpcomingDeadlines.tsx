import { useData, PurchaseOrder } from "@/contexts/DataContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar } from "lucide-react";
import { Progress } from "@/components/ui/progress";

export function UpcomingDeadlines() {
  const { purchaseOrders, projects, suppliers } = useData();
  
  // Get active purchase orders with upcoming deadlines
  const upcomingDeadlines = purchaseOrders
    .filter(po => po.status === "Active")
    .sort((a, b) => {
      return new Date(a.deadline).getTime() - new Date(b.deadline).getTime();
    })
    .slice(0, 5);
  
  // Calculate days remaining
  const calculateDaysRemaining = (deadline: string): number => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };
  
  // Get project name
  const getProjectName = (projectId: string): string => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : "Unknown Project";
  };
  
  // Get supplier name
  const getSupplierName = (supplierId: string): string => {
    const supplier = suppliers.find(s => s.id === supplierId);
    return supplier ? supplier.name : "Unknown Supplier";
  };
  
  // Calculate PO progress
  const calculateProgress = (po: PurchaseOrder): number => {
    // If PO has progress property, use it
    if ('progress' in po && typeof po.progress === 'number') {
      return po.progress;
    }
    
    // Otherwise calculate based on parts status
    if (!po.parts.length) return 0;
    
    const completedParts = po.parts.filter(part => part.status === "Completed").length;
    return Math.round((completedParts / po.parts.length) * 100);
  };
  
  return (
    <Card className="card-hover">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium flex items-center">
          <Calendar className="h-5 w-5 mr-2 text-primary" />
          Upcoming PO Deadlines
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {upcomingDeadlines.length > 0 ? (
            upcomingDeadlines.map((po) => {
              const daysRemaining = calculateDaysRemaining(po.deadline);
              const progress = calculateProgress(po);
              
              return (
                <div key={po.id} className="flex flex-col border-b pb-3 animate-fade-in">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{po.poNumber}</p>
                      <p className="text-sm text-muted-foreground">{getProjectName(po.projectId)}</p>
                      <p className="text-xs text-muted-foreground">{getSupplierName(po.supplierId)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm">{new Date(po.deadline).toLocaleDateString()}</p>
                      <Badge className={
                        daysRemaining < 7 ? "bg-red-500" : 
                        daysRemaining < 14 ? "bg-amber-500" : 
                        "bg-green-500"
                      }>
                        {daysRemaining} days left
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="mt-2">
                    <div className="flex justify-between mb-1 text-xs">
                      <span>Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  {po.parts.length > 0 && (
                    <div className="mt-2">
                      <p className="text-xs font-medium mb-1">Parts:</p>
                      <div className="flex flex-wrap gap-1">
                        {po.parts.map((part) => (
                          <Badge 
                            key={part.id} 
                            variant="outline" 
                            className={
                              part.status === "Completed" ? "border-green-500 text-green-700" :
                              part.status === "Delayed" ? "border-red-500 text-red-700" :
                              part.status === "In Progress" ? "border-blue-500 text-blue-700" :
                              "border-gray-500 text-gray-700"
                            }
                          >
                            {part.name}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No upcoming deadlines
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
