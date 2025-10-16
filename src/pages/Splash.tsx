import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bus, Leaf } from "lucide-react";

const Splash = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if user has seen onboarding
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    const userRole = localStorage.getItem("userRole");

    const timer = setTimeout(() => {
      if (!hasSeenOnboarding) {
        navigate("/onboarding");
      } else if (userRole) {
        navigate(`/${userRole}`);
      } else {
        navigate("/role-selection");
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20 animate-pulse" />
      
      {/* Content */}
      <div className="relative z-10 text-center space-y-8 animate-fade-in">
        {/* Logo Animation */}
        <div className="relative">
          <div className="p-8 rounded-3xl bg-gradient-primary animate-glow-pulse inline-block">
            <Bus className="w-20 h-20 text-foreground animate-bounce" />
          </div>
          <Leaf className="w-8 h-8 text-secondary absolute -top-2 -right-2 animate-spin" style={{ animationDuration: '3s' }} />
        </div>

        {/* Brand Name */}
        <div className="space-y-4">
          <h1 className="text-6xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent animate-scale-in">
            ECpool360
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground animate-slide-up">
            Ride Together. Save Together 🌿
          </p>
        </div>

        {/* Loading Animation */}
        <div className="space-y-3 animate-fade-in" style={{ animationDelay: '0.5s' }}>
          <div className="w-64 h-1 bg-muted rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-primary animate-slide-in-right" style={{ animationDuration: '2s' }} />
          </div>
          <p className="text-sm text-muted-foreground animate-pulse">
            Optimizing your eco routes... 🌱
          </p>
        </div>
      </div>
    </div>
  );
};

export default Splash;
