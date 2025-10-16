import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DriverBottomNav from "@/components/DriverBottomNav";
import { Phone, MessageCircle, MapPin, Clock, CheckCircle, ArrowLeft, Search, Sparkles } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { AIRerouteButton } from "@/components/AIRerouteButton";

const Passengers = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");

  const passengers = [
    {
      id: 1,
      name: "Ahmed Al-Balushi",
      photo: "👨‍🎓",
      pickupLocation: "Al Khuwair Street, Building 5",
      pickupTime: "7:15 AM",
  dropoff: "Indian School",
      paymentStatus: "paid",
      specialInstructions: "Wait at gate 2",
      pickedUp: false,
      route: "Route 1 - Seeb to School",
    },
    {
      id: 2,
      name: "Fatima Al-Zaabi",
      photo: "👩‍🎓",
      pickupLocation: "Ruwi Commercial Center",
      pickupTime: "7:25 AM",
  dropoff: "Indian School",
      paymentStatus: "paid",
      specialInstructions: "",
      pickedUp: false,
      route: "Route 1 - Seeb to School",
    },
    {
      id: 3,
      name: "Mohammed Hassan",
      photo: "👨‍🎓",
      pickupLocation: "Qurum Plaza",
      pickupTime: "8:50 AM",
      dropoff: "Sultan Qaboos University",
      paymentStatus: "pending",
      specialInstructions: "Call upon arrival",
      pickedUp: false,
      route: "Route 2 - Qurum to University",
    },
  ];

  const [pickupStates, setPickupStates] = useState<Record<number, boolean>>(
    passengers.reduce((acc, p) => ({ ...acc, [p.id]: p.pickedUp }), {})
  );

  const handleMarkPickedUp = (id: number, name: string) => {
    setPickupStates(prev => ({ ...prev, [id]: !prev[id] }));
    if (!pickupStates[id]) {
      toast({
        title: "Passenger Picked Up ✓",
        description: `${name} marked as picked up`,
      });
    }
  };

  const filteredPassengers = passengers.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
              <h1 className="text-4xl font-bold">Passengers</h1>
              <p className="text-muted-foreground">Today's Pickup List</p>
            </div>
          </div>
        </div>

        {/* AI Reroute */}
        <div className="mb-6">
          <AIRerouteButton
            routeId="route-123"
            attendance={passengers.map(p => ({
              id: p.id.toString(),
              student_id: p.id.toString(),
              status: pickupStates[p.id] ? 'present' : (p.paymentStatus === 'paid' ? 'present' : 'absent'),
              pickup_location: p.pickupLocation
            }))}
          />
        </div>

        {/* Search */}
        <div className="mb-6 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search passengers..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Filters */}
        <Tabs defaultValue="all" className="mb-8">
          <TabsList className="grid w-full grid-cols-4 max-w-2xl">
            <TabsTrigger value="all">All</TabsTrigger>
            <TabsTrigger value="picked">Picked Up</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="route">By Route</TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Passenger List */}
        <div className="space-y-6">
          {filteredPassengers.map((passenger, index) => (
            <Card
              key={passenger.id}
              className="glass-card p-6 hover-scale animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex items-start gap-4">
                {/* Checkbox */}
                <div className="pt-1">
                  <Checkbox
                    checked={pickupStates[passenger.id]}
                    onCheckedChange={() =>
                      handleMarkPickedUp(passenger.id, passenger.name)
                    }
                  />
                </div>

                {/* Photo */}
                <div className="text-6xl">{passenger.photo}</div>

                {/* Details */}
                <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-2xl font-bold mb-1 flex items-center gap-3">
                      {passenger.name}
                      {pickupStates[passenger.id] && (
                        <Badge variant="default" className="text-sm">
                          ✓ Picked Up
                        </Badge>
                      )}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {passenger.route}
                    </p>
                  </div>
                  <Badge
                    variant={
                      passenger.paymentStatus === "paid" ? "default" : "secondary"
                    }
                  >
                    {passenger.paymentStatus === "paid" ? "✓ Paid" : "⚠️ Pending"}
                  </Badge>
                </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-primary mt-1" />
                      <div>
                        <p className="text-xs text-muted-foreground">Pickup</p>
                        <p className="font-semibold">{passenger.pickupLocation}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <Clock className="w-5 h-5 text-secondary mt-1" />
                      <div>
                        <p className="text-xs text-muted-foreground">Time</p>
                        <p className="font-semibold">{passenger.pickupTime}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-2">
                      <MapPin className="w-5 h-5 text-accent mt-1" />
                      <div>
                        <p className="text-xs text-muted-foreground">Drop-off</p>
                        <p className="font-semibold">{passenger.dropoff}</p>
                      </div>
                    </div>

                    {passenger.specialInstructions && (
                      <div className="flex items-start gap-2">
                        <CheckCircle className="w-5 h-5 text-yellow-500 mt-1" />
                        <div>
                          <p className="text-xs text-muted-foreground">Special</p>
                          <p className="font-semibold text-yellow-500">
                            {passenger.specialInstructions}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <Button variant="outline" size="sm">
                      <Phone className="mr-2 w-4 h-4" />
                      Call
                    </Button>
                    <Button variant="outline" size="sm">
                      <MessageCircle className="mr-2 w-4 h-4" />
                      Message
                    </Button>
                    {!pickupStates[passenger.id] && (
                      <Button
                        variant="hero"
                        size="sm"
                        onClick={() =>
                          handleMarkPickedUp(passenger.id, passenger.name)
                        }
                      >
                        <CheckCircle className="mr-2 w-4 h-4" />
                        Mark as Picked Up
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default Passengers;
