import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Calendar, CheckCircle, XCircle, MapPin, Clock, Loader2, Users, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

interface BookingWithRoute extends Tables<"bookings"> {
  routes?: Tables<"routes"> | null;
}

interface AttendanceRecord extends Tables<"attendance"> {}

interface RideEntry {
  booking: BookingWithRoute;
  route: Tables<"routes">;
  date: string;
  timeLabel: string;
}

type AttendanceStatus = "present" | "absent" | null;

type AttendanceMap = Record<string, AttendanceRecord>;

const getBookingDate = (booking: BookingWithRoute, route: Tables<"routes">): string => {
  const source = booking.pickup_time ?? route.start_time ?? route.created_at ?? new Date().toISOString();
  return source.split("T")[0];
};

const getBookingTimeLabel = (booking: BookingWithRoute, route: Tables<"routes">): string => {
  const source = booking.pickup_time ?? route.start_time;
  if (!source) {
    return "TBD";
  }
  const parsed = new Date(source);
  if (Number.isNaN(parsed.getTime())) {
    return "TBD";
  }
  return parsed.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
};

const StudentAttendance = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [userId, setUserId] = useState<string | null>(null);
  const [rides, setRides] = useState<RideEntry[]>([]);
  const [attendanceByKey, setAttendanceByKey] = useState<AttendanceMap>({});
  const [isLoading, setIsLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const loadData = async () => {
      setIsLoading(true);
      setErrorMessage(null);

      try {
        const { data: authResult, error: authError } = await supabase.auth.getUser();
        if (authError) {
          throw authError;
        }

        if (!authResult?.user) {
          navigate("/auth", { state: { role: "student" } });
          return;
        }

        if (!active) {
          return;
        }

        const currentUserId = authResult.user.id;
        setUserId(currentUserId);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const todayIso = today.toISOString();

        const { data: bookingsData, error: bookingsError } = await supabase
          .from("bookings")
          .select("*, routes(*)")
          .eq("student_id", currentUserId)
          .or(`pickup_time.gte.${todayIso},pickup_time.is.null`)
          .order("pickup_time", { ascending: true });

        if (bookingsError) {
          throw bookingsError;
        }

  const filteredBookings = ((bookingsData ?? []).filter((item) => item && item.routes) as BookingWithRoute[]);
        const newRides: RideEntry[] = filteredBookings.map((booking) => {
          const route = booking.routes as Tables<"routes">;
          const date = getBookingDate(booking, route);
          return {
            booking,
            route,
            date,
            timeLabel: getBookingTimeLabel(booking, route),
          };
        });

        const routeIds = Array.from(new Set(newRides.map((ride) => ride.route.id)));
        let attendanceMap: AttendanceMap = {};

        if (routeIds.length > 0) {
          const { data: attendanceData, error: attendanceError } = await supabase
            .from("attendance")
            .select("*")
            .eq("student_id", currentUserId)
            .in("route_id", routeIds)
            .order("date", { ascending: true });

          if (attendanceError) {
            throw attendanceError;
          }

          attendanceMap = (attendanceData ?? []).reduce<AttendanceMap>((acc, record) => {
            const key = `${record.route_id}_${record.date}`;
            acc[key] = record;
            return acc;
          }, {});
        }

        if (!active) {
          return;
        }

        setRides(newRides);
        setAttendanceByKey(attendanceMap);
      } catch (error) {
        console.error("Failed to load attendance data", error);
        if (active) {
          setErrorMessage("We could not load your attendance schedule. Please try again.");
        }
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    };

    loadData();

    return () => {
      active = false;
    };
  }, [navigate]);

  const groupedRides = useMemo(() => {
    return rides.reduce<Record<string, RideEntry[]>>((acc, ride) => {
      if (!acc[ride.date]) {
        acc[ride.date] = [];
      }
      acc[ride.date].push(ride);
      return acc;
    }, {});
  }, [rides]);

  const sortedDates = useMemo(() => Object.keys(groupedRides).sort(), [groupedRides]);

  const handleAttendance = async (ride: RideEntry, status: Exclude<AttendanceStatus, null>) => {
    if (!userId) {
      toast({
        title: "Sign in required",
        description: "Please sign in to update your attendance.",
        variant: "destructive",
      });
      return;
    }

    const key = `${ride.route.id}_${ride.date}`;
    setSavingKey(key);

    try {
      const existing = attendanceByKey[key];
      const payload = {
        student_id: userId,
        route_id: ride.route.id,
        date: ride.date,
        status,
        marked_at: new Date().toISOString(),
        location: existing?.location ?? null,
      };

      let nextRecord: AttendanceRecord | null = null;

      if (existing) {
        const { data, error } = await supabase
          .from("attendance")
          .update(payload)
          .eq("id", existing.id)
          .select("*")
          .maybeSingle();
        if (error) {
          throw error;
        }
        nextRecord = data ?? null;
      } else {
        const { data, error } = await supabase
          .from("attendance")
          .insert(payload)
          .select("*")
          .maybeSingle();
        if (error) {
          throw error;
        }
        nextRecord = data ?? null;
      }

      if (nextRecord) {
        setAttendanceByKey((prev) => ({
          ...prev,
          [key]: nextRecord!,
        }));
      }

      toast({
        title: status === "present" ? "Marked present" : "Marked absent",
        description: "We will keep your driver updated.",
      });

      const { data: allAttendance } = await supabase
        .from("attendance")
        .select("*")
        .eq("route_id", ride.route.id)
        .eq("date", ride.date);

      if (allAttendance && allAttendance.length > 0) {
        const { data: optimized, error: rerouteError } = await supabase.functions.invoke("ai-reroute", {
          body: {
            routeId: ride.route.id,
            attendance: allAttendance,
          },
        });

        if (!rerouteError && optimized) {
          toast({
            title: "Route optimized",
            description: `Time saved: ${optimized.timeSaved}, Distance saved: ${optimized.distanceSaved}`,
          });
        }
      }
    } catch (error) {
      console.error("Failed to update attendance", error);
      toast({
        title: "Could not update",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSavingKey(null);
    }
  };

  const getStatusForRide = (ride: RideEntry): AttendanceStatus => {
    const existing = attendanceByKey[`${ride.route.id}_${ride.date}`];
    return existing?.status ? (existing.status as AttendanceStatus) : null;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading your attendance schedule...</p>
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4 text-center px-6">
        <Calendar className="w-12 h-12 text-destructive" />
        <p className="text-muted-foreground">{errorMessage}</p>
        <Button variant="outline" onClick={() => navigate(-1)}>
          Go back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6 pb-24 md:pb-8">
      <div className="container mx-auto max-w-5xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <Users className="w-7 h-7 text-primary" />
              Plan Your Attendance
            </h1>
            <p className="text-muted-foreground">
              Let your driver know which days you will be riding. AI will adapt the route to save time and CO₂.
            </p>
          </div>
          <Button variant="outline" onClick={() => navigate("/student")}>Back to dashboard</Button>
        </div>

        {sortedDates.length === 0 ? (
          <Card className="glass-card p-8 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">No upcoming rides found</h2>
            <p className="text-muted-foreground mb-4">Once you book a ride it will show up here for attendance planning.</p>
            <Button variant="hero" onClick={() => navigate("/request-ride")}>Find rides</Button>
          </Card>
        ) : (
          sortedDates.map((date) => (
            <Card key={date} className="glass-card p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Calendar className="w-5 h-5 text-primary" />
                  <div>
                    <h2 className="text-xl font-semibold">{new Date(date).toLocaleDateString(undefined, { weekday: "long", month: "short", day: "numeric" })}</h2>
                    <p className="text-sm text-muted-foreground">Tap a ride to set your attendance for this day.</p>
                  </div>
                </div>
                <Badge variant="secondary">{groupedRides[date].length} rides</Badge>
              </div>

              <div className="space-y-4">
                {groupedRides[date].map((ride) => {
                  const status = getStatusForRide(ride);
                  const isSaving = savingKey === `${ride.route.id}_${ride.date}`;
                  return (
                    <Card key={ride.booking.id} className="glass-card border border-border/50">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 p-5">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Clock className="w-4 h-4" />
                            <span>{ride.timeLabel}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <MapPin className="w-4 h-4 text-primary" />
                            <span className="font-medium">{ride.route.start_location}</span>
                            <span className="text-muted-foreground">→</span>
                            <span className="font-medium">{ride.route.end_location}</span>
                          </div>
                        </div>

                        <div className="flex flex-col md:flex-row gap-3 md:items-center">
                          <div className="flex items-center gap-2">
                            {status === "present" && (
                              <Badge variant="default" className="bg-green-500/10 text-green-500 border-green-500/20 flex items-center gap-1">
                                <CheckCircle className="w-4 h-4" /> Riding
                              </Badge>
                            )}
                            {status === "absent" && (
                              <Badge variant="secondary" className="bg-red-500/10 text-red-500 border-red-500/20 flex items-center gap-1">
                                <XCircle className="w-4 h-4" /> Not riding
                              </Badge>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <Button
                              variant={status === "present" ? "hero" : "default"}
                              onClick={() => handleAttendance(ride, "present")}
                              disabled={isSaving}
                            >
                              {isSaving && status !== "present" ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : null}
                              I'm riding
                            </Button>
                            <Button
                              variant={status === "absent" ? "outline" : "secondary"}
                              onClick={() => handleAttendance(ride, "absent")}
                              disabled={isSaving}
                            >
                              {isSaving && status !== "absent" ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                              ) : null}
                              Not today
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            </Card>
          ))
        )}

        <Card className="glass-card p-6 bg-gradient-glow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-3">
              <Sparkles className="w-6 h-6 text-accent" />
              <div>
                <h2 className="text-lg font-semibold">Why attendance matters</h2>
                <p className="text-sm text-muted-foreground">Drivers use your attendance to reroute buses, avoid empty stops, and reduce CO₂.</p>
              </div>
            </div>
            <Button variant="hero" onClick={() => navigate("/live-tracking")}>View live bus map</Button>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default StudentAttendance;
