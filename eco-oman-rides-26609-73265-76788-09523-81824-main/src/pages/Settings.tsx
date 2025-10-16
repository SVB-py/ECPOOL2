import { useNavigate } from "react-router-dom";
import { ArrowLeft, Bell, Globe, Moon, LogOut, Shield, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleLogout = () => {
    localStorage.clear();
    toast({
      title: "Logged Out",
      description: "You have been successfully logged out",
    });
    navigate("/");
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold">Settings</h1>
            <p className="text-muted-foreground">Manage your preferences</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Notifications */}
          <Card className="glass-card p-6 animate-slide-up">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
              <Bell className="w-5 h-5 text-primary" />
              Notifications
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="ride-alerts">Ride Alerts</Label>
                  <p className="text-sm text-muted-foreground">Get notified about ride updates</p>
                </div>
                <Switch id="ride-alerts" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="eco-updates">Eco Updates</Label>
                  <p className="text-sm text-muted-foreground">Receive CO₂ savings updates</p>
                </div>
                <Switch id="eco-updates" defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="promotions">Promotions</Label>
                  <p className="text-sm text-muted-foreground">Get offers and rewards</p>
                </div>
                <Switch id="promotions" />
              </div>
            </div>
          </Card>

          {/* Appearance */}
          <Card className="glass-card p-6 animate-slide-up">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
              <Moon className="w-5 h-5 text-secondary" />
              Appearance
            </h3>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="dark-mode">Dark Mode</Label>
                  <p className="text-sm text-muted-foreground">Use dark theme</p>
                </div>
                <Switch id="dark-mode" defaultChecked />
              </div>
            </div>
          </Card>

          {/* Language */}
          <Card className="glass-card p-6 animate-slide-up">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-accent" />
              Language
            </h3>
            <div className="flex items-center justify-between">
              <div>
                <Label>Preferred Language</Label>
                <p className="text-sm text-muted-foreground">English (EN)</p>
              </div>
              <Button variant="outline" size="sm">
                Change
              </Button>
            </div>
          </Card>

          {/* Privacy & Security */}
          <Card className="glass-card p-6 animate-slide-up">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
              <Shield className="w-5 h-5 text-primary" />
              Privacy & Security
            </h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Change Password
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Privacy Policy
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Terms of Service
              </Button>
            </div>
          </Card>

          {/* Help & Support */}
          <Card className="glass-card p-6 animate-slide-up">
            <h3 className="text-xl font-bold flex items-center gap-2 mb-4">
              <HelpCircle className="w-5 h-5 text-secondary" />
              Help & Support
            </h3>
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                Help Center
              </Button>
              <Button variant="outline" className="w-full justify-start">
                Contact Support
              </Button>
              <Button variant="outline" className="w-full justify-start">
                About ECpool360
              </Button>
            </div>
          </Card>

          {/* Logout */}
          <Card className="glass-card p-6 bg-destructive/10 border-destructive/20 animate-scale-in">
            <Button
              variant="destructive"
              className="w-full"
              onClick={handleLogout}
            >
              <LogOut className="mr-2" />
              Logout
            </Button>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Settings;
