import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import DriverBottomNav from "@/components/DriverBottomNav";
import { MapComponent } from "@/components/Map/MapComponent";
import {
  DollarSign,
  Bus,
  Users,
  Star,
  Clock,
  Play,
  Square,
  AlertTriangle,
  Settings,
  BarChart3,
  MapPin,
  Loader2,
  Sparkles,
  Navigation,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { fetchDriverDashboard, type DriverRouteSummary } from "@/lib/driverDashboardService";
import { fetchRouteContext, type RouteContext } from "@/lib/liveTrackingService";
import { geocodeLocationList, getCoordinatesForLocation, toLatLngTuples } from "@/lib/omanLocations";
import { AIRerouteButton } from "@/components/AIRerouteButton";

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

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isOnline, setIsOnline] = useState(false);
  const [activeTripStarted, setActiveTripStarted] = useState(false);
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
  const [selectedRouteId, setSelectedRouteId] = useState<string | null>(null);
  const [trackingContext, setTrackingContext] = useState<RouteContext | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);

  const handleOnlineToggle = (checked: boolean) => {
    setIsOnline(checked);
    toast({
      title: checked ? "You're Online!" : "You're Offline",
      description: checked
        ? "You can now receive ride requests"
        : "You won't receive new requests",
    });
  };

  const handleStartTrip = () => {
    setActiveTripStarted(true);
    toast({
      title: "Trip Started!",
      description: "Navigate to live tracking...",
    });
  };

  const handleEndTrip = () => {
    setActiveTripStarted(false);
    toast({
      title: "Trip Completed!",
      description: "Great job! Earnings updated.",
    });
  };

  useEffect(() => {
    let isMounted = true;

    const loadDashboard = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      const { data: authResult, error: authError } = await supabase.auth.getUser();

      if (authError) {
        console.error("Failed to load driver auth state", authError);
        if (isMounted) {
          setErrorMessage("Unable to verify your session. Please sign in again.");
          setIsLoading(false);
        }
        return;
      }

      if (!authResult?.user) {
        if (isMounted) {
          setErrorMessage("Please sign in to access the driver dashboard.");
          setIsLoading(false);
        }
        return;
      }

      try {
        const dashboard = await fetchDriverDashboard(authResult.user.id);
        if (!isMounted) {
          return;
        }

        setDriverName(dashboard.profileName);
        setStats(dashboard.stats);
        setActiveRoutes(dashboard.activeRoutes);
        setUpcomingRoutes(dashboard.upcomingRoutes);
      } catch (error) {
        console.error("Failed to load driver dashboard", error);
        if (isMounted) {
          setErrorMessage("Could not load driver data. Please try again shortly.");
        }
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
  }, []);

  const routeOptions = useMemo(() => [...activeRoutes, ...upcomingRoutes], [activeRoutes, upcomingRoutes]);

  useEffect(() => {
    if (routeOptions.length === 0) {
      if (selectedRouteId !== null) {
        setSelectedRouteId(null);
      }
      return;
    }

    if (selectedRouteId && routeOptions.some((route) => route.id === selectedRouteId)) {
      return;
    }

    setSelectedRouteId(routeOptions[0].id);
  }, [routeOptions, selectedRouteId]);

  useEffect(() => {
    if (!selectedRouteId) {
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
  }, [selectedRouteId]);

  const selectedRoute = useMemo(() => {
    if (!selectedRouteId) {
      return null;
    }
    return routeOptions.find((route) => route.id === selectedRouteId) ?? null;
  }, [routeOptions, selectedRouteId]);

  useEffect(() => {
    setActiveTripStarted(selectedRoute?.status === "active");
  }, [selectedRouteId]);

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

  const fallbackMarkers = useMemo(() => {
    if (!selectedRoute) {
      return [];
    }

    const points: Array<{ lat: number; lng: number; icon?: string; label?: string; color?: "blue" | "green" | "red" | "orange" | "gray" }> = [];
    const start = getCoordinatesForLocation(selectedRoute.from, 0);
    if (start) {
      points.push({ lat: start.lat, lng: start.lng, icon: "🚏", color: "blue", label: selectedRoute.from });
    }
    const end = getCoordinatesForLocation(selectedRoute.to, 1);
    if (end) {
      points.push({ lat: end.lat, lng: end.lng, icon: "🏫", color: "orange", label: selectedRoute.to });
    }
    return points;
  }, [selectedRoute]);

  const fallbackRoute = useMemo(() => {
    if (!selectedRoute) {
      return [] as [number, number][];
    }
    return toLatLngTuples(geocodeLocationList([selectedRoute.from, selectedRoute.to]));
  }, [selectedRoute]);

  const nextStop = useMemo(() => {
    if (!driverTrackingData?.stopSummaries.length) {
      return null;
    }
    return (
      driverTrackingData.stopSummaries.find((stop) => stop.status !== "absent") ??
      driverTrackingData.stopSummaries[0]
    );
  }, [driverTrackingData]);

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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center px-6">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <p className="text-muted-foreground max-w-sm">{errorMessage}</p>
        <Button variant="outline" onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto max-w-7xl p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {driverName}! 👋</h1>
            <p className="text-muted-foreground">Keep routes efficient and students on time</p>
          </div>

          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => navigate("/settings")}
            >
              <Settings className="w-5 h-5" />
            </Button>

            <div className="flex items-center gap-3 glass-card px-4 py-2 rounded-lg">
              <span className="text-sm font-medium">
                {isOnline ? "Online" : "Offline"}
              </span>
              <Switch checked={isOnline} onCheckedChange={handleOnlineToggle} />
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-card p-6 hover-scale">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">EcoCredits</p>
                <p className="text-3xl font-bold text-primary mt-2">{stats.ecoCredits}</p>
                <p className="text-xs text-green-500 mt-1">{stats.ecoTrend || "Stay consistent for bonuses"}</p>
              </div>
              <div className="p-3 bg-primary/10 rounded-xl">
                <DollarSign className="w-6 h-6 text-primary" />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6 hover-scale">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Routes Live</p>
                <p className="text-3xl font-bold mt-2">{activeRoutes.length}</p>
                <p className="text-xs text-muted-foreground mt-1">{upcomingRoutes.length} upcoming</p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-xl">
                <Bus className="w-6 h-6 text-secondary" />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6 hover-scale">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rating</p>
                <p className="text-3xl font-bold mt-2">{stats.rating ? stats.rating.toFixed(1) : "New"}</p>
                <p className="text-xs text-muted-foreground mt-1">Community feedback</p>
              </div>
              <div className="p-3 bg-yellow-500/10 rounded-xl">
                <Star className="w-6 h-6 text-yellow-500" />
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6 hover-scale">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm text-muted-foreground">CO₂ Saved</p>
                <p className="text-3xl font-bold mt-2">{stats.co2SavedKg} kg</p>
                <p className="text-xs text-muted-foreground mt-1">Across active routes</p>
              </div>
              <div className="p-3 bg-cyan-500/10 rounded-xl">
                <Clock className="w-6 h-6 text-cyan-500" />
              </div>
            </div>
          </Card>
        </div>

        {/* Route Command Center */}
        <Card className="glass-card p-6 mb-8 animate-slide-up">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {hasRoutes ? (
                routeOptions.map((route) => (
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
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Offer a ride to unlock real-time tracking and AI rerouting.
                </p>
              )}
            </div>

            {hasRoutes && selectedRoute ? (
              <div className="space-y-6">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h2 className="text-2xl font-bold">{selectedRoute.from} → {selectedRoute.to}</h2>
                    <p className="text-sm text-muted-foreground">
                      Departs {selectedRoute.startTimeDisplay} · {selectedRoute.seatsBooked} passengers booked
                    </p>
                  </div>
                  <Badge variant={activeTripStarted ? "default" : "secondary"}>
                    {selectedRoute.status === "completed"
                      ? "Completed"
                      : activeTripStarted
                      ? "In Progress"
                      : "Ready"}
                  </Badge>
                </div>

                <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    {trackingLoading ? (
                      <div className="flex h-72 items-center justify-center gap-3 text-muted-foreground rounded-xl border border-dashed border-border">
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Loading live map…</span>
                      </div>
                    ) : trackingError ? (
                      <div className="flex h-72 items-center justify-center text-sm text-muted-foreground rounded-xl border border-dashed border-border text-center px-4">
                        {trackingError}
                      </div>
                    ) : (
                      <MapComponent
                        className="h-72 w-full rounded-xl overflow-hidden"
                        markers={driverTrackingData?.markers ?? fallbackMarkers}
                        route={driverTrackingData?.routeCoordinates ?? fallbackRoute}
                        darkMode
                      />
                    )}

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                        <MapPin className="w-5 h-5 text-primary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Next pickup</p>
                          <p className="font-semibold">{nextStop ? nextStop.name : "Pending"}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                        <Users className="w-5 h-5 text-secondary" />
                        <div>
                          <p className="text-xs text-muted-foreground">Passengers</p>
                          <p className="font-semibold">{selectedRoute.seatsBooked} students</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3 rounded-lg border border-border px-3 py-2">
                        <Clock className="w-5 h-5 text-accent" />
                        <div>
                          <p className="text-xs text-muted-foreground">Depart</p>
                          <p className="font-semibold">{selectedRoute.startTimeDisplay}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-3 sm:flex-row">
                      {!activeTripStarted ? (
                        <Button onClick={handleStartTrip} className="flex-1" size="lg" variant="hero">
                          <Play className="mr-2 w-4 h-4" />
                          Start Trip
                        </Button>
                      ) : (
                        <Button onClick={handleEndTrip} className="flex-1" size="lg" variant="destructive">
                          <Square className="mr-2 w-4 h-4" />
                          End Trip
                        </Button>
                      )}
                      <Button
                        size="lg"
                        variant="outline"
                        className="flex-1"
                        onClick={() => navigate(`/live-tracking?routeId=${selectedRoute.id}`)}
                      >
                        <Navigation className="mr-2 w-4 h-4" />
                        Live Tracking
                      </Button>
                      <Button size="lg" variant="outline">
                        <AlertTriangle className="mr-2 w-4 h-4" />
                        SOS
                      </Button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="rounded-lg border border-border p-4">
                      <p className="text-sm font-semibold mb-3">Passenger readiness</p>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg bg-green-500/10 p-3">
                          <p className="text-xs text-muted-foreground">Checked-in</p>
                          <p className="text-xl font-semibold text-green-500">{driverTrackingData?.presentCount ?? 0}</p>
                        </div>
                        <div className="rounded-lg bg-amber-500/10 p-3">
                          <p className="text-xs text-muted-foreground">Awaiting</p>
                          <p className="text-xl font-semibold text-amber-500">{driverTrackingData?.pendingCount ?? 0}</p>
                        </div>
                      </div>
                      <p className="mt-3 text-xs text-muted-foreground">
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
                      <AIRerouteButton routeId={selectedRoute.id} attendance={aiAttendancePayload} />
                      <p className="text-xs text-muted-foreground">
                        AI rerouting balances attendance, CO₂ savings, and live GPS to keep your trip on schedule.
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
                  <Button variant="hero" size="lg" className="w-full" onClick={() => navigate("/offer-ride")}>
                    <Sparkles className="mr-2" />
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
                          <span>{route.depart}</span>
                          <span>{route.seats} seats</span>
                          <span>{route.co2Saved} kg CO₂</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Button
            variant="outline"
            size="lg"
            className="h-24"
            onClick={() => navigate("/driver/routes")}
          >
            <div className="flex flex-col items-center gap-2">
              <MapPin className="w-8 h-8" />
              <span>View Today's Routes</span>
            </div>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-24"
            onClick={() => navigate("/driver/earnings")}
          >
            <div className="flex flex-col items-center gap-2">
              <DollarSign className="w-8 h-8" />
              <span>Check Earnings</span>
            </div>
          </Button>

          <Button
            variant="outline"
            size="lg"
            className="h-24"
            onClick={() => navigate("/driver/stats")}
          >
            <div className="flex flex-col items-center gap-2">
              <BarChart3 className="w-8 h-8" />
              <span>Performance Stats</span>
            </div>
          </Button>
        </div>
      </div>

      <DriverBottomNav />
    </div>
  );
};

export default Dashboard;
