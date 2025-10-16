import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string | number;
  trend?: string;
  color?: "primary" | "secondary" | "accent";
}

export const StatsCard = ({ icon: Icon, label, value, trend, color = "primary" }: StatsCardProps) => {
  const glowClass = color === "primary" ? "glow-primary" : color === "secondary" ? "glow-cyan" : "glow-accent";
  const bgClass = color === "primary" ? "bg-primary/10" : color === "secondary" ? "bg-secondary/10" : "bg-accent/10";

  return (
    <Card className={`glass-card p-6 ${glowClass} hover-scale animate-fade-in`}>
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold">{value}</p>
          {trend && <p className="text-sm text-primary">↑ {trend}</p>}
        </div>
        <div className={`p-3 rounded-xl ${bgClass}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </Card>
  );
};
