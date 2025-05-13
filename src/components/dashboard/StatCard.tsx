
import { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/card";

interface StatCardProps {
  title: string;
  value: string | number;
  icon?: ReactNode;
  trend?: {
    value: number;
    positive: boolean;
  };
  className?: string;
}

export function StatCard({ title, value, icon, trend, className }: StatCardProps) {
  return (
    <Card className={cn("overflow-hidden transition-all hover:shadow-md card-hover", className)}>
      <CardContent className="p-6">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <h3 className="text-2xl font-bold mt-2 animate-fade-in">{value}</h3>
            
            {trend && (
              <div className="flex items-center mt-2">
                <span className={cn(
                  "text-xs font-medium",
                  trend.positive ? "text-green-500" : "text-red-500"
                )}>
                  {trend.positive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-xs text-muted-foreground ml-1">vs last month</span>
              </div>
            )}
          </div>
          
          {icon && (
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              {icon}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
