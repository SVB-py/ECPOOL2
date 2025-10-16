import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DriverBottomNav from "@/components/DriverBottomNav";
import { MapComponent } from "@/components/Map/MapComponent";
import {
  Clock,
  MapPin,
  Users,
  DollarSign,
  Navigation,
  Calendar,
  ArrowLeft,
} from "lucide-react";

const Routes = () => {
  const navigate = useNavigate();
  const [selectedView, setSelectedView] = useState("today");

  const routes = [
    {
      id: 1,
  name: "Seeb - Indian School",
      time: "7:00 AM - 8:30 AM",
      start: "Seeb Bus Terminal",
  end: "Indian School",
      passengers: 18,
      earnings: 18.5,
      status: "completed" as const,
      distance: "12 km",
    },
    {
      id: 2,
      name: "Qurum - Sultan Qaboos University",
      time: "8:45 AM - 10:00 AM",
      start: "Qurum Commercial Area",
      end: "Sultan Qaboos University",
      passengers: 12,
      earnings: 15.0,
      status: "in-progress" as const,
      distance: "8 km",
    },
    {
      id: 3,
      name: "Al Khuwair - Muscat Grand Mall",
      time: "2:00 PM - 3:30 PM",
      start: "Al Khuwair",
      end: "Muscat Grand Mall",
      passengers: 15,
      earnings: 12.0,
      status: "upcoming" as const,
      distance: "10 km",
    },
  ];

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>;
      case "in-progress":
        return <Badge className="bg-blue-500">In Progress</Badge>;
      case "upcoming":
        return <Badge variant="secondary">Upcoming</Badge>;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/driver/dashboard")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold">My Routes</h1>
              <p className="text-muted-foreground">Today's Schedule - Oct 15, 2025</p>
            </div>
          </div>

          <Button variant="outline" onClick={() => navigate("/driver/navigation")}>
            <Calendar className="mr-2 w-4 h-4" />
            View Calendar
          </Button>
        </div>

        {/* Tabs */}
        <Tabs value={selectedView} onValueChange={setSelectedView} className="mb-8">
          <TabsList className="grid w-full grid-cols-3 max-w-md">
            <TabsTrigger value="today">Today</TabsTrigger>
            <TabsTrigger value="week">This Week</TabsTrigger>
            <TabsTrigger value="next">Next Week</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Route Cards */}
        <div className="space-y-6">
          {routes.map((route, index) => (
            <Card
              key={route.id}
              className="glass-card p-6 hover-scale animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold mb-2">{route.name}</h3>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    <span>{route.time}</span>
                  </div>
                </div>
                {getStatusBadge(route.status)}
              </div>

              {/* Route Details */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <MapPin className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Start</p>
                    <p className="font-semibold text-sm">{route.start}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-secondary/10 rounded-lg">
                    <MapPin className="w-5 h-5 text-secondary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">End</p>
                    <p className="font-semibold text-sm">{route.end}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-accent/10 rounded-lg">
                    <Users className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Passengers</p>
                    <p className="font-semibold text-sm">{route.passengers} students</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <div className="p-2 bg-yellow-500/10 rounded-lg">
                    <DollarSign className="w-5 h-5 text-yellow-500" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Earnings</p>
                    <p className="font-semibold text-sm">OMR {route.earnings}</p>
                  </div>
                </div>
              </div>

              {/* Mini Map Preview */}
              <div className="mb-4 rounded-xl overflow-hidden">
                <MapComponent
                  className="h-[200px] w-full"
                  markers={[
                    { lat: 23.588, lng: 58.3829, label: route.start, icon: "🚩", color: "green" },
                    { lat: 23.615, lng: 58.43, label: route.end, icon: "🏁", color: "red" },
                  ]}
                  route={[
                    [23.588, 58.3829],
                    [23.615, 58.43],
                  ]}
                />
              </div>

              {/* Actions */}
              <div className="flex gap-3">
                <Button
                  variant="hero"
                  className="flex-1"
                  onClick={() => navigate("/driver/navigation")}
                >
                  <Navigation className="mr-2 w-4 h-4" />
                  Start Navigation
                </Button>
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(`/driver/routes/${route.id}`)}
                >
                  View Full Route Map
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default Routes;
