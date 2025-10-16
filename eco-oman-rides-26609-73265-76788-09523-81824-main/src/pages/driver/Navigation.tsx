import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapComponent } from "@/components/Map/MapComponent";
import { useToast } from "@/hooks/use-toast";
import {
  Navigation as NavigationIcon,
  MapPin,
  Clock,
  AlertTriangle,
  ArrowLeft,
  Volume2,
  VolumeX,
  CheckCircle,
  XCircle,
} from "lucide-react";

const Navigation = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [voiceGuidance, setVoiceGuidance] = useState(true);
  const [currentStop, setCurrentStop] = useState(1);

  const stops = [
    {
      id: 1,
      name: "Al Khuwair Plaza",
      passenger: "Ahmed",
      distance: "500m",
      eta: "2 mins",
      status: "current",
    },
    {
      id: 2,
      name: "Ruwi Junction",
      passenger: "Sarah",
      distance: "2.1km",
      eta: "8 mins",
      status: "upcoming",
    },
    {
      id: 3,
      name: "Qurum Center",
      passenger: "Hassan",
      distance: "3.5km",
      eta: "12 mins",
      status: "upcoming",
    },
  ];

  const handleArrived = () => {
    toast({
      title: "Arrived at Pickup",
      description: "Marked as arrived at Al Khuwair Plaza",
    });
    setCurrentStop(currentStop + 1);
  };

  const handleSkip = () => {
    toast({
      title: "Pickup Skipped",
      description: "Moving to next location",
      variant: "destructive",
    });
    setCurrentStop(currentStop + 1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="absolute top-4 left-4 right-4 z-10 flex items-center justify-between">
        <Button
          variant="glass"
          size="icon"
          onClick={() => navigate("/driver/dashboard")}
        >
          <ArrowLeft className="w-5 h-5" />
        </Button>

        <div className="flex gap-2">
          <Button
            variant="glass"
            size="icon"
            onClick={() => setVoiceGuidance(!voiceGuidance)}
          >
            {voiceGuidance ? (
              <Volume2 className="w-5 h-5" />
            ) : (
              <VolumeX className="w-5 h-5" />
            )}
          </Button>
          <Button variant="glass">
            <AlertTriangle className="mr-2 w-4 h-4" />
            Report Traffic
          </Button>
        </div>
      </div>

      {/* Full Screen Map */}
      <MapComponent
        className="h-screen w-full"
        markers={[
          {
            lat: 23.588,
            lng: 58.3829,
            label: "You are here",
            icon: "🚌",
            color: "blue",
          },
          {
            lat: 23.595,
            lng: 58.395,
            label: "Pickup 1 - Ahmed",
            icon: "1️⃣",
            color: "green",
          },
          {
            lat: 23.602,
            lng: 58.41,
            label: "Pickup 2 - Sarah",
            icon: "2️⃣",
            color: "orange",
          },
          {
            lat: 23.61,
            lng: 58.425,
            label: "Pickup 3 - Hassan",
            icon: "3️⃣",
            color: "gray",
          },
        ]}
        route={[
          [23.588, 58.3829],
          [23.595, 58.395],
          [23.602, 58.41],
          [23.61, 58.425],
        ]}
      />

      {/* Bottom Panel */}
      <div className="absolute bottom-0 left-0 right-0 z-10 p-4">
        <Card className="glass-card p-6">
          {/* Turn by Turn */}
          <div className="mb-4 text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <NavigationIcon className="w-6 h-6 text-primary" />
              <span className="text-2xl font-bold">Turn right in 200m</span>
            </div>
            <p className="text-muted-foreground">onto Al Khuwair Street</p>
          </div>

          {/* Current Pickup */}
          <div className="mb-4 p-4 bg-primary/10 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">Next Pickup</span>
              <Badge className="bg-blue-500">In Progress</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xl font-bold">Ahmed - Al Khuwair</p>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-sm flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    500m
                  </span>
                  <span className="text-sm flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    2 mins
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={handleSkip}>
                  <XCircle className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="hero" onClick={handleArrived}>
                  <CheckCircle className="mr-2 w-4 h-4" />
                  Arrived
                </Button>
              </div>
            </div>
          </div>

          {/* Upcoming Stops */}
          <div className="space-y-2">
            {stops.slice(1).map((stop) => (
              <div
                key={stop.id}
                className="flex items-center justify-between p-3 bg-secondary/5 rounded-lg"
              >
                <div>
                  <p className="font-semibold">{stop.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {stop.passenger}
                  </p>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground">
                  <span>{stop.distance}</span>
                  <span>{stop.eta}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Navigation;
