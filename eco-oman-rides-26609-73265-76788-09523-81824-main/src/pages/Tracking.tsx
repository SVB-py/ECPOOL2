import { MapPin, Navigation, Clock, Phone, MessageSquare, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

const Tracking = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      {/* Map Area - Interactive Map */}
      <div className="relative h-[60vh] bg-gradient-to-br from-muted to-background border-b border-border overflow-hidden">
        {/* Map Mockup with Animation */}
        <div className="absolute inset-0 bg-[url('https://api.mapbox.com/styles/v1/mapbox/dark-v10/static/58.3829,23.5861,11,0/600x400?access_token=pk.map')] bg-cover bg-center opacity-30"></div>
        
        {/* Driver Location Marker */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-pulse">
          <div className="relative">
            <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center shadow-glow animate-glow-pulse">
              <Navigation className="w-8 h-8 text-foreground" />
            </div>
            <div className="absolute inset-0 rounded-full bg-primary animate-ping opacity-75"></div>
          </div>
        </div>

        {/* Route Path */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          <path
            d="M 100,400 Q 200,300 300,250 T 500,150"
            stroke="hsl(var(--primary))"
            strokeWidth="3"
            fill="none"
            strokeDasharray="5,5"
            className="animate-pulse"
          />
        </svg>

        {/* Pickup Location */}
        <div className="absolute bottom-32 left-24 animate-bounce">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center shadow-glow">
              <MapPin className="w-6 h-6 text-foreground" />
            </div>
            <div className="mt-2 bg-card px-3 py-1 rounded-lg text-sm font-semibold">Seeb</div>
          </div>
        </div>

        {/* Destination */}
        <div className="absolute top-24 right-32 animate-bounce">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 bg-destructive rounded-full flex items-center justify-center shadow-glow">
              🏫
            </div>
            <div className="mt-2 bg-card px-3 py-1 rounded-lg text-sm font-semibold">Indian School</div>
          </div>
        </div>

        {/* Back Button */}
        <Button 
          variant="glass" 
          size="icon" 
          className="absolute top-6 left-6 z-10"
          onClick={() => navigate(-1)}
        >
          <Home className="w-5 h-5" />
        </Button>

        {/* ETA Card */}
        <Card className="glass-card absolute top-6 right-6 p-4 z-10 animate-slide-up">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Estimated Arrival</p>
              <p className="text-2xl font-bold">5 mins</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Driver Info Bottom Sheet */}
      <div className="container mx-auto max-w-4xl p-6">
        <Card className="glass-card p-6 animate-slide-up">
          {/* Driver Info */}
          <div className="flex items-center gap-4 mb-6">
            <div className="relative">
              <Avatar className="w-20 h-20 bg-gradient-primary">
                <div className="text-3xl">👨</div>
              </Avatar>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-primary rounded-full border-2 border-background animate-pulse"></div>
            </div>
            <div className="flex-1">
              <h3 className="text-2xl font-bold">Ahmed Al-Balushi</h3>
              <p className="text-sm text-muted-foreground">Toyota Camry • ABC-1234</p>
              <div className="flex items-center gap-1 mt-1">
                <span className="text-accent text-lg">★★★★★</span>
                <span className="text-sm text-muted-foreground ml-1">4.9 (156 trips)</span>
              </div>
              <div className="flex gap-2 mt-2">
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">✓ License Verified</span>
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">✓ Background Check</span>
              </div>
            </div>
            <div className="flex gap-2">
              <Button size="icon" variant="outline">
                <Phone className="w-5 h-5" />
              </Button>
              <Button size="icon" variant="outline">
                <MessageSquare className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Trip Details */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Pickup</p>
                  <p className="font-semibold">Seeb, Muscat</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <Navigation className="w-6 h-6 text-secondary" />
                <div>
                  <p className="text-sm text-muted-foreground">Destination</p>
                  <p className="font-semibold">Indian School</p>
                </div>
              </div>
            </div>
            <div className="glass-card p-4">
              <div className="flex items-center gap-3">
                <Clock className="w-6 h-6 text-accent" />
                <div>
                  <p className="text-sm text-muted-foreground">Time</p>
                  <p className="font-semibold">7:30 AM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status */}
          <div className="glass-card p-4 bg-primary/10 border-primary/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-primary rounded-full animate-pulse" />
                <p className="font-semibold">Driver is on the way</p>
              </div>
              <p className="text-sm text-muted-foreground">Updated just now</p>
            </div>
          </div>

          {/* Actions */}
          <div className="mt-6 flex gap-3">
            <Button variant="outline" className="flex-1">
              Share Trip
            </Button>
            <Button variant="destructive" className="flex-1">
              Cancel Trip
            </Button>
          </div>
        </Card>

        {/* Trip Progress */}
        <Card className="glass-card p-6 mt-6 animate-fade-in">
          <h3 className="text-lg font-bold mb-4">Trip Progress</h3>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                ✓
              </div>
              <div>
                <p className="font-semibold">Trip Confirmed</p>
                <p className="text-sm text-muted-foreground">7:15 AM</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-primary animate-pulse flex items-center justify-center">
                •
              </div>
              <div>
                <p className="font-semibold">Driver En Route</p>
                <p className="text-sm text-muted-foreground">7:20 AM - 5 mins away</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                •
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Trip In Progress</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
                •
              </div>
              <div>
                <p className="font-semibold text-muted-foreground">Arrived</p>
                <p className="text-sm text-muted-foreground">Pending</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Tracking;
