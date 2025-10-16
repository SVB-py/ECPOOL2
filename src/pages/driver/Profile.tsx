import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Avatar } from "@/components/ui/avatar";
import DriverBottomNav from "@/components/DriverBottomNav";
import { useToast } from "@/hooks/use-toast";
import {
  Camera,
  Star,
  Shield,
  Phone,
  Mail,
  MapPin,
  Calendar,
  FileText,
  Bell,
  Globe,
  Clock,
  ArrowLeft,
  Save,
  LogOut,
  Lock,
} from "lucide-react";

const Profile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "Ahmed Al-Balushi",
    phone: "+968 9123 4567",
    email: "ahmed@ecpool360.om",
    dob: "1985-01-15",
    address: "Al Khuwair, Muscat",
    emergencyContact: "+968 9876 5432",
    licenseNumber: "DL123456789",
    licenseIssue: "2018-01",
    licenseExpiry: "2028-01",
    experience: "7",
    languages: "Arabic, English, Hindi",
    notifications: true,
    language: "en",
    workingHours: "6:00 AM - 6:00 PM",
    available: true,
  });

  const handleSave = () => {
    toast({
      title: "Profile Updated!",
      description: "Your changes have been saved successfully",
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    navigate("/driver-login");
  };

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
              <h1 className="text-4xl font-bold">Driver Profile</h1>
              <p className="text-muted-foreground">Manage your account</p>
            </div>
          </div>

          <Button variant="hero" onClick={handleSave}>
            <Save className="mr-2 w-4 h-4" />
            Save Changes
          </Button>
        </div>

        {/* Profile Header */}
        <Card className="glass-card p-8 mb-8 animate-scale-in">
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
            <div className="relative">
              <Avatar className="w-24 h-24 bg-gradient-primary">
                <div className="text-5xl">👤</div>
              </Avatar>
              <Button
                size="icon"
                variant="glass"
                className="absolute -bottom-2 -right-2"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold mb-2">{formData.name}</h2>
              <div className="flex items-center gap-4 mb-2">
                <Badge variant="default" className="bg-green-500">
                  <Shield className="mr-1 w-3 h-3" />
                  Verified Driver
                </Badge>
                <div className="flex items-center gap-1">
                  <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold">4.8</span>
                  <span className="text-muted-foreground text-sm">(156 reviews)</span>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">
                1,245 trips completed • Member since January 2023
              </p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              Personal Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="phone"
                    className="pl-10"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    className="pl-10"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="dob">Date of Birth</Label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="dob"
                    type="date"
                    className="pl-10"
                    value={formData.dob}
                    onChange={(e) =>
                      setFormData({ ...formData, dob: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="address">Address</Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="address"
                    className="pl-10"
                    value={formData.address}
                    onChange={(e) =>
                      setFormData({ ...formData, address: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Driver License */}
        <Card className="glass-card p-6 mb-8">
          <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary" />
            Driver License
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label>License Number</Label>
              <Input value={formData.licenseNumber} readOnly />
              <Badge variant="default" className="bg-green-500">
                ✓ Verified
              </Badge>
            </div>

            <div className="space-y-2">
              <Label>License Type</Label>
              <Input value="Commercial" readOnly />
            </div>

            <div className="space-y-2">
              <Label>Issue Date</Label>
              <Input type="month" value={formData.licenseIssue} readOnly />
            </div>

            <div className="space-y-2">
              <Label>Expiry Date</Label>
              <Input type="month" value={formData.licenseExpiry} readOnly />
            </div>
          </div>

          <Button variant="outline" className="mt-4">
            <Camera className="mr-2 w-4 h-4" />
            Upload New License
          </Button>
        </Card>

        {/* Settings */}
        <Card className="glass-card p-6 mb-8">
          <h3 className="text-xl font-bold mb-6">Settings</h3>

          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Bell className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold">Notifications</p>
                  <p className="text-sm text-muted-foreground">
                    Receive ride updates and alerts
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.notifications}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, notifications: checked })
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Globe className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold">Language</p>
                  <p className="text-sm text-muted-foreground">
                    English / العربية
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Change
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold">Working Hours</p>
                  <p className="text-sm text-muted-foreground">
                    {formData.workingHours}
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Edit
              </Button>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-primary" />
                <div>
                  <p className="font-semibold">Availability</p>
                  <p className="text-sm text-muted-foreground">
                    Available for rides
                  </p>
                </div>
              </div>
              <Switch
                checked={formData.available}
                onCheckedChange={(checked) =>
                  setFormData({ ...formData, available: checked })
                }
              />
            </div>
          </div>
        </Card>

        {/* Actions */}
        <div className="space-y-4">
          <Button variant="outline" className="w-full" size="lg">
            <Lock className="mr-2 w-4 h-4" />
            Change Password
          </Button>

          <Button
            variant="destructive"
            className="w-full"
            size="lg"
            onClick={handleLogout}
          >
            <LogOut className="mr-2 w-4 h-4" />
            Logout
          </Button>
        </div>
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default Profile;
