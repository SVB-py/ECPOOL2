import type { FormEvent } from "react";
import { useEffect, useMemo, useState } from "react";
import { MapPin, Calendar, Clock, Users, Plus, Sparkles, DollarSign, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import { fetchRideSearchOptions, searchAvailableRides } from "@/lib/requestRideService";
import type { Tables } from "@/integrations/supabase/types";
import { addDemoRoute } from "@/lib/demoRouteStore";

const defaultDate = new Date().toISOString().split("T")[0];

function buildDemoDriver(userId: string): Tables<"drivers"> {
  const license = sessionStorage.getItem("driver-demo-license") || "DEMO-000000";
  const vehicleNumber = sessionStorage.getItem("driver-demo-vehicle") || "OM-0000";
  const vehicleModel = sessionStorage.getItem("driver-demo-model") || "Eco Shuttle";
  const capacity = Number.parseInt(sessionStorage.getItem("driver-demo-capacity") ?? "8", 10) || 8;
  const nowIso = new Date().toISOString();

  return {
    id: `demo-${userId}`,
    user_id: userId,
    license_number: license,
    vehicle_number: vehicleNumber,
    vehicle_model: vehicleModel,
    vehicle_capacity: capacity,
    rating: null,
    total_trips: 0,
    total_earnings: 0,
    status: "verified",
    created_at: nowIso,
    updated_at: nowIso,
    eco_credits: 320,
    credits_earned_today: 0,
  };
}

function combineDateTime(date: string, time: string): string {
  const iso = new Date(`${date}T${time || "00:00"}`);
  if (Number.isNaN(iso.getTime())) {
    return new Date().toISOString();
  }
  return iso.toISOString();
}

function generateRecurringSchedule(baseIso: string, count: number): string[] {
  const instances: string[] = [];
  let cursor = new Date(baseIso);
  while (instances.length < count) {
    cursor = new Date(cursor.getTime() + 24 * 60 * 60 * 1000);
    const day = cursor.getDay();
    if (day === 5 || day === 6) {
      continue;
    }
    instances.push(cursor.toISOString());
  }
  return instances;
}

const OfferRide = () => {
  const { toast } = useToast();
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState(defaultDate);
  const [time, setTime] = useState("07:00");
  const [seats, setSeats] = useState(4);
  const [pricePerSeat, setPricePerSeat] = useState(2);
  const [womenOnly, setWomenOnly] = useState(false);
  const [recurring, setRecurring] = useState(false);
  const [showAIRoute, setShowAIRoute] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiSummary, setAiSummary] = useState<{ potentialRiders: number; estimatedEarnings: number; co2Saved: number; timeImpact: string } | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [driver, setDriver] = useState<Tables<"drivers"> | null>(null);
  const [isLoadingDriver, setIsLoadingDriver] = useState(true);
  const [driverError, setDriverError] = useState<string | null>(null);
  const [startOptions, setStartOptions] = useState<string[]>([]);
  const [endOptions, setEndOptions] = useState<string[]>([]);

  useEffect(() => {
    let active = true;

    const loadDriverProfile = async () => {
      const { data, error } = await supabase.auth.getUser();

      if (!active) {
        return;
      }

      const demoVerified = sessionStorage.getItem("driver-demo-verified") === "true";

      if (error || !data?.user) {
        console.error("Driver auth lookup failed", error);
        if (demoVerified) {
          setDriver(buildDemoDriver(data?.user?.id ?? "demo-user"));
          setDriverError(null);
        } else {
          setDriverError("Unable to verify your session. Please sign in again.");
        }
        setIsLoadingDriver(false);
        return;
      }

      const { data: driverRecord, error: driverLookupError } = await supabase
        .from("drivers")
        .select("*")
        .eq("user_id", data.user.id)
        .maybeSingle();

      if (!active) {
        return;
      }

      if (driverLookupError) {
        console.error("Driver profile lookup failed", driverLookupError);
        if (demoVerified) {
          setDriver(buildDemoDriver(data.user.id));
          setDriverError(null);
        } else {
          setDriverError("Could not load your driver profile. Please try again.");
        }
      } else if (!driverRecord) {
        if (demoVerified) {
          setDriver(buildDemoDriver(data.user.id));
          setDriverError(null);
        } else {
          setDriverError("Driver profile not found. Complete verification before offering rides.");
        }
      } else {
        setDriver(driverRecord as Tables<"drivers">);
        setDriverError(null);
      }

      setIsLoadingDriver(false);
    };

    loadDriverProfile();

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;

    const loadOptions = async () => {
      try {
        const options = await fetchRideSearchOptions();
        if (!active) {
          return;
        }
        setStartOptions(options.startLocations);
        setEndOptions(options.endLocations);
      } catch (error) {
        console.error("Failed to load ride options", error);
      }
    };

    loadOptions();

    return () => {
      active = false;
    };
  }, []);

  const totalPotentialEarnings = useMemo(() => seats * pricePerSeat, [seats, pricePerSeat]);
  const formDisabled = isLoadingDriver || Boolean(driverError);

  const publishRide = async () => {
    if (!driver) {
      toast({
        title: "Driver profile required",
        description: driverError ?? "Complete driver verification to offer rides.",
        variant: "destructive",
      });
      return;
    }

    if (driver.id.startsWith("demo-")) {
      setIsPublishing(true);
      const startTimeIso = combineDateTime(date, time);
      const routeId = `demo-route-${Date.now()}`;
      const driverName = sessionStorage.getItem("driver-demo-name") || "Demo Driver";

      addDemoRoute({
        id: routeId,
        driverId: driver.id,
        driverName,
        startLocation: from.trim() || "Eco Hub",
        endLocation: to.trim() || "Knowledge Oasis",
        startTimeIso,
        seats,
        createdAt: new Date().toISOString(),
      });

      await new Promise((resolve) => setTimeout(resolve, 400));
      toast({
        title: "Ride published (demo)",
        description: "Your demo ride is visible in this session.",
      });
      setShowAIRoute(false);
      setAiSummary(null);
      setFrom("");
      setTo("");
      setIsPublishing(false);
      return;
    }

    if (!from.trim() || !to.trim()) {
      toast({
        title: "Missing route details",
        description: "Enter both pickup and drop-off locations before publishing.",
        variant: "destructive",
      });
      return;
    }

  setIsPublishing(true);

    const routeNameBase = `${from.trim()} → ${to.trim()}`;
    const routeName = womenOnly ? `${routeNameBase} (Women-only)` : routeNameBase;
    const startTimeIso = combineDateTime(date, time);
    const basePayload = {
      driver_id: driver.id,
      start_location: from.trim(),
      end_location: to.trim(),
      start_time: startTimeIso,
      passenger_count: seats,
      route_name: routeName,
      estimated_earnings: totalPotentialEarnings,
      status: "pending" as string | null,
    };

    try {
      const { error } = await supabase.from("routes").insert({
        driver_id: basePayload.driver_id,
        start_location: basePayload.start_location,
        end_location: basePayload.end_location,
        start_time: basePayload.start_time,
        passenger_count: basePayload.passenger_count,
        route_name: basePayload.route_name,
        estimated_earnings: basePayload.estimated_earnings,
        status: basePayload.status,
      });

      if (error) {
        throw error;
      }

      if (recurring) {
        const schedule = generateRecurringSchedule(startTimeIso, 4);
        if (schedule.length > 0) {
          const recurringPayload = schedule.map((iso) => ({
            driver_id: basePayload.driver_id,
            start_location: basePayload.start_location,
            end_location: basePayload.end_location,
            start_time: iso,
            passenger_count: basePayload.passenger_count,
            route_name: basePayload.route_name,
            estimated_earnings: basePayload.estimated_earnings,
            status: basePayload.status,
          }));

          const { error: recurringError } = await supabase.from("routes").insert(recurringPayload);
          if (recurringError) {
            throw recurringError;
          }
        }
      }

      toast({
        title: "Ride published",
        description: recurring
          ? "Your ride and recurring schedule are now visible to students."
          : "Your ride is now visible to students.",
      });

      setShowAIRoute(false);
      setAiSummary(null);
    } catch (error) {
      console.error("Publish ride failed", error);
      toast({
        title: "Could not publish ride",
        description: "Please review the details and try again.",
        variant: "destructive",
      });
    } finally {
      setIsPublishing(false);
    }
  };

  const handlePublish = async (event?: FormEvent) => {
    event?.preventDefault();
    await publishRide();
  };

  const handleAiRoute = async () => {
    if (!from.trim() || !to.trim()) {
      toast({
        title: "Add route details",
        description: "Enter both pickup and drop-off locations to analyse the route.",
        variant: "destructive",
      });
      return;
    }

    setShowAIRoute(true);
    setAiLoading(true);

    try {
      const matches = await searchAvailableRides({
        from: from.trim(),
        to: to.trim(),
        date,
        time,
        schoolRoutesOnly: true,
      });

      const potentialRiders = matches.reduce((acc, ride) => acc + Math.min(ride.availableSeats, seats), 0);
      const estimatedEarnings = pricePerSeat * Math.min(potentialRiders, seats);
      const co2Saved = Number((potentialRiders * 0.45).toFixed(1));
      const timeImpact = potentialRiders > seats ? "~7 mins" : "~5 mins";

      setAiSummary({ potentialRiders, estimatedEarnings, co2Saved, timeImpact });
    } catch (error) {
      console.error("AI route suggestion failed", error);
      toast({
        title: "Could not analyse route",
        description: "Please try again after adjusting your details.",
        variant: "destructive",
      });
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="bg-gradient-primary p-6">
        <h1 className="text-3xl font-bold text-foreground mb-2">Offer a Ride</h1>
        <p className="text-muted-foreground">Share your commute and earn EcoCredits</p>
      </div>

      <div className="container mx-auto px-4 -mt-8 space-y-6">
        {isLoadingDriver && !driverError && (
          <Card className="glass-card p-4 flex items-center gap-3 text-sm text-muted-foreground">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
            <p>Loading your driver profile...</p>
          </Card>
        )}

        {driverError && (
          <Card className="glass-card p-4 flex items-start gap-3 text-sm text-muted-foreground">
            <AlertCircle className="w-5 h-5 text-destructive" />
            <div>
              <p className="font-medium text-destructive">Driver profile issue</p>
              <p>{driverError}</p>
            </div>
          </Card>
        )}

        <Card className="glass-card p-6 space-y-4">
          <form className="space-y-4" onSubmit={handlePublish}>
            <h2 className="text-xl font-bold">Ride Details</h2>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-primary" />
                From
              </label>
              <Input
                value={from}
                onChange={(event) => setFrom(event.target.value)}
                placeholder="Enter pickup location"
                className="bg-background/50"
                list="offer-from-locations"
                disabled={formDisabled}
              />
              <datalist id="offer-from-locations">
                {startOptions.map((location) => (
                  <option key={location} value={location} />
                ))}
              </datalist>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <MapPin className="w-4 h-4 text-secondary" />
                To
              </label>
              <Input
                value={to}
                onChange={(event) => setTo(event.target.value)}
                placeholder="Enter destination"
                className="bg-background/50"
                list="offer-to-locations"
                disabled={formDisabled}
              />
              <datalist id="offer-to-locations">
                {endOptions.map((location) => (
                  <option key={location} value={location} />
                ))}
              </datalist>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-accent" />
                  Date
                </label>
                <Input
                  type="date"
                  value={date}
                  onChange={(event) => setDate(event.target.value)}
                  className="bg-background/50"
                  disabled={formDisabled}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium flex items-center gap-2">
                  <Clock className="w-4 h-4 text-accent" />
                  Time
                </label>
                <Input
                  type="time"
                  value={time}
                  onChange={(event) => setTime(event.target.value)}
                  className="bg-background/50"
                  disabled={formDisabled}
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />
                Available Seats
              </label>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setSeats((prev) => Math.max(1, prev - 1))}
                  disabled={formDisabled}
                >
                  −
                </Button>
                <span className="text-2xl font-bold w-12 text-center">{seats}</span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => setSeats((prev) => Math.min(7, prev + 1))}
                  disabled={formDisabled}
                >
                  +
                </Button>
                <span className="text-sm text-muted-foreground ml-auto">
                  {Array.from({ length: seats }).map((_, index) => (
                    <span key={index}>💺</span>
                  ))}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-secondary/10 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-2xl">👩</div>
                <div>
                  <div className="font-medium">Women-only Ride</div>
                  <div className="text-sm text-muted-foreground">Only female passengers</div>
                </div>
              </div>
              <Switch checked={womenOnly} onCheckedChange={setWomenOnly} disabled={formDisabled} />
            </div>

            <div className="flex items-center justify-between p-4 bg-primary/10 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="text-2xl">🔄</div>
                <div>
                  <div className="font-medium">Recurring Ride</div>
                  <div className="text-sm text-muted-foreground">Repeat on school days</div>
                </div>
              </div>
              <Switch checked={recurring} onCheckedChange={setRecurring} disabled={formDisabled} />
            </div>

            <Button
              type="submit"
              variant="hero"
              size="lg"
              className="w-full"
              disabled={formDisabled || isPublishing}
            >
              {isPublishing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
              {isPublishing ? "Publishing..." : "Publish Ride"}
            </Button>
          </form>
        </Card>

        <Card className="glass-card p-6">
          <h3 className="font-bold mb-4">Route Preview</h3>
          <div className="bg-muted/50 h-[200px] rounded-lg flex items-center justify-center mb-4">
            <div className="text-center">
              <MapPin className="w-12 h-12 mx-auto mb-2 text-primary" />
              <p className="text-sm text-muted-foreground">Live map preview coming soon</p>
            </div>
          </div>
          <Button variant="outline" className="w-full" type="button" disabled>
            <Plus className="w-4 h-4 mr-2" />
            Add Intermediate Stops (soon)
          </Button>
        </Card>

        <Card className="glass-card p-6 border-primary/50">
          <div className="flex items-start gap-4 mb-4">
            <div className="text-4xl">🤖</div>
            <div className="flex-1">
              <h3 className="font-bold text-lg mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-accent" />
                AI Suggest Optimal Route
              </h3>
              <p className="text-sm text-muted-foreground mb-4">Let AI find riders on your path</p>

              {showAIRoute ? (
                <div className="space-y-3 animate-fade-in">
                  <div className="p-3 bg-primary/10 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Potential Riders</span>
                      <span className="text-lg font-bold text-primary">{aiSummary?.potentialRiders ?? 0}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Estimated Earnings</span>
                      <span className="text-lg font-bold text-primary">{aiSummary?.estimatedEarnings ?? 0} EcoCredits</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">CO₂ Savings</span>
                      <span className="text-lg font-bold text-primary">{aiSummary?.co2Saved ?? 0} kg</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Time Impact</span>
                      <span className="text-sm text-accent">{aiSummary?.timeImpact ?? "~5 mins"}</span>
                    </div>
                  </div>
                  <Button variant="hero" className="w-full" type="button" onClick={publishRide} disabled={isPublishing || formDisabled}>
                    Use AI Recommendations
                  </Button>
                </div>
              ) : (
                <Button variant="secondary" className="w-full" type="button" onClick={handleAiRoute} disabled={aiLoading || formDisabled}>
                  {aiLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Sparkles className="w-4 h-4 mr-2" />}
                  {aiLoading ? "Analysing..." : "Calculate Optimal Route"}
                </Button>
              )}
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6">
          <h3 className="font-bold mb-4 flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-accent" />
            Pricing
          </h3>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Price per seat (EcoCredits)</label>
              <Input
                type="number"
                value={pricePerSeat}
                onChange={(event) => setPricePerSeat(Math.max(1, Number(event.target.value) || 1))}
                className="bg-background/50"
                disabled={formDisabled}
              />
              <p className="text-xs text-muted-foreground">Suggested price: 2-3 EcoCredits</p>
            </div>
            <div className="p-4 bg-accent/10 rounded-lg">
              <div className="flex items-center justify-between">
                <span className="font-medium">Total Potential Earnings</span>
                <span className="text-2xl font-bold text-accent">{totalPotentialEarnings}</span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Based on {seats} seats × {pricePerSeat} credits</p>
            </div>
          </div>
        </Card>

        <Card className="glass-card p-6 bg-gradient-glow">
          <h3 className="font-bold mb-4">Ride Preview</h3>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Route</span>
              <span className="font-medium">{from && to ? `${from} → ${to}` : "Add route details"}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Date & Time</span>
              <span className="font-medium">{date} @ {time}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Available Seats</span>
              <span className="font-medium">{seats} seats</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Price</span>
              <span className="font-medium">{pricePerSeat} EcoCredits/seat</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Visibility</span>
              <span className="font-medium text-primary">
                {aiSummary ? `${aiSummary.potentialRiders} interested riders` : "Run AI suggestion"}
              </span>
            </div>
          </div>
        </Card>
      </div>

      <BottomNav />
    </div>
  );
};

export default OfferRide;
