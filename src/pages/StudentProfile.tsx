import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Camera, Save, User, Phone, Mail, School, GraduationCap, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Avatar } from "@/components/ui/avatar";

const StudentProfile = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: "Sara Al-Rashid",
    email: "sara@ecpool360.om",
    mobile: "+968 9234 5678",
  school: "Indian School",
    grade: "Grade 10",
    parentContact: "+968 9100 0000",
    emergencyContact: "+968 9200 0000",
    totalRides: 32,
  });

  const handleSave = () => {
    toast({
      title: "Profile Updated",
      description: "Your information has been saved successfully 🌿",
    });
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-4xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/student")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-3xl font-bold">Student Profile</h1>
              <p className="text-muted-foreground">Manage your account information</p>
            </div>
          </div>
          <Button variant="hero" onClick={handleSave}>
            <Save className="mr-2" />
            Save Changes
          </Button>
        </div>

        {/* Profile Card */}
        <Card className="glass-card p-8 mb-6 animate-slide-up">
          {/* Avatar Section */}
          <div className="flex items-center gap-6 mb-8 pb-8 border-b border-border">
            <div className="relative">
              <Avatar className="w-24 h-24 bg-gradient-primary">
                <div className="text-4xl">👧</div>
              </Avatar>
              <Button
                size="icon"
                variant="glass"
                className="absolute -bottom-2 -right-2"
              >
                <Camera className="w-4 h-4" />
              </Button>
            </div>
            <div>
              <h2 className="text-2xl font-bold">{formData.name}</h2>
              <p className="text-primary font-semibold">{formData.school}</p>
              <p className="text-sm text-muted-foreground mt-1">
                {formData.totalRides} Total Rides • {formData.grade}
              </p>
            </div>
          </div>

          {/* Personal Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Personal Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                />
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
                    onChange={(e) => handleChange("email", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mobile">Mobile Number</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="mobile"
                    type="tel"
                    className="pl-10"
                    value={formData.mobile}
                    onChange={(e) => handleChange("mobile", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="grade">Grade</Label>
                <div className="relative">
                  <GraduationCap className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="grade"
                    className="pl-10"
                    value={formData.grade}
                    onChange={(e) => handleChange("grade", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* School Information */}
          <div className="space-y-6 mt-8 pt-8 border-t border-border">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <School className="w-5 h-5 text-secondary" />
              School Information
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="school">School Name</Label>
                <Input
                  id="school"
                  value={formData.school}
                  onChange={(e) => handleChange("school", e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Emergency Contacts */}
          <div className="space-y-6 mt-8 pt-8 border-t border-border">
            <h3 className="text-xl font-bold flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-accent" />
              Emergency Contacts
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="parent">Parent Contact</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="parent"
                    type="tel"
                    className="pl-10"
                    value={formData.parentContact}
                    onChange={(e) => handleChange("parentContact", e.target.value)}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="emergency">Emergency Contact</Label>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="emergency"
                    type="tel"
                    className="pl-10"
                    value={formData.emergencyContact}
                    onChange={(e) => handleChange("emergencyContact", e.target.value)}
                  />
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Safety Status */}
        <Card className="glass-card p-6 bg-secondary/10 border-secondary/20 animate-scale-in">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold mb-1">Account Status</h3>
              <p className="text-sm text-muted-foreground">
                Your profile is complete and verified ✓
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentProfile;
