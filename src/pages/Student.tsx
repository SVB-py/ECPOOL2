import { useCallback, useEffect, useMemo, useState } from "react";
import { MapPin, Clock, TrendingUp, Search, Home, BarChart3, User, Settings, Loader2, AlertTriangle, Map as MapIcon, Navigation, Bus, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { StatsCard } from "@/components/StatsCard";
import { RideCard } from "@/components/RideCard";
import { EcoWallet } from "@/components/EcoWallet";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import BottomNav from "@/components/BottomNav";
import { AttendanceMarker } from "@/components/AttendanceMarker";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { fetchStudentDashboard } from "@/lib/studentDashboardService";
import type { StudentDashboardPayload, StudentRideSummary } from "@/lib/studentDashboardService";
import { MapComponent } from "@/components/Map/MapComponent";
import { fetchRouteContext, type RouteContext } from "@/lib/liveTrackingService";
import { geocodeLocationList, getCoordinatesForLocation, toLatLngTuples } from "@/lib/omanLocations";
import { getDemoRoutes, type DemoRouteRecord } from "@/lib/demoRouteStore";

const DEMO_AVAILABLE_RIDES = [
  {
    driverName: "Salim Al-Harthy",
    from: "Al Mouj",
    to: "Royal Hospital",
    time: "7:05 AM",
    seats: 2,
    co2Saved: 3.4,
  },
  {
    driverName: "Fatma Al-Balushi",
    from: "Qurum Heights",
    to: "Madinat Al Irfan",
    time: "7:20 AM",
    seats: 1,
    co2Saved: 2.8,
  },
  {
    driverName: "Hassan Al-Hosni",
    from: "Azaiba Beach",
    to: "Knowledge Oasis",
    time: "7:35 AM",
    seats: 3,
    co2Saved: 4.1,
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

const Student = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [dashboard, setDashboard] = useState<StudentDashboardPayload | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [trackingContext, setTrackingContext] = useState<RouteContext | null>(null);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [trackingError, setTrackingError] = useState<string | null>(null);
  const [demoRoutes, setDemoRoutes] = useState<DemoRouteRecord[]>(() => getDemoRoutes());

  useEffect(() => {
    const handleUpdate = () => {
      setDemoRoutes(getDemoRoutes());
    };

    window.addEventListener("demo-routes:updated", handleUpdate);
    return () => {
      window.removeEventListener("demo-routes:updated", handleUpdate);
    };
  }, []);

  const dynamicDemoRides = useMemo(() => {
    const formatter = new Intl.DateTimeFormat("en-GB", {
      hour: "numeric",
      minute: "2-digit",
    });

    return demoRoutes.map((route) => ({
      driverName: route.driverName,
      from: route.startLocation,
      to: route.endLocation,
      time: formatter.format(new Date(route.startTimeIso)),
      seats: route.seats,
      co2Saved: Number((route.seats * 0.45).toFixed(1)),
    }));
  }, [demoRoutes]);

  const fallbackAvailableRides = useMemo(() => {
    if (dynamicDemoRides.length === 0) {
      return DEMO_AVAILABLE_RIDES;
    }
    return [...dynamicDemoRides, ...DEMO_AVAILABLE_RIDES];
  }, [dynamicDemoRides]);

  const loadDashboard = useCallback(async (id: string) => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      const data = await fetchStudentDashboard(id);
      setDashboard(data);
    } catch (error) {
      console.error("Failed to load student dashboard", error);
      setErrorMessage("Unable to load your rides right now. Please try again shortly.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initialise = async () => {
      const { data: authResult, error } = await supabase.auth.getUser();

      if (error) {
        console.error("Auth failure", error);
        if (isMounted) {
          setErrorMessage("Unable to verify your session. Please sign in again.");
          setIsLoading(false);
        }
        return;
      }

      const currentUser = authResult?.user;

      if (!currentUser) {
        navigate("/auth", { state: { role: "student" } });
        return;
      }

      if (!isMounted) {
        return;
      }

      setUserId(currentUser.id);
      await loadDashboard(currentUser.id);
    };

    initialise();

    return () => {
      isMounted = false;
    };
  }, [loadDashboard, navigate]);

  const handleRequestRide = () => {
    navigate("/request-ride");
  };

  const handleTrackRide = (routeId: string) => {
    navigate(`/live-tracking?routeId=${routeId}`);
  };

  const handleRideRequest = async (ride: StudentRideSummary) => {
    if (!userId) {
      toast({
        title: "Not signed in",
        description: "Please sign in to request a ride.",
        variant: "destructive",
      });
      return;
    }

    try {
      toast({
        title: "Requesting ride",
        description: `Contacting ${ride.driverName}...`,
      });

      const { error } = await supabase.from("bookings").insert({
        student_id: userId,
        route_id: ride.route.id,
        pickup_location: ride.booking.pickup_location,
        dropoff_location: ride.booking.dropoff_location,
        pickup_time: ride.booking.pickup_time ?? ride.route.start_time,
        status: "pending",
      });

      if (error) {
        throw error;
      }

      toast({
        title: "Ride Requested",
        description: `${ride.driverName} will confirm shortly.`,
      });

      await loadDashboard(userId);
    } catch (error) {
      console.error("Ride request failed", error);
      toast({
        title: "Could not request ride",
        description: "Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleViewDetails = (routeName: string) => {
    toast({
      title: "Ride details",
      description: `${routeName} is on your schedule. We'll keep you posted.`,
    });
  };

  const userName = dashboard?.profileName ?? "Student";

  const bookedRides = useMemo(() => {
    if (!dashboard) {
      return [] as StudentRideSummary[];
    }
    return [...dashboard.activeRides, ...dashboard.upcomingRides];
  }, [dashboard]);

  const nextRide = bookedRides[0] ?? null;

  useEffect(() => {
    if (!nextRide) {
      setTrackingContext(null);
      setTrackingError(null);
      setTrackingLoading(false);
      return;
    }

    let isSubscribed = true;
    setTrackingLoading(true);

    fetchRouteContext(nextRide.route.id)
      .then((context) => {
        if (!isSubscribed) {
          return;
        }
        setTrackingContext(context);
        setTrackingError(null);
      })
      .catch((error) => {
        console.error("Failed to load route context", error);
        if (isSubscribed) {
          setTrackingError("We couldn't load the live map just yet. Try again in a moment.");
        }
      })
      .finally(() => {
        if (isSubscribed) {
          setTrackingLoading(false);
        }
      });

    return () => {
      isSubscribed = false;
    };
  }, [nextRide]);

  const parentTrackingData = useMemo(() => {
    if (!nextRide || !trackingContext) {
      return null;
    }

    const markers: Array<{ lat: number; lng: number; icon?: string; label?: string; color?: "blue" | "green" | "red" | "orange" | "gray" }> = [];
    const stopSummaries: Array<{ name: string; status: string }> = [];
    const sequencedLocations: string[] = [];

    const rideDateSource =
      nextRide.booking.pickup_time || nextRide.route.start_time || nextRide.booking.created_at || null;
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

    const startLocation = trackingContext.route.start_location;
    if (startLocation) {
      const coord = getCoordinatesForLocation(startLocation, 0);
      if (coord) {
        markers.push({
          lat: coord.lat,
          lng: coord.lng,
          icon: "🛑",
          color: "blue",
          label: `Start • ${startLocation}`,
        });
        sequencedLocations.push(startLocation);
      }
    }

    trackingContext.bookings.forEach((booking, index) => {
      const pickupName = booking.pickup_location ?? "Pickup";
      const coord = getCoordinatesForLocation(pickupName, index + 1);
      const attendanceKey = booking.student_id ?? `${booking.id}`;
      const attendanceStatus = (attendanceMap.get(attendanceKey) ?? "pending").toLowerCase();

      if (coord) {
        markers.push({
          lat: coord.lat,
          lng: coord.lng,
          icon: attendanceStatus === "absent" ? "✖️" : `${index + 1}`,
          color: attendanceStatus === "absent" ? "gray" : "green",
          label: `${pickupName} • ${
            attendanceStatus === "present"
              ? "Present"
              : attendanceStatus === "absent"
              ? "Marked Absent"
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

    const destination = trackingContext.route.end_location;
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
          label: `Bus is here • ${formatRelativeTime(lastBusPing)}`,
        });
      }
    }

    const routeCoordinates = sequencedLocations.length > 0 ? toLatLngTuples(geocodeLocationList(sequencedLocations)) : [];
    const driverName = trackingContext.driver?.user_id
      ? trackingContext.profileMap[trackingContext.driver.user_id]?.name ?? "Driver"
      : "Driver";

    return {
      markers,
      routeCoordinates,
      stopSummaries,
      driverName,
      lastBusPing,
    };
  }, [nextRide, trackingContext]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your rides...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <p className="text-muted-foreground max-w-sm">{errorMessage}</p>
        <Button variant="outline" onClick={() => userId && loadDashboard(userId)} disabled={!userId}>
          Try again
        </Button>
      </div>
    );
  }

  if (!dashboard) {
    return (
      <div className="min-h-screen bg-background flex flex-col">
        <div className="flex-1 flex flex-col items-center justify-center gap-4 px-6 text-center">
          <AlertTriangle className="w-12 h-12 text-amber-500" />
          <div className="space-y-2 max-w-sm">
            <h2 className="text-2xl font-semibold">We couldn't find your rides yet</h2>
            <p className="text-sm text-muted-foreground">
              Your account is active, but we haven't synced any rides. Try refreshing or explore new routes to get
              started.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
            <Button variant="hero" className="flex-1" onClick={handleRequestRide}>
              <Search className="mr-2" />
              Explore Routes
            </Button>
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => userId && loadDashboard(userId)}
              disabled={!userId || isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Refreshing
                </>
              ) : (
                "Refresh"
              )}
            </Button>
          </div>
        </div>
        <BottomNav />
      </div>
    );
  }

  const statsCards = [
    {
      icon: MapPin,
      label: "Rides Taken",
      value: dashboard.stats.ridesTaken,
      color: "primary" as const,
    },
    {
      icon: Clock,
      label: "Hours Saved",
      value: dashboard.stats.hoursSaved,
      color: "secondary" as const,
    },
    {
      icon: TrendingUp,
      label: "CO₂ Saved",
      value: `${dashboard.stats.co2Saved} kg`,
      color: "secondary" as const,
    },
  ];

  return (
    <div className="min-h-screen bg-background p-6 pb-24 md:pb-8">
      <div className="container mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 animate-fade-in">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
                <Home className="w-5 h-5" />
              </Button>
              <div>
                <h1 className="text-4xl font-bold">Hi, {userName} 👋</h1>
                <p className="text-muted-foreground">Your eco commute is ready for today</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate("/student-profile")}>
                <User className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => navigate("/settings")}>
                <Settings className="w-5 h-5" />
              </Button>
              <Button variant="glass" size="lg" onClick={() => navigate("/live-tracking")}>
                <MapPin className="mr-2" />
                Live Track
              </Button>
              <Button variant="glass" size="lg" onClick={() => navigate("/analytics")}>
                <BarChart3 className="mr-2" />
                View Analytics
              </Button>
            </div>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Left Column - Stats */}
          <div className="lg:col-span-2 space-y-6">
            {/* Mark Attendance */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold mb-4">Today's Attendance</h2>
              {nextRide ? (
                <AttendanceMarker
                  routeId={nextRide.route.id}
                  routeName={nextRide.route.route_name}
                  pickupTime={nextRide.startTimeDisplay}
                />
              ) : (
                <div className="p-6 rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                  No rides scheduled today. Explore available rides below to join a route.
                </div>
              )}
            </div>

            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <Button variant="hero" size="lg" className="flex-1" onClick={handleRequestRide}>
                <Search className="mr-2" />
                Request Ride
              </Button>
              <Button
                variant="outline"
                size="lg"
                className="flex-1"
                onClick={() => navigate("/student-attendance")}
              >
                <Sparkles className="mr-2" />
                Plan Attendance
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {statsCards.map((card) => (
                <StatsCard
                  key={card.label}
                  icon={card.icon}
                  label={card.label}
                  value={card.value}
                  color={card.color}
                />
              ))}
            </div>

            {/* Active Rides */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Active Rides</h2>
              {bookedRides.length === 0 ? (
                <div className="p-6 rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                  You have no rides booked right now. Request a ride to get started.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {bookedRides.map((ride) => (
                    <RideCard
                      key={ride.route.id}
                      driverName={ride.driverName}
                      from={ride.route.start_location}
                      to={ride.route.end_location}
                      time={ride.startTimeDisplay}
                      seats={ride.seats}
                      co2Saved={ride.co2Saved}
                      status={ride.status}
                      actionLabel={ride.status === "active" ? "Track Live" : "View Details"}
                      onAction={() =>
                        ride.status === "active"
                          ? handleTrackRide(ride.route.id)
                          : handleViewDetails(ride.route.route_name)
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Family Bus Tracking */}
            {nextRide && (
              <div>
                <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
                  <MapIcon className="w-5 h-5" />
                  Family Bus Tracking
                </h2>
                <Card className="glass-card p-6 space-y-4">
                  {trackingLoading ? (
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Loading live location...</span>
                    </div>
                  ) : trackingError ? (
                    <div className="text-sm text-muted-foreground">{trackingError}</div>
                  ) : parentTrackingData ? (
                    <div className="space-y-4">
                      <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        <MapComponent
                          markers={parentTrackingData.markers}
                          route={parentTrackingData.routeCoordinates}
                          className="h-72 w-full rounded-xl overflow-hidden"
                          darkMode
                        />
                        <div className="space-y-4">
                          <div>
                            <p className="text-sm text-muted-foreground">Driver</p>
                            <p className="text-lg font-semibold">{parentTrackingData.driverName}</p>
                            <p className="text-xs text-muted-foreground">
                              {parentTrackingData.lastBusPing
                                ? `Last seen ${formatRelativeTime(parentTrackingData.lastBusPing)}`
                                : "Driver will share live location once the trip starts."}
                            </p>
                          </div>
                          <div className="space-y-2">
                            {parentTrackingData.stopSummaries.length === 0 ? (
                              <p className="text-sm text-muted-foreground">No pickup stops scheduled yet.</p>
                            ) : (
                              parentTrackingData.stopSummaries.map((stop, index) => (
                                <div
                                  key={`${stop.name}-${index}`}
                                  className="flex items-center justify-between rounded-lg border border-border px-3 py-2"
                                >
                                  <div className="flex items-center gap-2">
                                    <Bus className="w-4 h-4 text-muted-foreground" />
                                    <span className="text-sm font-medium">{stop.name}</span>
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
                            )}
                          </div>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <Button
                              variant="hero"
                              className="flex-1"
                              onClick={() => handleTrackRide(nextRide.route.id)}
                            >
                              <Navigation className="mr-2" />
                              Open Live Tracking
                            </Button>
                            <Button
                              variant="outline"
                              className="flex-1"
                              onClick={() => navigate("/student-attendance")}
                            >
                              <Sparkles className="mr-2" />
                              Update Attendance
                            </Button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="text-sm text-muted-foreground">
                      Once the driver shares their live location you'll see the route map here.
                    </div>
                  )}
                </Card>
              </div>
            )}

            {/* Available Rides */}
            <div>
              <h2 className="text-2xl font-bold mb-4">Available Rides</h2>
              {dashboard.availableRides.length === 0 ? (
                <div className="space-y-4">
                  <div className="p-6 rounded-xl border border-dashed border-border text-sm text-muted-foreground">
                    No new rides are available at the moment. Check back soon or contact support.
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {fallbackAvailableRides.map((ride) => (
                      <RideCard
                        key={`${ride.driverName}-${ride.time}`}
                        driverName={ride.driverName}
                        from={ride.from}
                        to={ride.to}
                        time={ride.time}
                        seats={ride.seats}
                        co2Saved={ride.co2Saved}
                        status="pending"
                        actionLabel="Preview Route"
                        onAction={() => navigate("/request-ride")}
                      />
                    ))}
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {dashboard.availableRides.map((ride) => (
                    <RideCard
                      key={ride.route.id}
                      driverName={ride.driverName}
                      from={ride.route.start_location}
                      to={ride.route.end_location}
                      time={ride.startTimeDisplay}
                      seats={ride.seats}
                      co2Saved={ride.co2Saved}
                      status="pending"
                      actionLabel="Request Ride"
                      onAction={() => handleRideRequest(ride)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - EcoWallet */}
          <div>
            <EcoWallet credits={dashboard.wallet.credits} tier={dashboard.wallet.tier} co2Saved={dashboard.wallet.co2Saved} />
            
            {/* Recent Achievements */}
            <div className="mt-6 glass-card p-6 animate-scale-in">
              <h3 className="text-xl font-bold mb-4">Recent Achievements</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 rounded-lg bg-primary/10 border border-primary/20">
                  <span className="text-2xl">🌟</span>
                  <div>
                    <p className="font-semibold text-sm">Daily streak</p>
                    <p className="text-xs text-muted-foreground">Keep booking rides to boost your tier</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-secondary/10 border border-secondary/20">
                  <span className="text-2xl">🌍</span>
                  <div>
                    <p className="font-semibold text-sm">Eco Warrior</p>
                    <p className="text-xs text-muted-foreground">{dashboard.wallet.co2Saved} kg CO₂ saved</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg bg-accent/10 border border-accent/20">
                  <span className="text-2xl">⭐</span>
                  <div>
                    <p className="font-semibold text-sm">Perfect Week</p>
                    <p className="text-xs text-muted-foreground">Attend all rides to unlock bonuses</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
};

export default Student;
