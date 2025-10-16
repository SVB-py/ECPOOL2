import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Shield, ArrowLeft, Bus, Loader2, UserPlus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const DriverLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [pendingEmail, setPendingEmail] = useState<string | null>(null);
  const [isResending, setIsResending] = useState(false);

  const redirectAfterAuth = async (userId: string) => {
    try {
      const { data: driverRecord } = await supabase
        .from("drivers")
        .select("status")
        .eq("user_id", userId)
        .maybeSingle();

      sessionStorage.removeItem("driver-demo-verified");
      sessionStorage.removeItem("driver-demo-name");

      if (driverRecord?.status === "verified") {
        navigate("/driver");
      } else {
        toast({
          title: "Next Step",
          description: "Finish your vehicle verification to unlock routes.",
        });
        navigate("/driver-verification");
      }
    } catch (error) {
      console.error("Failed to resolve driver redirect", error);
      navigate("/driver");
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (isLoading) {
      return;
    }

    if (!email || !password) {
      toast({
        title: "Missing details",
        description: "Email and password are required",
        variant: "destructive",
      });
      return;
    }

    if (isRegistering && password !== confirmPassword) {
      toast({
        title: "Passwords do not match",
        description: "Please make sure both password fields match",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      if (isRegistering) {
        const displayName = fullName.trim() || email.split("@")[0];
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName.trim() || email.split("@")[0],
              phone: phone.trim() || undefined,
            },
          },
        });

        if (signUpError) {
          throw signUpError;
        }

        const newUser = signUpData?.user ?? null;
        const activeSession = signUpData?.session ?? null;

        sessionStorage.setItem("driver-demo-name", displayName);

        if (newUser && activeSession) {
          localStorage.setItem("userRole", "driver");
          setPendingEmail(null);
          toast({
            title: "Account ready",
            description: "Let's finish your driver verification.",
          });
          await redirectAfterAuth(newUser.id);
          return;
        }

        setPendingEmail(email);
        toast({
          title: "Confirm your email",
          description: "We sent a verification link. Please confirm before signing in.",
        });
        setIsRegistering(false);
        return;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        const message = error.message?.toLowerCase?.() ?? "";
        if (message.includes("email not confirmed")) {
          setPendingEmail(email);
          toast({
            title: "Email not confirmed",
            description: "Check your inbox for the verification email before signing in.",
            variant: "destructive",
          });
          return;
        }

        throw error;
      }

      const signedInUser = data.user ?? (await supabase.auth.getUser()).data.user;

      if (!signedInUser) {
        throw new Error("We couldn't find your driver account.");
      }

      localStorage.setItem("userRole", "driver");
      setPendingEmail(null);

      toast({
        title: "Login Successful!",
        description: "Welcome back, driver!",
      });

      await redirectAfterAuth(signedInUser.id);
    } catch (error: any) {
      console.error("Driver auth failed", error);
      toast({
        title: "Authentication failed",
        description: error.message || "Unable to sign you in right now",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendVerification = async () => {
    if (!pendingEmail) {
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: "signup",
        email: pendingEmail,
        options: {
          emailRedirectTo: `${window.location.origin}/driver-login`,
        },
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Verification email sent",
        description: `We resent the confirmation link to ${pendingEmail}.`,
      });
    } catch (error: any) {
      console.error("Resend verification failed", error);
      toast({
        title: "Could not resend",
        description: error.message || "Try again in a moment.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 w-4 h-4" />
          Back to Home
        </Button>

        {/* Login Card */}
        <Card className="glass-card p-8 animate-fade-in">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-primary/10 rounded-full mb-4">
              <Bus className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-3xl font-bold mb-2">Driver Portal</h1>
            <p className="text-muted-foreground">
              Login to manage your routes and earnings
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleAuth} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">Driver Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="driver@ecpool360.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="Enter your full name"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="e.g., +968 9XXXXXXX"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  disabled={isLoading}
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            {isRegistering && (
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm your password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
            )}

            {!isRegistering && (
              <div className="flex justify-end text-sm">
                <button
                  type="button"
                  className="text-primary hover:underline"
                  onClick={() => {
                    toast({
                      title: "Reset link sent",
                      description: "Check your email to reset your password.",
                    });
                  }}
                >
                  Forgot password?
                </button>
              </div>
            )}

            <Button type="submit" className="w-full" variant="hero" size="lg" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                  {isRegistering ? "Creating driver account" : "Signing in"}
                </>
              ) : (
                <>
                  {isRegistering ? <UserPlus className="mr-2 w-4 h-4" /> : <Shield className="mr-2 w-4 h-4" />}
                  {isRegistering ? "Create driver account" : "Login as driver"}
                </>
              )}
            </Button>

            <div className="text-center text-sm text-muted-foreground">
              <button
                type="button"
                className="text-primary hover:underline font-medium"
                onClick={() => setIsRegistering(!isRegistering)}
                disabled={isLoading}
              >
                {isRegistering ? "Have an account? Sign in" : "Need an account? Become a driver"}
              </button>
            </div>

            <div className="text-center text-sm text-muted-foreground">
              <Link to="/auth" className="text-primary hover:underline">
                Switch to Student Portal
              </Link>
            </div>

            {pendingEmail && (
              <div className="text-center text-sm text-muted-foreground space-y-2">
                <p>
                  Waiting for <span className="font-medium">{pendingEmail}</span> to be verified.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={isResending}
                  onClick={handleResendVerification}
                >
                  {isResending ? "Sending..." : "Resend verification email"}
                </Button>
              </div>
            )}
          </form>

          {/* Verification Badge Notice */}
          <div className="mt-6 p-4 bg-primary/10 rounded-lg">
            <p className="text-sm text-center">
              <Shield className="inline w-4 h-4 mr-1" />
              All drivers are verified for safety
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DriverLogin;
