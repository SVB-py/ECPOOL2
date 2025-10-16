import { useEffect, useRef, useState } from "react";
import { Upload, CheckCircle, AlertCircle, Home, User, Car, FileText, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Progress } from "@/components/ui/progress";
import { supabase } from "@/integrations/supabase/client";

const DriverVerification = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const verificationTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    licenseNumber: "",
    vehicleNumber: "",
    vehicleType: "",
    capacity: "",
  });

  const progress = (step / 3) * 100;

  useEffect(() => {
    return () => {
      if (verificationTimer.current) {
        clearTimeout(verificationTimer.current);
      }
    };
  }, []);

  const fastTrackVerification = async () => {
    const sessionStamp = new Date().toISOString();
    let finished = false;
    let fallbackTimer: ReturnType<typeof setTimeout> | null = null;

    const normalizeCapacity = Number.parseInt(formData.capacity, 10);
    const fallbackLicense = `DEMO-${String(Date.now()).slice(-6)}`;
    const fallbackVehicle = `OM-${String(Math.floor(Math.random() * 9000) + 1000)}`;
    const resolvedLicense = formData.licenseNumber || fallbackLicense;
    const resolvedVehicle = formData.vehicleNumber || fallbackVehicle;
    const resolvedModel = formData.vehicleType || "Eco Shuttle";
    const resolvedCapacity = Number.isNaN(normalizeCapacity) ? 8 : normalizeCapacity;

    sessionStorage.setItem("driver-demo-license", resolvedLicense);
    sessionStorage.setItem("driver-demo-vehicle", resolvedVehicle);
    sessionStorage.setItem("driver-demo-model", resolvedModel);
    sessionStorage.setItem("driver-demo-capacity", String(resolvedCapacity));

    const finalize = (message?: { title: string; description: string }) => {
      if (finished) {
        return;
      }
      finished = true;
      if (fallbackTimer) {
        clearTimeout(fallbackTimer);
      }
      if (message) {
        toast(message);
      }
      setIsSubmitting(false);
      navigate("/driver");
    };

    fallbackTimer = setTimeout(() => {
      sessionStorage.setItem("driver-demo-verified", "true");
      if (formData.fullName.trim()) {
        sessionStorage.setItem("driver-demo-name", formData.fullName.trim());
      }
      localStorage.setItem("userRole", "driver");
      finalize({
        title: "Demo verification complete",
        description: "Connectivity is taking a bit long, so we fast-tracked your demo access.",
      });
    }, 1200);

    try {
      const { data: authResult, error: authError } = await supabase.auth.getUser();

      if (authError) {
        throw authError;
      }

      const userId = authResult?.user?.id;

      if (!userId) {
        throw new Error("You're not signed in. Please log in as a driver again.");
      }

      const displayName = formData.fullName.trim() || authResult?.user?.email?.split("@")[0] || "Eco Driver";
      const contactEmail = formData.email || authResult?.user?.email || null;
      const contactPhone = formData.phone || null;

      const { error: profileError } = await supabase.from("profiles").upsert(
        {
          id: userId,
          name: displayName,
          email: contactEmail,
          phone: contactPhone,
          updated_at: sessionStamp,
        },
        { onConflict: "id" }
      );

      if (profileError) {
        throw profileError;
      }

      const upsertPayload = {
        user_id: userId,
        license_number: resolvedLicense,
        vehicle_number: resolvedVehicle,
        vehicle_model: resolvedModel,
        vehicle_capacity: resolvedCapacity,
        status: "verified",
        eco_credits: 320,
        total_trips: 0,
        total_earnings: 0,
        credits_earned_today: 0,
        updated_at: sessionStamp,
      };

      const { error } = await supabase.from("drivers").upsert(upsertPayload, { onConflict: "user_id" });

      if (error) {
        throw error;
      }

      const { error: roleError } = await supabase
        .from("user_roles")
        .upsert({ user_id: userId, role: "driver" }, { onConflict: "user_id" });

      if (roleError) {
        throw roleError;
      }

      localStorage.setItem("userRole", "driver");
      sessionStorage.setItem("driver-demo-verified", "true");
      sessionStorage.setItem("driver-demo-name", displayName);

      finalize({
        title: "Driver verified",
        description: "You're ready to offer eco rides. Let's go!",
      });
    } catch (error) {
      console.error("Fast-track verification failed", error);
      sessionStorage.setItem("driver-demo-verified", "true");
      if (formData.fullName.trim()) {
        sessionStorage.setItem("driver-demo-name", formData.fullName.trim());
      }
      localStorage.setItem("userRole", "driver");
      finalize({
        title: "Demo verification complete",
        description: "We couldn't sync with Supabase, but we'll keep the demo moving.",
      });
    }
  };

  const handleNext = () => {
    if (isSubmitting) {
      return;
    }

    if (step < 3) {
      setStep(step + 1);
      return;
    }

    setIsSubmitting(true);
    toast({
      title: "Verification Submitted",
      description: "Your application is under review. We usually respond within 24 hours...",
    });

    verificationTimer.current = setTimeout(() => {
      toast({
        title: "Turbo fast-tracking",
        description: "For the demo, we're verifying your documents instantly.",
      });
      fastTrackVerification();
    }, 450);
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="container mx-auto max-w-3xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8 animate-fade-in">
          <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
            <Home className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h1 className="text-4xl font-bold">Driver Verification</h1>
            <p className="text-muted-foreground">Complete your profile to start offering rides</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            <span className="text-sm text-muted-foreground">Step {step} of 3</span>
            <span className="text-sm font-semibold">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Form Card */}
        <Card className="glass-card p-8 animate-scale-in">
          {/* Step 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-full bg-primary/20">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <h2 className="text-2xl font-bold">Personal Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Full Name</label>
                  <Input
                    placeholder="Enter your full name"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Email Address</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Phone Number</label>
                  <Input
                    type="tel"
                    placeholder="+968 XXXX XXXX"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Step 2: License Information */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-full bg-secondary/20">
                  <FileText className="w-6 h-6 text-secondary" />
                </div>
                <h2 className="text-2xl font-bold">License Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Driving License Number</label>
                  <Input
                    placeholder="Enter license number"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Upload License (Front)</label>
                  <div className="glass-card p-8 border-2 border-dashed border-border rounded-lg text-center hover:border-primary transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      PNG, JPG up to 10MB
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Upload License (Back)</label>
                  <div className="glass-card p-8 border-2 border-dashed border-border rounded-lg text-center hover:border-primary transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload or drag and drop
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Step 3: Vehicle Information */}
          {step === 3 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-full bg-accent/20">
                  <Car className="w-6 h-6 text-accent" />
                </div>
                <h2 className="text-2xl font-bold">Vehicle Information</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Vehicle Number</label>
                  <Input
                    placeholder="e.g., ABC-1234"
                    value={formData.vehicleNumber}
                    onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Vehicle Type</label>
                  <Input
                    placeholder="e.g., Sedan, SUV, Van"
                    value={formData.vehicleType}
                    onChange={(e) => setFormData({ ...formData, vehicleType: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Seating Capacity</label>
                  <Input
                    type="number"
                    placeholder="e.g., 4, 7, 10"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-sm font-medium mb-2 block">Upload Vehicle Photo</label>
                  <div className="glass-card p-8 border-2 border-dashed border-border rounded-lg text-center hover:border-primary transition-colors cursor-pointer">
                    <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-3" />
                    <p className="text-sm text-muted-foreground">
                      Click to upload vehicle photo
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Verification Status Indicators */}
          <div className="mt-8 grid grid-cols-3 gap-4">
            <div className={`glass-card p-4 text-center ${step >= 1 ? 'border-primary' : ''}`}>
              {step > 1 ? (
                <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
              ) : (
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              )}
              <p className="text-sm font-medium">Personal Info</p>
            </div>
            <div className={`glass-card p-4 text-center ${step >= 2 ? 'border-primary' : ''}`}>
              {step > 2 ? (
                <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
              ) : (
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              )}
              <p className="text-sm font-medium">License</p>
            </div>
            <div className={`glass-card p-4 text-center ${step >= 3 ? 'border-primary' : ''}`}>
              {step > 3 ? (
                <CheckCircle className="w-8 h-8 text-primary mx-auto mb-2" />
              ) : (
                <AlertCircle className="w-8 h-8 text-muted-foreground mx-auto mb-2" />
              )}
              <p className="text-sm font-medium">Vehicle</p>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <Button
                variant="outline"
                size="lg"
                onClick={() => setStep(step - 1)}
                className="flex-1"
                disabled={isSubmitting}
              >
                Back
              </Button>
            )}
            <Button
              variant="hero"
              size="lg"
              onClick={handleNext}
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : step === 3 ? (
                "Submit for Verification"
              ) : (
                "Continue"
              )}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DriverVerification;
