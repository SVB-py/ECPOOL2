import { useNavigate } from "react-router-dom";
import { Bus, UserCheck, Leaf } from "lucide-react";
import { RoleCard } from "@/components/RoleCard";
import { Button } from "@/components/ui/button";

const RoleSelection = () => {
  const navigate = useNavigate();

  const handleRoleSelect = (role: string) => {
    localStorage.setItem("userRole", role);
    // Drivers go to dedicated driver login, students go to regular auth
    if (role === "driver") {
      navigate("/driver-login");
    } else {
      navigate("/auth", { state: { role } });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />
      
      <div className="relative z-10 container mx-auto px-4 py-12">
        {/* Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 rounded-2xl bg-gradient-primary animate-glow-pulse">
              <Bus className="w-10 h-10 text-foreground" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              ECpool360
            </h1>
          </div>
          <h2 className="text-3xl font-bold mb-3">Who are you today?</h2>
          <p className="text-xl text-muted-foreground">
            Select your ECpool identity
          </p>
        </div>

        {/* Role Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-12">
          <RoleCard
            icon={Bus}
            title="Driver"
            description="Offer and manage verified eco rides. Track your impact and earn rewards."
            onClick={() => handleRoleSelect("driver")}
          />
          <RoleCard
            icon={UserCheck}
            title="Student"
            description="Track and request safe eco-school rides. Monitor your CO₂ savings."
            onClick={() => handleRoleSelect("student")}
          />
        </div>

        {/* Footer */}
        <div className="text-center space-y-4 animate-fade-in">
          <div className="glass-card p-6 inline-block">
            <div className="flex items-center gap-3">
              <Leaf className="w-6 h-6 text-primary animate-glow-pulse" />
              <p className="text-muted-foreground">
                Join 2,500+ active users saving CO₂ together
              </p>
            </div>
          </div>
          
          <div>
            <span className="text-muted-foreground">Already have an account? </span>
            <Button
              variant="link"
              onClick={() => navigate("/auth")}
              className="text-primary"
            >
              Sign in
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
