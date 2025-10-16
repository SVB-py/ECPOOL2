import { useState } from "react";
import { Bus, Leaf, Award, ArrowRight, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import ecoVisual from "@/assets/eco-visual.jpg";

const Onboarding = () => {
  const [step, setStep] = useState(0);
  const navigate = useNavigate();

  const slides = [
    {
      icon: Bus,
      title: "Ride Together",
      description: "Share rides safely in your community with verified drivers and students.",
      color: "primary",
    },
    {
      icon: Leaf,
      title: "Save Together",
      description: "Reduce your carbon footprint and contribute to a greener Oman with every shared ride.",
      color: "secondary",
    },
    {
      icon: Award,
      title: "Earn EcoCredits",
      description: "Track and redeem your green impact with rewards for sustainable choices.",
      color: "accent",
    },
  ];

  const currentSlide = slides[step];
  const Icon = currentSlide.icon;

  const handleNext = () => {
    if (step < slides.length - 1) {
      setStep(step + 1);
    } else {
      localStorage.setItem("hasSeenOnboarding", "true");
      navigate("/role-selection");
    }
  };

  const handleSkip = () => {
    localStorage.setItem("hasSeenOnboarding", "true");
    navigate("/role-selection");
  };

  const handleBack = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background */}
      <div 
        className="absolute inset-0 z-0 opacity-10"
        style={{
          backgroundImage: `url(${ecoVisual})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <Card className="glass-card p-12 max-w-2xl w-full text-center animate-scale-in relative z-10">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-12">
          <div className="p-4 rounded-2xl bg-gradient-primary animate-glow-pulse">
            <Bus className="w-10 h-10 text-foreground" />
          </div>
          <h1 className="text-4xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            ECpool360
          </h1>
        </div>

        {/* Slide Content */}
        <div className="mb-12 animate-fade-in" key={step}>
          <div className={`inline-flex p-8 rounded-full mb-8 ${
            currentSlide.color === 'primary' ? 'bg-primary/20' :
            currentSlide.color === 'secondary' ? 'bg-secondary/20' :
            'bg-accent/20'
          }`}>
            <Icon className={`w-20 h-20 ${
              currentSlide.color === 'primary' ? 'text-primary' :
              currentSlide.color === 'secondary' ? 'text-secondary' :
              'text-accent'
            }`} />
          </div>

          <h2 className="text-4xl font-bold mb-6">{currentSlide.title}</h2>
          <p className="text-xl text-muted-foreground max-w-lg mx-auto leading-relaxed">
            {currentSlide.description}
          </p>
        </div>

        {/* Progress Indicators */}
        <div className="flex justify-center gap-3 mb-12">
          {slides.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all ${
                index === step
                  ? 'w-12 bg-primary'
                  : index < step
                  ? 'w-8 bg-primary/50'
                  : 'w-8 bg-muted'
              }`}
            />
          ))}
        </div>

        {/* Navigation Buttons */}
        <div className="flex gap-4">
          {step > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={handleBack}
              className="flex-1"
            >
              <ArrowLeft className="mr-2" />
              Back
            </Button>
          )}
          <Button
            variant="hero"
            size="lg"
            onClick={handleNext}
            className="flex-1"
          >
            {step === slides.length - 1 ? "Get Started" : "Next"}
            <ArrowRight className="ml-2" />
          </Button>
        </div>

        {/* Skip Button */}
        <button
          onClick={handleSkip}
          className="mt-6 text-muted-foreground hover:text-foreground transition-colors"
        >
          Skip
        </button>
      </Card>
    </div>
  );
};

export default Onboarding;
