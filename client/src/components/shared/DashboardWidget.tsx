import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

export interface DashboardWidgetProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  iconColor?: "primary" | "secondary" | "destructive" | "amber" | "purple";
}

export function DashboardWidget({ title, value, icon: Icon, trend, className, iconColor = "primary" }: DashboardWidgetProps) {
  const colorMap = {
    primary: "text-primary bg-primary/10",
    secondary: "text-secondary bg-secondary/10",
    destructive: "text-destructive bg-destructive/10",
    amber: "text-amber-500 bg-amber-500/10",
    purple: "text-purple-500 bg-purple-500/10",
  };

  return (
    <Card className={cn("hover:shadow-md transition-shadow border-slate-200", className)}>
      <CardContent className="p-6 flex flex-col justify-between h-full">
        <div className="flex items-center justify-between mb-4">
          <div className={cn("p-3 rounded-xl", colorMap[iconColor])}>
            <Icon className="h-6 w-6" />
          </div>
          {trend && (
            <div className={cn(
              "flex items-center text-sm font-medium px-2.5 py-1 rounded-full",
              trend.isPositive ? "text-green-700 bg-green-100" : "text-red-700 bg-red-100"
            )}>
              {trend.isPositive ? "+" : "-"}{Math.abs(trend.value)}%
            </div>
          )}
        </div>
        <div>
          <h3 className="text-3xl font-bold tracking-tight text-slate-900 mb-1">{value}</h3>
          <p className="text-sm font-medium text-slate-500">{title}</p>
        </div>
      </CardContent>
    </Card>
  );
}