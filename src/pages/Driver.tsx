import { useCallback, useEffect, useMemo, useState } from "react";
import { Bus, Calendar, Leaf, TrendingUp, Plus, Home, BarChart3, Shield, User, Settings, Loader2, AlertTriangle, Sparkles, Navigation, Map as MapIcon } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatsCard } from "@/components/StatsCard";
import { RideCard } from "@/components/RideCard";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { supabase } from "@/integrations/supabase/client";
import type { DriverRouteSummary } from "@/lib/driverDashboardService";
import { fetchDriverDashboard } from "@/lib/driverDashboardService";
import { MapComponent } from "@/components/Map/MapComponent";
import { AIRerouteButton } from "@/components/AIRerouteButton";
import { fetchRouteContext, type RouteContext } from "@/lib/liveTrackingService";
import { geocodeLocationList, getCoordinatesForLocation, toLatLngTuples } from "@/lib/omanLocations";
import type { Tables } from "@/integrations/supabase/types";
import { getDemoRoutes, type DemoRouteRecord } from "@/lib/demoRouteStore";

const DEMO_DRIVER_ROUTES = [
  {
    id: "demo-green",
    name: "Green Route",
    from: "Al Mouj",
    to: "Knowledge Oasis",
    depart: "6:40 AM",
    seats: 9,
    co2Saved: 6.8,
  },
  {
    id: "demo-coast",
    name: "Coastal Loop",
    from: "Qurum Heights",
    to: "Madinat Al Irfan",
    depart: "7:05 AM",
    seats: 7,
    co2Saved: 5.4,
  },
  {
    id: "demo-campus",
    name: "Campus Shuttle",
    from: "Sultan Qaboos University",
    to: "Eco Hub",
    depart: "7:30 AM",
    seats: 8,
    co2Saved: 5.9,
  },
];

const formatRelativeTime = (iso: string | null): string => {
  if (!iso) {
    return "Just now";
  }

  const timestamp = new Date(iso);

  if (Number.isNaN(timestamp.getTime())) {
    return "Just now";
  }

  const diffMs = Date.now() - timestamp.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);

  if (diffMinutes < 1) {
    return "Just now";
  }

  if (diffMinutes < 60) {
    return `${diffMinutes} min${diffMinutes === 1 ? "" : "s"} ago`;
  }

  const diffHours = Math.floor(diffMinutes / 60);

  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }

  const diffDays = Math.floor(diffHours / 24);
  return `${diffDays}d ago`;
};

const DEMO_DRIVER_SUMMARIES: DriverRouteSummary[] = DEMO_DRIVER_ROUTES.map((route, index) => {
  const startTime = new Date();
  startTime.setMinutes(startTime.getMinutes() + 30 + index * 15);

  const demoRouteRecord: Tables<"routes"> = {
    id: route.id,
    driver_id: "demo-driver",
    route_name: route.name,
    start_location: route.from,
    end_location: route.to,
    start_time: startTime.toISOString(),
    status: "pending",
    passenger_count: route.seats,
    created_at: startTime.toISOString(),
    end_time: null,
    estimated_earnings: Math.round(route.seats * 1.5),
  };

  return {
    id: route.id,
    routeName: route.name,
    from: route.from,
    to: route.to,
    startTimeDisplay: route.depart,
    status: "pending",
    seatsBooked: Math.max(1, Math.round(route.seats * 0.6)),
    capacity: route.seats,
    co2SavedKg: route.co2Saved,
    route: demoRouteRecord,
  };
});

const demoTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
});

function createSummaryFromDemoRoute(record: DemoRouteRecord): DriverRouteSummary {
  const startTime = new Date(record.startTimeIso || new Date().toISOString());
  const formattedStart = demoTimeFormatter.format(startTime);
  const co2SavedKg = Number((record.seats * 0.45).toFixed(1));

  const demoRouteRecord: Tables<"routes"> = {
    id: record.id,
    driver_id: record.driverId,
    route_name: `${record.startLocation} → ${record.endLocation}`,
    start_location: record.startLocation,
    end_location: record.endLocation,
    start_time: record.startTimeIso,
    status: "pending",
    passenger_count: record.seats,
    created_at: record.createdAt,
    end_time: null,
    estimated_earnings: Math.round(record.seats * 1.5),
  };

  return {
    id: record.id,
    routeName: demoRouteRecord.route_name,
    from: record.startLocation,
    to: record.endLocation,
    startTimeDisplay: formattedStart,
    status: "pending",
    seatsBooked: Math.max(1, Math.round(record.seats * 0.5)),
    capacity: record.seats,
    co2SavedKg,
    route: demoRouteRecord,
  };
}

const Driver = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [driverName, setDriverName] = useState("Driver");
  const [stats, setStats] = useState({
    ridesOffered: 0,
    ecoCredits: 0,
    ecoTrend: "",
    co2SavedKg: 0,
    rating: null as number | null,
  });
  const [activeRoutes, setActiveRoutes] = useState<DriverRouteSummary[]>([]);
  const [upcomingRoutes, setUpcomingRoutes] = useState<DriverRouteSummary[]>([]);
  const [isDriverMissing, setIsDriverMissing] = useState(false);
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [trackingContext, setTrackingContext] = useState<RouteContext | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  const applyDemoDashboard = useCallback(() => {
    const demoName = sessionStorage.getItem("driver-demo-name") || "Demo Driver";
    const demoVerified = sessionStorage.getItem("driver-demo-verified") === "true";
    const storedDemoRoutes = getDemoRoutes();
    const storedSummaries = storedDemoRoutes.map((record) => createSummaryFromDemoRoute(record));
    const combinedDemoSummaries = [...storedSummaries, ...DEMO_DRIVER_SUMMARIES];
    const totalCo2 = combinedDemoSummaries.reduce((acc, route) => acc + route.co2SavedKg, 0);

    setDriverName(demoName);
    setStats({
      ridesOffered: combinedDemoSummaries.length,
      ecoCredits: Math.max(220, combinedDemoSummaries.length * 80),
      ecoTrend:
        combinedDemoSummaries.length > 0
          ? `${combinedDemoSummaries.length} demo routes live`
          : "Demo data loaded",
      co2SavedKg: Number(totalCo2.toFixed(1)),
      rating: null,
    });
    setActiveRoutes([]);
    setUpcomingRoutes(combinedDemoSummaries);
    setIsDriverMissing(!demoVerified);
    setIsDemoMode(true);
    setErrorMessage(null);
  }, []);

  const handleOfferRide = () => {
    navigate("/offer-ride");
  };

  const handleViewDetails = (rideInfo: string) => {
    toast({
      title: "Ride Details",
      description: rideInfo,
    });
  };

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const { data: userResult, error: authError } = await supabase.auth.getUser();

      if (authError || !userResult?.user) {
        console.error("Failed to load driver auth state", authError);
        const demoVerified = sessionStorage.getItem("driver-demo-verified") === "true";
        if (demoVerified) {
          applyDemoDashboard();
          setIsLoading(false);
          return;
        }
        setErrorMessage("Please sign in to access the driver dashboard.");
        setIsLoading(false);
        return;
      }

      try {
        const dashboard = await fetchDriverDashboard(userResult.user.id);
        if (!isMounted) {
          return;
        }
        setDriverName(dashboard.profileName);
        setStats(dashboard.stats);
        setActiveRoutes(dashboard.activeRoutes);
        setUpcomingRoutes(dashboard.upcomingRoutes);
        if (!dashboard.onboarding) {
          sessionStorage.removeItem("driver-demo-verified");
          sessionStorage.removeItem("driver-demo-name");
        }
        setIsDriverMissing(dashboard.onboarding);
        setErrorMessage(null);
        setIsDemoMode(false);
      } catch (error) {
        console.error("Failed to load driver dashboard", error);
        if (!isMounted) {
          return;
        }

        applyDemoDashboard();
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadDashboard();

    return () => {
      isMounted = false;
    };
  }, [applyDemoDashboard]);

  useEffect(() => {
    if (!isDemoMode) {
      return;
    }

    const handleDemoUpdate = () => {
      applyDemoDashboard();
    };

    window.addEventListener("demo-routes:updated", handleDemoUpdate);
    return () => {
      window.removeEventListener("demo-routes:updated", handleDemoUpdate);
    };
  }, [applyDemoDashboard, isDemoMode]);

  useEffect(() => {
    const orderedRoutes = [...activeRoutes, ...upcomingRoutes];

    if (orderedRoutes.length === 0) {
      if (selectedRouteId !== null) {
        setSelectedRouteId(null);
      }
      return;
    }

    if (selectedRouteId && orderedRoutes.some((route) => route.id === selectedRouteId)) {
      return;
    }

    setSelectedRouteId(orderedRoutes[0].id);
  }, [activeRoutes, upcomingRoutes, selectedRouteId]);

  useEffect(() => {
    if (!selectedRouteId || isDemoMode) {
      setTrackingContext(null);
      setTrackingError(null);
      setTrackingLoading(false);
      return;
    }

    let isActive = true;
    setTrackingLoading(true);
    setTrackingError(null);

    fetchRouteContext(selectedRouteId)
      .then((context) => {
        if (!isActive) {
          return;
        }
        setTrackingContext(context);
      })
      .catch((error) => {
        console.error("Failed to load driver route context", error);
        if (isActive) {
          setTrackingError("Could not load live route details. Try again in a moment.");
        }
      })
      .finally(() => {
        if (isActive) {
          setTrackingLoading(false);
        }
      });

    return () => {
      isActive = false;
    };
  }, [selectedRouteId, isDemoMode]);

  const { activeStatCards, passiveStatCards } = useMemo(() => {
    return {
      activeStatCards: [
        {
          icon: Bus,
          label: "Rides Offered",
          value: stats.ridesOffered,
          trend: stats.ecoTrend || undefined,
          color: "primary" as const,
        },
        {
          icon: Leaf,
          label: "EcoCredits Earned",
          value: stats.ecoCredits,
          trend: stats.ridesOffered > 0 ? `${stats.ridesOffered} trips total` : undefined,
          color: "primary" as const,
        },
      ],
      passiveStatCards: [
        {
          icon: TrendingUp,
          label: "CO₂ Saved",
          value: `${stats.co2SavedKg} kg`,
          color: "secondary" as const,
        },
        {
          icon: Calendar,
          label: "Rating",
          value: stats.rating ? stats.rating.toFixed(1) : "New",
          color: "accent" as const,
        },
      ],
    };
  }, [stats]);

  const routeOptions = useMemo(() => [...activeRoutes, ...upcomingRoutes], [activeRoutes, upcomingRoutes]);

  const selectedRoute = useMemo(() => {
    if (!selectedRouteId) {
      return null;
    }
    return routeOptions.find((route) => route.id === selectedRouteId) ?? null;
  }, [routeOptions, selectedRouteId]);

  const driverTrackingData = useMemo(() => {
    if (!selectedRoute || !trackingContext) {
      return null;
    }

    const markers: Array<{ lat: number; lng: number; icon?: string; label?: string; color?: "blue" | "green" | "red" | "orange" | "gray" }> = [];
    const stopSummaries: Array<{ name: string; status: string }> = [];
    const sequencedLocations: string[] = [];

    const rideDateSource =
      trackingContext.route.start_time || selectedRoute.route.start_time || selectedRoute.route.created_at || null;
    const rideDateKey = rideDateSource ? rideDateSource.split("T")[0] : null;

    const attendanceMap = new Map<string, string>();

    if (rideDateKey) {
      trackingContext.attendance.forEach((record) => {
        if (record.student_id && record.date === rideDateKey) {
          attendanceMap.set(record.student_id, (record.status ?? "pending").toLowerCase());
        }
      });
    }

    if (attendanceMap.size === 0) {
      trackingContext.attendance.forEach((record) => {
        if (record.student_id) {
          attendanceMap.set(record.student_id, (record.status ?? "pending").toLowerCase());
        }
      });
    }

    const startLocation = trackingContext.route.start_location || selectedRoute.from;
    if (startLocation) {
      const coord = getCoordinatesForLocation(startLocation, 0);
      if (coord) {
        markers.push({
          lat: coord.lat,
          lng: coord.lng,
          icon: "🚏",
          color: "blue",
          label: `Route start • ${startLocation}`,
        });
        sequencedLocations.push(startLocation);
      }
    }

    trackingContext.bookings.forEach((booking, index) => {
      const pickupName = booking.pickup_location ?? `Stop ${index + 1}`;
      const coord = getCoordinatesForLocation(pickupName, index + 1);
      const attendanceKey = booking.student_id ?? `${booking.id}`;
      const attendanceStatus = (attendanceMap.get(attendanceKey) ?? "pending").toLowerCase();

      if (coord) {
        markers.push({
          lat: coord.lat,
          lng: coord.lng,
          icon: attendanceStatus === "absent" ? "✖️" : `${index + 1}`,
          color: attendanceStatus === "absent" ? "gray" : attendanceStatus === "present" ? "green" : "orange",
          label: `${pickupName} • ${
            attendanceStatus === "present"
              ? "Present"
              : attendanceStatus === "absent"
              ? "Marked absent"
              : "Awaiting"
          }`,
        });
      }

      sequencedLocations.push(pickupName);
      stopSummaries.push({
        name: pickupName,
        status: attendanceStatus,
      });
    });

    const destination = trackingContext.route.end_location || selectedRoute.to;
    if (destination) {
      const coord = getCoordinatesForLocation(destination, trackingContext.bookings.length + 1);
      if (coord) {
        markers.push({
          lat: coord.lat,
          lng: coord.lng,
          icon: "🏫",
          color: "orange",
          label: `Destination • ${destination}`,
        });
        sequencedLocations.push(destination);
      }
    }

    let lastBusPing: string | null = null;

    if (trackingContext.liveLocations.length > 0) {
      const latestPing = trackingContext.liveLocations.reduce((latest, current) => {
        if (!latest) {
          return current;
        }
        const latestTime = new Date(latest.updated_at ?? "").getTime();
        const currentTime = new Date(current.updated_at ?? "").getTime();
        return currentTime > latestTime ? current : latest;
      }, trackingContext.liveLocations[0]);

      if (latestPing) {
        lastBusPing = latestPing.updated_at ?? null;
        markers.push({
          lat: latestPing.latitude,
          lng: latestPing.longitude,
          icon: "🚌",
          color: "blue",
          label: `Live bus • ${formatRelativeTime(lastBusPing)}`,
        });
      }
    }

    const presentCount = stopSummaries.filter((stop) => stop.status === "present").length;
    const pendingCount = stopSummaries.filter((stop) => stop.status !== "present").length;

    return {
      markers,
      routeCoordinates: sequencedLocations.length > 0 ? toLatLngTuples(geocodeLocationList(sequencedLocations)) : [],
      stopSummaries,
      lastBusPing,
      presentCount,
      pendingCount,
    };
  }, [selectedRoute, trackingContext]);

  const aiAttendancePayload = useMemo(() => {
    if (!trackingContext) {
      return [] as Array<{ id: string; student_id: string; status: "present" | "absent" | "pending"; pickup_location: string }>;
    }

    return trackingContext.bookings
      .map((booking, index) => {
        if (!booking.student_id) {
          return null;
        }

        const attendanceStatus = trackingContext.attendance.find((record) => record.student_id === booking.student_id)?.status ?? "pending";

        return {
          id: booking.id,
          student_id: booking.student_id,
          status: (attendanceStatus ?? "pending").toLowerCase() as "present" | "absent" | "pending",
          pickup_location: booking.pickup_location ?? `Stop ${index + 1}`,
        };
      })
      .filter(Boolean) as Array<{
        id: string;
        student_id: string;
        status: "present" | "absent" | "pending";
        pickup_location: string;
      }>;
  }, [trackingContext]);

  const hasRoutes = routeOptions.length > 0;

  const headerSubtitle = isDriverMissing ? "Activate your driver profile to unlock eco routes" : "ECpool Verified Driver ✓";

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your driver dashboard...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <p className="text-muted-foreground text-center max-w-md">{errorMessage}</p>
        <Button variant="outline" onClick={() => navigate("/")}>
          Go Home
        </Button>
      </div>
    );
  }

  const navigateToLiveTracking = (routeId: string) => {
    navigate(`/live-tracking?routeId=${routeId}`);
  };

  return (
    <div className="min-h-screen bg-background p-6 pb-24 md:pb-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <Home className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold">Welcome back, {driverName} 🌿</h1>
                <p className="text-muted-foreground">{headerSubtitle}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/driver-profile")}>
                <User className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="glass" size="lg" onClick={() => navigate("/driver/attendance")}>
                <Calendar className="mr-2" />
                Attendance
              </Button>
              <Button variant="glass" size="lg" onClick={() => navigate("/analytics")}>
                <BarChart3 className="mr-2" />
                Analytics
              </Button>
              <Button variant="outline" size="lg" onClick={() => navigate("/driver-verification")}>
                <Shield className="mr-2" />
                Verification
              </Button>
              <Button variant="hero" size="lg" onClick={handleOfferRide}>
                <Plus className="mr-2" />
                Offer Ride
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {activeStatCards.map((card) => (
            <StatsCard
              key={card.label}
              icon={card.icon}
              label={card.label}
              value={card.value}
              trend={card.trend}
              color={card.color}
            />
          ))}
          {passiveStatCards.map((card) => (
            <StatsCard
              key={card.label}
              icon={card.icon}
              label={card.label}
              value={card.value}
              color={card.color}
            />
          ))}
        </div>

        {/* Driver Command Center */}
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <MapIcon className="w-5 h-5" />
            Route Command Center
          </h2>
          <Card className="glass-card p-6 space-y-6">
            {hasRoutes ? (
              <div className="space-y-6">
                {isDemoMode && (
                  <div className="rounded-lg border border-dashed border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                    Showing demo data because we couldn't reach Supabase. Connect your backend and refresh to see
                    live routes and AI controls.
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {routeOptions.map((route) => (
                    <Button
                      key={route.id}
                      variant={route.id === selectedRouteId ? "hero" : "outline"}
                      size="sm"
                      onClick={() => setSelectedRouteId(route.id)}
                    >
                      <span className="font-semibold">{route.routeName || "Route"}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {route.from} → {route.to}
                      </span>
                    </Button>
                  ))}
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {isDemoMode ? (
                      <div className="flex h-72 items-center justify-center text-sm text-muted-foreground rounded-xl border border-dashed border-border text-center px-4">
                        Live map preview is disabled in demo mode. Reconnect Supabase for GPS tracking and stop
                        markers.
                      </div>
                    ) : trackingLoading ? (
                      <div className="flex h-72 items-center justify-center gap-3 text-muted-foreground rounded-xl border border-dashed border-border">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading live map…</span>
                      </div>
                    ) : trackingError ? (
                      <div className="flex h-72 items-center justify-center text-sm text-muted-foreground rounded-xl border border-dashed border-border text-center px-4">
                        {trackingError}
                      </div>
                    ) : driverTrackingData ? (
                      <MapComponent
                        markers={driverTrackingData.markers}
                        route={driverTrackingData.routeCoordinates}
                        className="h-72 w-full rounded-xl overflow-hidden"
                        darkMode
                      />
                    ) : (
                      <div className="flex h-72 items-center justify-center text-sm text-muted-foreground rounded-xl border border-dashed border-border text-center px-4">
                        Select a route to preview pickups and live bus updates.
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-lg border border-border p-4">
                        <p className="text-sm text-muted-foreground">Students checked in</p>
                        <p className="text-2xl font-semibold">{driverTrackingData?.presentCount ?? 0}</p>
                      </div>
                      <div className="rounded-lg border border-border p-4">
                        <p className="text-sm text-muted-foreground">Stops awaiting update</p>
                        <p className="text-2xl font-semibold">{driverTrackingData?.pendingCount ?? 0}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Route window</p>
                          <p className="text-lg font-semibold">
                            {selectedRoute?.startTimeDisplay ?? "TBD"} · {selectedRoute?.from} → {selectedRoute?.to}
                          </p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => selectedRoute && navigateToLiveTracking(selectedRoute.id)}
                          disabled={!selectedRoute}
                        >
                          <Navigation className="mr-2 h-4 w-4" />
                          Live Tracking
                        </Button>
                      </div>
                      <p className="mt-2 text-xs text-muted-foreground">
                        {driverTrackingData?.lastBusPing
                          ? `Last GPS ping ${formatRelativeTime(driverTrackingData.lastBusPing)}`
                          : "Share the driver app to broadcast live GPS updates."}
                      </p>
                    </div>

                    <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                      {driverTrackingData?.stopSummaries.length ? (
                        driverTrackingData.stopSummaries.map((stop, index) => (
                          <div
                            key={`${stop.name}-${index}`}
                            className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                          >
                            <div>
                              <p className="text-sm font-medium">{stop.name}</p>
                              <p className="text-xs text-muted-foreground">Stop {index + 1}</p>
                            </div>
                            <span
                              className={`text-xs font-semibold uppercase ${
                                stop.status === "present"
                                  ? "text-green-500"
                                  : stop.status === "absent"
                                  ? "text-gray-400"
                                  : "text-amber-500"
                              }`}
                            >
                              {stop.status === "present"
                                ? "Present"
                                : stop.status === "absent"
                                ? "Absent"
                                : "Pending"}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="rounded-lg border border-dashed border-border px-3 py-6 text-sm text-muted-foreground text-center">
                          No passengers assigned yet. New bookings will appear here instantly.
                        </div>
                      )}
                    </div>

                    <div className="space-y-3">
                      {selectedRoute && !isDemoMode ? (
                        <AIRerouteButton routeId={selectedRoute.id} attendance={aiAttendancePayload} />
                      ) : (
                        <Button variant="outline" size="lg" className="w-full" disabled>
                          <Sparkles className="mr-2" />
                          AI Optimize Route
                        </Button>
                      )}
                      <p className="text-xs text-muted-foreground">
                        AI rerouting balances student attendance, CO₂ savings, and traffic to keep your route efficient.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-3">
                  <h3 className="text-xl font-semibold">No routes yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Offer your first ride to unlock live tracking, AI rerouting, and real-time CO₂ insights.
                  </p>
                  <Button variant="hero" size="lg" className="w-full" onClick={handleOfferRide}>
                    <Plus className="mr-2" />
                    Offer a Route
                  </Button>
                </div>
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-muted-foreground">Popular ideas</h4>
                  <div className="space-y-2">
                    {DEMO_DRIVER_ROUTES.map((route) => (
                      <div key={route.id} className="rounded-lg border border-border px-4 py-3">
                        <p className="text-sm font-semibold">{route.name}</p>
                        <p className="text-xs text-muted-foreground">{route.from} → {route.to}</p>
                        <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                          <span>Departs {route.depart}</span>
                          <span>{route.seats} seats</span>
                          <span>{route.co2Saved} kg CO₂</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </Card>
        </div>

        {/* Active Rides */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-6">Active Rides</h2>
          {activeRoutes.length === 0 ? (
            <div className="p-6 rounded-xl border border-dashed border-border text-muted-foreground text-sm">
              No rides are active right now. Upcoming trips will appear here 30 minutes before departure.
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeRoutes.map((route) => (
                <RideCard
                  key={route.id}
                  from={route.from}
                  to={route.to}
                  time={route.startTimeDisplay}
                  seats={route.seatsBooked}
                  co2Saved={route.co2SavedKg}
                  status="active"
                  actionLabel="Open Live Tracking"
                  onAction={() => navigateToLiveTracking(route.id)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Upcoming Rides */}
        <div>
          <h2 className="text-2xl font-bold mb-6">Upcoming Rides</h2>
          {upcomingRoutes.length === 0 ? (
            <div className="space-y-4">
              <div className="p-6 rounded-xl border border-dashed border-border text-muted-foreground text-sm">
                No upcoming rides scheduled yet. Tap "Offer Ride" to create a new trip.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {DEMO_DRIVER_ROUTES.map((route) => (
                  <div key={`demo-upcoming-${route.id}`} className="rounded-lg border border-border px-4 py-3">
                    <p className="text-sm font-semibold">{route.name}</p>
                    <p className="text-xs text-muted-foreground">{route.from} → {route.to}</p>
                    <div className="mt-1 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{route.depart}</span>
                      <span>{route.seats} seats</span>
                      <span>{route.co2Saved} kg CO₂</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingRoutes.map((route) => (
                <RideCard
                  key={route.id}
                  from={route.from}
                  to={route.to}
                  time={route.startTimeDisplay}
                  seats={route.capacity ?? route.seatsBooked}
                  co2Saved={route.co2SavedKg}
                  status="pending"
                  actionLabel="View Details"
                  onAction={() => handleViewDetails(`Route ${route.routeName} departs at ${route.startTimeDisplay}`)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Driver;
