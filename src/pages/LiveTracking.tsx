import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation as useRouterLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MapComponent } from "@/components/Map/MapComponent";
import type { MarkerData } from "@/components/Map/MapComponent";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";
import type { RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { ArrowLeft, MapPin, Clock, Users, Leaf, AlertTriangle } from "lucide-react";
import { fetchRouteContext } from "@/lib/liveTrackingService";
import {
  getCoordinatesForLocation,
  geocodeLocationList,
  toLatLngTuples,
  getDisplayName,
} from "@/lib/omanLocations";
import {
  calculateDistance,
  calculateETA,
  formatETA,
  type Location as MapLocation,
} from "@/lib/mapUtils";

type AttendanceRow = Tables<"attendance">;
type BookingRow = Tables<"bookings">;
type LiveLocationRow = Tables<"live_locations">;

interface OptimizationResult {
  optimizedRoute?: string[];
  timeSaved?: string;
  distanceSaved?: string;
  recommendations?: string[];
}

const OPTIMIZATION_DEBOUNCE_MS = 800;
const STOP_COMPLETION_RADIUS_KM = 0.35;
const DEFAULT_SPEED_KMH = 35;

const LiveTracking = () => {
  const navigate = useNavigate();
  const routerLocation = useRouterLocation();
  const { toast } = useToast();

  const [routeId, setRouteId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [routeError, setRouteError] = useState<string | null>(null);
  const [markers, setMarkers] = useState<MarkerData[]>([]);
  const [routePolyline, setRoutePolyline] = useState<[number, number][]>([]);
  const [eta, setEta] = useState<string>("Calculating...");
  const [attendance, setAttendance] = useState<AttendanceRow[]>([]);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [liveLocations, setLiveLocations] = useState<LiveLocationRow[]>([]);
  const [optimization, setOptimization] = useState<OptimizationResult | null>(null);
  const [routeOrder, setRouteOrder] = useState<string[]>([]);
  const [upcomingStops, setUpcomingStops] = useState<string[]>([]);
  const [currentStop, setCurrentStop] = useState<string>("Loading...");
  const [presentCount, setPresentCount] = useState(0);
  const [absentCount, setAbsentCount] = useState(0);
  const [ecoImpact, setEcoImpact] = useState<number>(0);
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);
  const [routeName, setRouteName] = useState<string>("Loading route...");
  const [startLocation, setStartLocation] = useState<string>("");
  const [endLocation, setEndLocation] = useState<string>("");
  const [driverName, setDriverName] = useState<string>("Bus Driver");
  const [isOptimizing, setIsOptimizing] = useState(false);

  const optimizationTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const routeContextRef = useRef<Awaited<ReturnType<typeof fetchRouteContext>> | null>(null);

  const busLocation = useMemo(() => {
    const driverUserId = routeContextRef.current?.driver?.user_id;
    if (!driverUserId) {
      return null;
    }
    return liveLocations.find((location) => location.user_id === driverUserId) || null;
  }, [liveLocations]);

  const stopSequence = useMemo(() => {
    if (!routeContextRef.current) {
      return [];
    }
    const start = routeContextRef.current.route.start_location;
    const end = routeContextRef.current.route.end_location;
    const stops = routeOrder.length > 0 ? routeOrder : bookings.map((booking) => booking.pickup_location);
    return [start, ...stops, end].filter(Boolean) as string[];
  }, [routeOrder, bookings]);

  useEffect(() => {
    const params = new URLSearchParams(routerLocation.search);
    const routeIdFromQuery = params.get("routeId");

    if (routeIdFromQuery) {
      setRouteId(routeIdFromQuery);
      return;
    }

    let isActive = true;

    const resolveRoute = async () => {
      try {
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser();

        if (authError) {
          throw authError;
        }

        if (!user) {
          setRouteError("You need to sign in to view live tracking.");
          setIsLoading(false);
          return;
        }

        const { data: latestBooking } = await supabase
          .from("bookings")
          .select("route_id")
          .eq("student_id", user.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!isActive) {
          return;
        }

        if (latestBooking?.route_id) {
          setRouteId(latestBooking.route_id);
          return;
        }

        const { data: firstRoute } = await supabase
          .from("routes")
          .select("id")
          .order("created_at", { ascending: true })
          .limit(1)
          .maybeSingle();

        if (firstRoute?.id) {
          setRouteId(firstRoute.id);
        } else {
          setRouteError("No active routes available.");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Failed to resolve route:", error);
        if (isActive) {
          setRouteError("Unable to determine route for live tracking.");
          setIsLoading(false);
        }
      }
    };

    resolveRoute();

    return () => {
      isActive = false;
    };
  }, [routerLocation.search]);

  const applyOptimizationResult = useCallback(
    (result: OptimizationResult | null, attendanceRows: AttendanceRow[], bookingRows: BookingRow[]) => {
      if (!routeContextRef.current) {
        return;
      }

      setOptimization(result);

      const presentStudentIds = new Set(
        attendanceRows.filter((row) => row.status === "present").map((row) => row.student_id)
      );

      const fallbackStops = bookingRows
        .filter((booking) => presentStudentIds.has(booking.student_id))
        .map((booking) => booking.pickup_location);

      const optimizedStops = result?.optimizedRoute && result.optimizedRoute.length > 0
        ? result.optimizedRoute
        : fallbackStops;

      setRouteOrder(optimizedStops);
    },
    []
  );

  const handleRunOptimization = useCallback(
    async (attendanceRows: AttendanceRow[], bookingRows: BookingRow[]) => {
      if (!routeId) {
        return;
      }

      setIsOptimizing(true);

      const bookingLookup = bookingRows.reduce<Record<string, BookingRow>>((acc, booking) => {
        acc[booking.student_id] = booking;
        return acc;
      }, {});

      const payloadAttendance = attendanceRows.map((row) => ({
        id: row.id,
        student_id: row.student_id,
        status: row.status as "present" | "absent",
        pickup_location: bookingLookup[row.student_id]?.pickup_location ?? null,
      }));

      try {
        const { data, error } = await supabase.functions.invoke<OptimizationResult>("ai-reroute", {
          body: { routeId, attendance: payloadAttendance },
        });

        if (error) {
          throw error;
        }

        applyOptimizationResult(data ?? null, attendanceRows, bookingRows);

        if (data?.timeSaved) {
          toast({
            title: "Route optimized",
            description: `Time saved: ${data.timeSaved}${data.distanceSaved ? ` • Distance saved: ${data.distanceSaved}` : ""}`,
          });
        }
      } catch (error) {
        console.error("AI reroute failed:", error);
        toast({
          title: "AI reroute failed",
          description: "Showing fallback route order.",
          variant: "destructive",
        });
        applyOptimizationResult(null, attendanceRows, bookingRows);
      } finally {
        setIsOptimizing(false);
      }
    },
    [applyOptimizationResult, routeId, toast]
  );

  const scheduleOptimization = useCallback(
    (attendanceRows: AttendanceRow[], bookingRows: BookingRow[]) => {
      if (optimizationTimeoutRef.current) {
        clearTimeout(optimizationTimeoutRef.current);
      }

      optimizationTimeoutRef.current = setTimeout(() => {
        handleRunOptimization(attendanceRows, bookingRows);
      }, OPTIMIZATION_DEBOUNCE_MS);
    },
    [handleRunOptimization]
  );

  useEffect(() => {
    if (!routeId) {
      return;
    }

    let isActive = true;

    const loadRoute = async () => {
      setIsLoading(true);
      setRouteError(null);

      try {
        const context = await fetchRouteContext(routeId);

        if (!isActive) {
          return;
        }

        routeContextRef.current = context;

        setRouteName(context.route.route_name);
        setStartLocation(context.route.start_location);
        setEndLocation(context.route.end_location);
        setDriverName(context.profileMap[context.driver?.user_id ?? ""]?.name ?? "Bus Driver");
        setAttendance(context.attendance);
        setBookings(context.bookings);
        setLiveLocations(context.liveLocations);
        setPresentCount(context.attendance.filter((row) => row.status === "present").length);
        setAbsentCount(context.attendance.filter((row) => row.status === "absent").length);
        setEcoImpact(Math.max(context.attendance.filter((row) => row.status === "present").length * 0.2, 0));
        setLastUpdated(new Date().toISOString());

        scheduleOptimization(context.attendance, context.bookings);
      } catch (error) {
        console.error("Failed to load route context:", error);
        if (isActive) {
          setRouteError("Unable to load live tracking data.");
        }
      } finally {
        if (isActive) {
          setIsLoading(false);
        }
      }
    };

    loadRoute();

    return () => {
      isActive = false;
    };
  }, [routeId, scheduleOptimization]);

  useEffect(() => {
    return () => {
      if (optimizationTimeoutRef.current) {
        clearTimeout(optimizationTimeoutRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!routeId) {
      return;
    }

    const channel = supabase
      .channel(`live-tracking-${routeId}`)
      .on<RealtimePostgresChangesPayload<LiveLocationRow>>(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "live_locations",
          filter: `route_id=eq.${routeId}`,
        },
        (payload) => {
          setLiveLocations((prev) => {
            if (payload.eventType === "DELETE") {
              const target = (payload.old as LiveLocationRow | null) ?? null;
              if (!target) {
                return prev;
              }
              return prev.filter((row) => row.id !== target.id);
            }

            const updated = (payload.new as unknown as LiveLocationRow | null) ?? null;
            if (!updated) {
              return prev;
            }
            const others = prev.filter((row) => row.id !== updated.id);
            return [updated, ...others];
          });

          setLastUpdated(new Date().toISOString());
        }
      )
      .on<RealtimePostgresChangesPayload<AttendanceRow>>(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "attendance",
          filter: `route_id=eq.${routeId}`,
        },
        (payload) => {
          setAttendance((prev) => {
            let next = prev;

            if (payload.eventType === "DELETE") {
              const removed = (payload.old as unknown as AttendanceRow | null) ?? null;
              if (removed) {
                next = prev.filter((row) => row.id !== removed.id);
              }
            } else {
              const updated = (payload.new as unknown as AttendanceRow | null) ?? null;
              if (!updated) {
                return prev;
              }
              const others = prev.filter((row) => row.id !== updated.id);
              next = [updated, ...others];
            }

            setPresentCount(next.filter((row) => row.status === "present").length);
            setAbsentCount(next.filter((row) => row.status === "absent").length);
            setEcoImpact(Math.max(next.filter((row) => row.status === "present").length * 0.2, 0));

            scheduleOptimization(next, bookings);

            return next;
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [routeId, bookings, scheduleOptimization]);

  useEffect(() => {
    if (!routeContextRef.current) {
      return;
    }

    const driverUserId = routeContextRef.current.driver?.user_id;

    setMarkers(
      buildMarkers(
        liveLocations,
        driverUserId,
        routeContextRef.current.profileMap,
        attendance,
        bookings
      )
    );
  }, [liveLocations, attendance, bookings]);

  useEffect(() => {
    if (!routeContextRef.current) {
      return;
    }

    const driverUserId = routeContextRef.current.driver?.user_id;
    const polyline = buildRoutePolyline(
      routeContextRef.current.route,
      routeOrder,
      busLocation
    );

    setRoutePolyline(polyline);

    const calculatedEta = computeEta(busLocation, polyline);
    setEta(calculatedEta);

    const upcoming = computeUpcomingStops(stopSequence, busLocation);
    setUpcomingStops(upcoming);
    setCurrentStop(upcoming[0] ?? stopSequence[1] ?? routeContextRef.current.route.end_location);
  }, [routeOrder, busLocation, stopSequence]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-muted-foreground">Loading live tracking data...</p>
        </div>
      </div>
    );
  }

  if (routeError) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <AlertTriangle className="w-12 h-12 text-destructive" />
        <p className="text-muted-foreground">{routeError}</p>
        <Button variant="outline" onClick={() => navigate("/student")}>
          Back to dashboard
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      <div className="container mx-auto max-w-7xl p-6">
        <div className="flex items-center justify-between mb-8 animate-fade-in">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => navigate("/student")}>
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <div>
              <h1 className="text-4xl font-bold">{routeName}</h1>
              <p className="text-muted-foreground">
                Tracking live location for {driverName}
                {lastUpdated ? ` · Updated ${new Date(lastUpdated).toLocaleTimeString()}` : ""}
              </p>
            </div>
          </div>
          <Badge variant="default" className="text-lg px-4 py-2">
            <Clock className="w-4 h-4 mr-2" />
            ETA: {eta}
          </Badge>
        </div>

        <Card className="glass-card p-6 mb-8">
          <MapComponent
            className="h-[500px] w-full rounded-xl overflow-hidden"
            markers={markers}
            route={routePolyline}
          />
        </Card>

        {optimization && (
          <Card className="glass-card p-6 mb-8">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm text-muted-foreground">AI Reroute Insights</p>
                <h2 className="text-2xl font-bold mt-1">Smarter path in progress</h2>
              </div>
              <div className="flex flex-col text-right">
                {optimization.timeSaved && <span className="font-semibold">🕒 {optimization.timeSaved} saved</span>}
                {optimization.distanceSaved && (
                  <span className="text-sm text-muted-foreground">📏 {optimization.distanceSaved} shorter</span>
                )}
                {isOptimizing && <span className="text-sm text-primary">Re-running optimization...</span>}
              </div>
            </div>
            {optimization.recommendations && optimization.recommendations.length > 0 && (
              <div className="mt-4 grid gap-3 md:grid-cols-2">
                {optimization.recommendations.map((tip, index) => (
                  <div key={index} className="p-3 rounded-lg bg-primary/10 border border-primary/20 text-sm">
                    {tip}
                  </div>
                ))}
              </div>
            )}
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="glass-card p-6 hover-scale">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <MapPin className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Current stop</p>
                <p className="text-xl font-bold">{getDisplayName(currentStop)}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  {upcomingStops.length > 1 ? `${upcomingStops.length - 1} stops remaining` : "Final stop"}
                </p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6 hover-scale">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-secondary/10 rounded-xl">
                <Users className="w-6 h-6 text-secondary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Passengers checked in</p>
                <p className="text-xl font-bold">{presentCount}</p>
                <p className="text-xs text-muted-foreground mt-1">{absentCount} marked absent</p>
              </div>
            </div>
          </Card>

          <Card className="glass-card p-6 hover-scale">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-green-500/10 rounded-xl">
                <Leaf className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">CO₂ saved today</p>
                <p className="text-xl font-bold">{ecoImpact.toFixed(1)} kg</p>
                <p className="text-xs text-green-500 mt-1">AI route keeps footprint low</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="glass-card p-6 mt-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4">
            <div>
              <h2 className="text-2xl font-bold">Upcoming Stops</h2>
              <p className="text-sm text-muted-foreground">
                Start: {getDisplayName(startLocation)} · Destination: {getDisplayName(endLocation)}
              </p>
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              {isOptimizing ? "Updating with AI suggestions..." : "Live route in sync"}
            </div>
          </div>

          {upcomingStops.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground bg-background/50 rounded-lg">
              All stops completed. Heading to final destination.
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingStops.map((stop, index) => (
                <div
                  key={`${stop}-${index}`}
                  className="flex items-center justify-between p-4 bg-background/60 rounded-lg border border-border/40"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center font-semibold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-semibold">{getDisplayName(stop)}</p>
                      <p className="text-xs text-muted-foreground">
                        {index === 0 ? "Next pickup" : `${index} stop${index > 1 ? "s" : ""} away`}
                      </p>
                    </div>
                  </div>
                  <Badge variant={index === 0 ? "default" : "secondary"}>
                    {index === 0 ? "Next" : "Upcoming"}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default LiveTracking;

function buildMarkers(
  liveLocations: LiveLocationRow[],
  driverUserId: string | undefined,
  profileMap: Record<string, { name: string | null; avatar_url: string | null }>,
  attendance: AttendanceRow[],
  bookings: BookingRow[]
): MarkerData[] {
  const attendanceLookup = attendance.reduce<Record<string, AttendanceRow>>((acc, row) => {
    acc[row.student_id] = row;
    return acc;
  }, {});

  const bookingLookup = bookings.reduce<Record<string, BookingRow>>((acc, booking) => {
    acc[booking.student_id] = booking;
    return acc;
  }, {});

  return liveLocations.map((location) => {
    const isDriver = driverUserId === location.user_id;
    const profile = profileMap[location.user_id] ?? null;
    const booking = bookingLookup[location.user_id];
    const studentId = booking?.student_id ?? location.user_id;
    const attendanceStatus = attendanceLookup[studentId]?.status ?? "unknown";

    return {
      lat: location.latitude,
      lng: location.longitude,
      label: isDriver
        ? `${profile?.name ?? "Bus"} · Driver`
        : `${profile?.name ?? "Student"}${
            booking?.pickup_location ? ` · ${getDisplayName(booking.pickup_location)}` : ""
          }`,
      icon: isDriver ? "🚌" : attendanceStatus === "present" ? "🎒" : "⚠️",
      color: isDriver ? "green" : attendanceStatus === "present" ? "blue" : "orange",
    } satisfies MarkerData;
  });
}

function buildRoutePolyline(
  route: Tables<"routes">,
  routeOrder: string[],
  busLocation: LiveLocationRow | null
): [number, number][] {
  const base = busLocation
    ? { lat: busLocation.latitude, lng: busLocation.longitude }
    : getCoordinatesForLocation(route.start_location) ?? undefined;

  const waypoints = geocodeLocationList([route.start_location, ...routeOrder, route.end_location], base);
  const tuples = toLatLngTuples(waypoints);

  const routePoints = busLocation
    ? [[busLocation.latitude, busLocation.longitude] as [number, number], ...tuples]
    : tuples;

  return dedupeSequential(routePoints);
}

function dedupeSequential(points: [number, number][]): [number, number][] {
  if (points.length <= 1) {
    return points;
  }

  const result: [number, number][] = [points[0]];

  for (let i = 1; i < points.length; i++) {
    const [lat, lng] = points[i];
    const [prevLat, prevLng] = result[result.length - 1];

    if (Math.abs(lat - prevLat) > 0.0001 || Math.abs(lng - prevLng) > 0.0001) {
      result.push(points[i]);
    }
  }

  return result;
}

function computeEta(busLocation: LiveLocationRow | null, routePolyline: [number, number][]): string {
  if (!busLocation || routePolyline.length < 2) {
    return "Calculating...";
  }

  const busPoint: MapLocation = { lat: busLocation.latitude, lng: busLocation.longitude };

  let previous: MapLocation = busPoint;
  let totalDistance = 0;

  for (let i = 1; i < routePolyline.length; i++) {
    const [lat, lng] = routePolyline[i];
    const current: MapLocation = { lat, lng };
    totalDistance += calculateDistance(previous, current);
    previous = current;
  }

  if (totalDistance <= 0) {
    return "Arriving";
  }

  const etaMinutes = calculateETA(totalDistance, DEFAULT_SPEED_KMH);
  return formatETA(etaMinutes);
}

function computeUpcomingStops(stops: string[], busLocation: LiveLocationRow | null): string[] {
  if (!stops || stops.length === 0) {
    return [];
  }

  if (!busLocation) {
    return stops.slice(1);
  }

  const busPoint: MapLocation = { lat: busLocation.latitude, lng: busLocation.longitude };

  const remainingStops: string[] = [];

  const stopsToEvaluate = stops.slice(1);

  for (const stop of stopsToEvaluate) {
    const coords = getCoordinatesForLocation(stop);

    if (!coords) {
      remainingStops.push(stop);
      continue;
    }

    const distance = calculateDistance(busPoint, coords);

    if (distance > STOP_COMPLETION_RADIUS_KM) {
      remainingStops.push(stop);
    }
  }

  return remainingStops;
}
