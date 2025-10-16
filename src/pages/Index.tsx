import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bus, Leaf, ArrowRight, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import heroBus from "@/assets/hero-bus.jpg";
import ecoVisual from "@/assets/eco-visual.jpg";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if this is first visit
    const hasSeenOnboarding = localStorage.getItem("hasSeenOnboarding");
    if (!hasSeenOnboarding) {
      navigate("/splash");
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 z-0"
          style={{
            backgroundImage: `url(${heroBus})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'brightness(0.3)',
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background z-0" />

        {/* Content */}
        <div className="relative z-10 container mx-auto px-4 text-center animate-fade-in">
          <div className="space-y-8 max-w-4xl mx-auto">
            {/* Logo/Brand */}
            <div className="flex items-center justify-center gap-3 mb-8">
              <div className="p-4 rounded-2xl bg-gradient-primary animate-glow-pulse">
                <Bus className="w-12 h-12 text-foreground" />
              </div>
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                ECpool360
              </h1>
            </div>

            {/* Tagline */}
            <h2 className="text-2xl md:text-4xl font-semibold text-foreground">
              Eco-Smart School Ride Sharing in Oman
            </h2>
            
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              Join a verified community-based eco-ride system. Share rides safely, 
              reduce your carbon footprint, and earn rewards for every journey.
            </p>

            {/* Key Features */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
              <div className="glass-card p-6 hover-scale animate-slide-up">
                <Bus className="w-10 h-10 text-primary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Ride Together</h3>
                <p className="text-sm text-muted-foreground">
                  Share rides safely in your community
                </p>
              </div>
              <div className="glass-card p-6 hover-scale animate-slide-up" style={{ animationDelay: '0.1s' }}>
                <Leaf className="w-10 h-10 text-secondary mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Save Together</h3>
                <p className="text-sm text-muted-foreground">
                  Reduce your carbon footprint
                </p>
              </div>
              <div className="glass-card p-6 hover-scale animate-slide-up" style={{ animationDelay: '0.2s' }}>
                <UserCheck className="w-10 h-10 text-accent mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">Earn EcoCredits</h3>
                <p className="text-sm text-muted-foreground">
                  Track and redeem your green impact
                </p>
              </div>
            </div>

            {/* CTA */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-12">
              <Button 
                variant="hero" 
                size="lg" 
                className="text-lg"
                onClick={() => navigate("/role-selection")}
              >
                Get Started
                <ArrowRight className="ml-2" />
              </Button>
              <Button 
                variant="glass" 
                size="lg" 
                className="text-lg"
                onClick={() => {
                  document.getElementById('eco-impact')?.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Learn More
              </Button>
            </div>

            {/* Sign In Links */}
            <div className="mt-6 text-center space-y-2">
              <div>
                <span className="text-muted-foreground">Student? </span>
                <button
                  onClick={() => navigate("/auth")}
                  className="text-primary hover:underline font-medium"
                >
                  Sign in here
                </button>
              </div>
              <div>
                <span className="text-muted-foreground">Driver? </span>
                <button
                  onClick={() => navigate("/driver-login")}
                  className="text-secondary hover:underline font-medium"
                >
                  Driver Portal
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Eco Impact Section */}
      <section id="eco-impact" className="py-20 px-4 relative overflow-hidden">
        <div 
          className="absolute inset-0 z-0 opacity-20"
          style={{
            backgroundImage: `url(${ecoVisual})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        
        <div className="relative z-10 container mx-auto max-w-4xl text-center">
          <div className="glass-card p-12 animate-scale-in">
            <Leaf className="w-16 h-16 text-primary mx-auto mb-6 animate-glow-pulse" />
            <h2 className="text-4xl font-bold mb-4">Making a Real Impact</h2>
            <p className="text-xl text-muted-foreground mb-8">
              Every shared ride contributes to a greener Oman. Track your environmental 
              impact and earn rewards for your sustainable choices.
            </p>
            <div className="grid grid-cols-3 gap-8 mt-12">
              <div>
                <p className="text-4xl font-bold text-primary mb-2">5,000+</p>
                <p className="text-sm text-muted-foreground">Rides Shared</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-secondary mb-2">12T</p>
                <p className="text-sm text-muted-foreground">CO₂ Saved</p>
              </div>
              <div>
                <p className="text-4xl font-bold text-accent mb-2">2,500+</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Index;
