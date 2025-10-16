import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import DriverBottomNav from "@/components/DriverBottomNav";
import { useToast } from "@/hooks/use-toast";
import {
  AlertTriangle,
  Phone,
  MapPin,
  Share2,
  AlertCircle,
  Wrench,
  Users,
  FileText,
  ArrowLeft,
} from "lucide-react";

const Emergency = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [sosActive, setSosActive] = useState(false);

  const handleSOS = () => {
    setSosActive(true);
    toast({
      title: "🚨 SOS ACTIVATED",
      description: "Emergency services and admin have been notified!",
      variant: "destructive",
    });
  };

  const emergencyContacts = [
    { name: "Police", number: "9999" },
    { name: "Ambulance", number: "9999" },
    { name: "Fire", number: "9999" },
    { name: "Support Hotline", number: "+968 2456 7890" },
  ];

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto max-w-4xl p-6">
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
              <h1 className="text-4xl font-bold">Emergency & Safety</h1>
              <p className="text-muted-foreground">Get help when you need it</p>
            </div>
          </div>
        </div>

        {/* SOS Button */}
        <Card
          className={`glass-card p-12 mb-8 text-center animate-scale-in ${
            sosActive ? "border-red-500 bg-red-500/10" : ""
          }`}
        >
          <Button
            size="lg"
            variant={sosActive ? "destructive" : "outline"}
            className={`w-64 h-64 rounded-full text-2xl font-bold ${
              !sosActive && "hover:bg-red-500 hover:text-white"
            }`}
            onClick={handleSOS}
            disabled={sosActive}
          >
            {sosActive ? (
              <div className="animate-pulse">
                <AlertTriangle className="w-24 h-24 mb-4" />
                <p>SOS ACTIVE</p>
              </div>
            ) : (
              <div>
                <AlertTriangle className="w-24 h-24 mb-4" />
                <p>TAP FOR SOS</p>
              </div>
            )}
          </Button>
          <p className="text-sm text-muted-foreground mt-6">
            Tap to alert emergency services
          </p>
        </Card>

        {/* Emergency Contacts */}
        <Card className="glass-card p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Emergency Contacts</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {emergencyContacts.map((contact, index) => (
              <Button
                key={index}
                variant="outline"
                size="lg"
                className="h-auto p-6 justify-start"
                onClick={() => {
                  toast({
                    title: `Calling ${contact.name}`,
                    description: contact.number,
                  });
                }}
              >
                <Phone className="w-6 h-6 mr-4 text-red-500" />
                <div className="text-left">
                  <p className="font-bold text-lg">{contact.name}</p>
                  <p className="text-muted-foreground">{contact.number}</p>
                </div>
              </Button>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="glass-card p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Button variant="outline" size="lg" className="h-24">
              <div className="flex flex-col items-center gap-2">
                <Share2 className="w-8 h-8" />
                <span>Share Live Location</span>
              </div>
            </Button>

            <Button variant="outline" size="lg" className="h-24">
              <div className="flex flex-col items-center gap-2">
                <Phone className="w-8 h-8" />
                <span>Call Support Team</span>
              </div>
            </Button>

            <Button variant="outline" size="lg" className="h-24">
              <div className="flex flex-col items-center gap-2">
                <FileText className="w-8 h-8" />
                <span>Report Incident</span>
              </div>
            </Button>

            <Button variant="outline" size="lg" className="h-24">
              <div className="flex flex-col items-center gap-2">
                <AlertCircle className="w-8 h-8" />
                <span>Medical Emergency</span>
              </div>
            </Button>
          </div>
        </Card>

        {/* Incident Reporting */}
        <Card className="glass-card p-6 mb-8">
          <h2 className="text-2xl font-bold mb-6">Report Incident</h2>

          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Incident Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accident">Accident</SelectItem>
                  <SelectItem value="breakdown">Vehicle Breakdown</SelectItem>
                  <SelectItem value="passenger">Passenger Issue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Describe what happened..."
                className="min-h-[100px]"
              />
            </div>

            <div className="p-4 bg-secondary/10 rounded-lg flex items-start gap-3">
              <MapPin className="w-5 h-5 text-primary mt-1" />
              <div>
                <p className="font-semibold">Current Location</p>
                <p className="text-sm text-muted-foreground">
                  Al Khuwair Street, Muscat
                </p>
                <p className="text-xs text-muted-foreground">
                  GPS: 23.5880°N, 58.3829°E
                </p>
              </div>
            </div>

            <Button variant="hero" size="lg" className="w-full">
              <AlertTriangle className="mr-2 w-4 h-4" />
              Submit Report
            </Button>
          </div>
        </Card>

        {/* Safety Tips */}
        <Card className="glass-card p-6">
          <h2 className="text-2xl font-bold mb-6">Safety Tips</h2>
          <ul className="space-y-3 text-muted-foreground">
            <li className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <span>Always verify passenger identity before starting trip</span>
            </li>
            <li className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <span>Keep doors locked when alone in the vehicle</span>
            </li>
            <li className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <span>Report suspicious activity immediately</span>
            </li>
            <li className="flex items-start gap-3">
              <AlertCircle className="w-5 h-5 text-primary mt-0.5" />
              <span>Keep emergency contacts readily available</span>
            </li>
          </ul>
        </Card>
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default Emergency;
