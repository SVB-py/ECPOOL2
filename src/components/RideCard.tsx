import { Bus, MapPin, Clock, Users, Leaf } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

interface RideCardProps {
  driverName?: string;
  from: string;
  to: string;
  time: string;
  seats: number;
  co2Saved: number;
  status?: "pending" | "active" | "completed";
  onAction?: () => void;
  actionLabel?: string;
}

export const RideCard = ({
  driverName,
  from,
  to,
  time,
  seats,
  co2Saved,
  status = "pending",
  onAction,
  actionLabel = "Request Ride",
}: RideCardProps) => {
  const statusColors = {
    pending: "bg-accent/20 text-accent border-accent/30",
    active: "bg-primary/20 text-primary border-primary/30",
    completed: "bg-secondary/20 text-secondary border-secondary/30",
  };

  return (
    <Card className="glass-card p-6 hover-scale animate-slide-up">
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-full bg-primary/20">
              <Bus className="w-6 h-6 text-primary" />
            </div>
            {driverName && (
              <div>
                <p className="font-semibold">{driverName}</p>
                <p className="text-sm text-muted-foreground">Verified Driver ✓</p>
              </div>
            )}
          </div>
          <Badge className={statusColors[status]}>{status}</Badge>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-primary" />
            <span className="text-muted-foreground">From:</span>
            <span className="font-medium">{from}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <MapPin className="w-4 h-4 text-secondary" />
            <span className="text-muted-foreground">To:</span>
            <span className="font-medium">{to}</span>
          </div>
        </div>

        <div className="flex items-center gap-4 pt-2 border-t border-border">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span>{seats} seats</span>
          </div>
          <div className="flex items-center gap-2 text-sm ml-auto">
            <Leaf className="w-4 h-4 text-primary" />
            <span className="text-primary font-semibold">{co2Saved} kg CO₂</span>
          </div>
        </div>

        {onAction && (
          <Button variant="hero" className="w-full" onClick={onAction}>
            {actionLabel}
          </Button>
        )}
      </div>
    </Card>
  );
};
