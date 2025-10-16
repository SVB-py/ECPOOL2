import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface RoleCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  onClick: () => void;
}

export const RoleCard = ({ icon: Icon, title, description, onClick }: RoleCardProps) => {
  return (
    <Card className="glass-card p-8 hover-scale cursor-pointer group" onClick={onClick}>
      <div className="flex flex-col items-center text-center gap-6">
        <div className="p-6 rounded-full bg-gradient-primary animate-glow-pulse">
          <Icon className="w-12 h-12 text-foreground" />
        </div>
        <div className="space-y-2">
          <h3 className="text-2xl font-bold">{title}</h3>
          <p className="text-muted-foreground">{description}</p>
        </div>
        <Button variant="hero" className="w-full" size="lg">
          Continue as {title}
        </Button>
      </div>
    </Card>
  );
};
