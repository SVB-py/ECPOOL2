import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import DriverBottomNav from "@/components/DriverBottomNav";
import { MapComponent } from "@/components/Map/MapComponent";
import {
  Bus,
  Calendar,
  FileText,
  Shield,
  Wrench,
  Fuel,
  ArrowLeft,
  CheckCircle,
  Upload,
} from "lucide-react";

const Vehicle = () => {
  const navigate = useNavigate();

  const documents = [
    {
      name: "Registration Certificate",
      expiry: "Dec 2025",
      status: "valid",
      icon: FileText,
    },
    {
      name: "Insurance Policy",
      expiry: "Feb 2026",
      status: "valid",
      icon: Shield,
    },
    {
      name: "Road Tax",
      expiry: "Jan 2026",
      status: "valid",
      icon: FileText,
    },
    {
      name: "Fitness Certificate",
      expiry: "Mar 2026",
      status: "valid",
      icon: CheckCircle,
    },
  ];

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
              <h1 className="text-4xl font-bold">My Vehicle</h1>
              <p className="text-muted-foreground">Manage your bus details</p>
            </div>
          </div>
        </div>

        {/* Vehicle Card */}
        <Card className="glass-card p-8 mb-8 animate-scale-in">
          <div className="flex items-center gap-6 mb-6">
            <div className="text-8xl">🚌</div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">Toyota Coaster 2020</h2>
              <div className="flex items-center gap-4 text-muted-foreground">
                <span className="flex items-center gap-2">
                  <Bus className="w-4 h-4" />
                  Bus Number: OM-1234
                </span>
                <Badge variant="default">30 Seats</Badge>
                <Badge variant="secondary">White</Badge>
              </div>
            </div>
          </div>

          {/* Mini Map */}
          <div className="mb-4 rounded-xl overflow-hidden">
            <MapComponent
              className="h-[300px] w-full"
              markers={[
                {
                  lat: 23.588,
                  lng: 58.3829,
                  label: "Current Location",
                  icon: "🚌",
                },
              ]}
            />
          </div>
        </Card>

        {/* Maintenance Status */}
        <Card className="glass-card p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Maintenance Status</h2>

          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <p className="font-semibold">Next Service Due</p>
                    <p className="text-sm text-muted-foreground">Oct 30, 2025</p>
                  </div>
                </div>
                <Badge variant="secondary">15 days</Badge>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Fuel className="w-5 h-5 text-green-500" />
                  <span className="font-semibold">Fuel Level</span>
                </div>
                <span className="text-green-500 font-bold">75%</span>
              </div>
              <Progress value={75} className="h-2" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg">
                <span className="text-sm font-semibold">Tire Pressure</span>
                <Badge variant="default" className="bg-green-500">
                  ✓ Normal
                </Badge>
              </div>

              <div className="flex items-center justify-between p-4 bg-secondary/5 rounded-lg">
                <span className="text-sm font-semibold">Warning Lights</span>
                <Badge variant="default" className="bg-green-500">
                  None
                </Badge>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg">
              <div className="flex items-center gap-2">
                <Wrench className="w-5 h-5 text-primary" />
                <span className="font-semibold">Last Service</span>
              </div>
              <span className="text-muted-foreground">Oct 1, 2025</span>
            </div>

            <Button variant="hero" size="lg" className="w-full">
              <Calendar className="mr-2 w-4 h-4" />
              Schedule Maintenance
            </Button>
          </div>
        </Card>

        {/* Vehicle Documents */}
        <Card className="glass-card p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold">Vehicle Documents</h2>
            <Button variant="outline">
              <Upload className="mr-2 w-4 h-4" />
              Upload Document
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc, index) => {
              const Icon = doc.icon;
              return (
                <div
                  key={index}
                  className="p-4 border border-border rounded-lg hover:bg-secondary/5 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <Icon className="w-5 h-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold mb-1">{doc.name}</p>
                        <p className="text-sm text-muted-foreground">
                          Expiry: {doc.expiry}
                        </p>
                      </div>
                    </div>
                    <Badge variant="default" className="bg-green-500">
                      ✓ Valid
                    </Badge>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default Vehicle;
