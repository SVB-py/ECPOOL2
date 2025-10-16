import { useNavigate } from "react-router-dom";
import { GraduationCap, Car, Leaf } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useState } from "react";

const ModeSelection = () => {
  const navigate = useNavigate();
  const [selectedMode, setSelectedMode] = useState<string | null>(null);

  const handleModeSelect = (mode: string) => {
    setSelectedMode(mode);
    localStorage.setItem("userMode", mode);
    // Navigate to appropriate role selection based on mode
    setTimeout(() => {
      navigate("/role-selection", { state: { mode } });
    }, 300);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />

      <div className="relative z-10 container mx-auto px-4 py-12 min-h-screen flex flex-col items-center justify-center">
        {/* Logo Header */}
        <div className="text-center mb-12 animate-fade-in">
          <div className="flex items-center justify-center gap-3 mb-6">
            <div className="p-4 rounded-full bg-gradient-primary animate-glow-pulse">
              <Leaf className="w-10 h-10 text-foreground" />
            </div>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Choose Your Mode</h1>
          <p className="text-xl text-muted-foreground">
            Select how you want to use ECpool360
          </p>
        </div>

        {/* Mode Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl w-full mb-12">
          {/* School Mode */}
          <Card
            className={`glass-card p-8 hover-scale cursor-pointer group transition-all duration-300 ${
              selectedMode === "school" ? "ring-2 ring-primary shadow-glow" : ""
            }`}
            onClick={() => handleModeSelect("school")}
          >
            <div className="flex flex-col items-center text-center gap-6 h-full">
              <div className="p-6 rounded-full bg-gradient-primary animate-glow-pulse">
                <GraduationCap className="w-16 h-16 text-foreground" />
              </div>

              <div className="space-y-3 flex-1">
                <h2 className="text-3xl font-bold">School Mode</h2>
                <p className="text-muted-foreground text-lg">
                  Safe verified rides for students with parents and trusted drivers
                </p>

                {/* Feature List */}
                <div className="mt-6 space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-sm">✓</span>
                    </div>
                    <span className="text-sm">Parent-verified drivers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-sm">✓</span>
                    </div>
                    <span className="text-sm">Real-time tracking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-sm">✓</span>
                    </div>
                    <span className="text-sm">Women-only ride option</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
                      <span className="text-primary text-sm">✓</span>
                    </div>
                    <span className="text-sm">School route optimization</span>
                  </div>
                </div>
              </div>

              <Button variant="hero" className="w-full" size="lg">
                Continue as School User
              </Button>
            </div>
          </Card>

          {/* Community Mode */}
          <Card
            className={`glass-card p-8 hover-scale cursor-pointer group transition-all duration-300 ${
              selectedMode === "community" ? "ring-2 ring-secondary shadow-cyan-glow" : ""
            }`}
            onClick={() => handleModeSelect("community")}
          >
            <div className="flex flex-col items-center text-center gap-6 h-full">
              <div className="p-6 rounded-full bg-secondary/30 animate-glow-pulse">
                <Car className="w-16 h-16 text-secondary" />
              </div>

              <div className="space-y-3 flex-1">
                <h2 className="text-3xl font-bold">Community Mode</h2>
                <p className="text-muted-foreground text-lg">
                  Eco-friendly rides for work, errands, and daily commutes
                </p>

                {/* Feature List */}
                <div className="mt-6 space-y-3 text-left">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                      <span className="text-secondary text-sm">✓</span>
                    </div>
                    <span className="text-sm">Verified community drivers</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                      <span className="text-secondary text-sm">✓</span>
                    </div>
                    <span className="text-sm">Flexible routes</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                      <span className="text-secondary text-sm">✓</span>
                    </div>
                    <span className="text-sm">CO₂ tracking</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-secondary/20 flex items-center justify-center">
                      <span className="text-secondary text-sm">✓</span>
                    </div>
                    <span className="text-sm">EcoCredit rewards</span>
                  </div>
                </div>
              </div>

              <Button variant="secondary" className="w-full" size="lg">
                Continue as Community User
              </Button>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default ModeSelection;
