import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export interface DriverDashboardStats {
  ridesOffered: number;
  ecoCredits: number;
  ecoTrend: string;
  co2SavedKg: number;
  rating: number | null;
}

export interface DriverRouteSummary {
  id: string;
  routeName: string;
  from: string;
  to: string;
  startTimeDisplay: string;
  status: "pending" | "active" | "completed";
  seatsBooked: number;
  capacity: number | null;
  co2SavedKg: number;
  route: Tables<"routes">;
}

export interface DriverDashboardPayload {
  profileName: string;
  stats: DriverDashboardStats;
  activeRoutes: DriverRouteSummary[];
  upcomingRoutes: DriverRouteSummary[];
  onboarding: boolean;
}

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
});

function formatTime(iso: string | null): string {
  if (!iso) {
    return "TBD";
  }
  const timestamp = new Date(iso);
  if (Number.isNaN(timestamp.getTime())) {
    return "TBD";
  }
  return timeFormatter.format(timestamp);
}

function normaliseDriverRoute(
  route: Tables<"routes"> & { bookings?: Tables<"bookings">[] | null },
  driverCapacity: number | null,
  now: Date
): DriverRouteSummary {
  const bookings = route.bookings ?? [];
  const startTime = route.start_time ? new Date(route.start_time) : null;
  const status = ((): "pending" | "active" | "completed" => {
    if (route.status === "active" || route.status === "pending" || route.status === "completed") {
      return route.status;
    }
    if (!startTime) {
      return "pending";
    }
    if (startTime <= now) {
      return "active";
    }
    return "pending";
  })();

  const seatsBooked = bookings.length;
  const capacity = driverCapacity ?? route.passenger_count ?? null;
  const co2SavedKg = Number((seatsBooked * 0.45).toFixed(1));

  return {
    id: route.id,
    routeName: route.route_name,
    from: route.start_location,
    to: route.end_location,
    startTimeDisplay: formatTime(route.start_time),
    status,
    seatsBooked,
    capacity,
    co2SavedKg,
    route,
  };
}

export async function fetchDriverDashboard(userId: string): Promise<DriverDashboardPayload> {
  const [{ data: profile, error: profileError }, { data: driver, error: driverError }] = await Promise.all([
    supabase.from("profiles").select("name").eq("id", userId).maybeSingle(),
    supabase.from("drivers").select("*").eq("user_id", userId).maybeSingle(),
  ]);

  if (profileError) {
    throw profileError;
  }

  if (driverError) {
    throw driverError;
  }

  if (!driver) {
    return {
      profileName: profile?.name ?? "Driver",
      stats: {
        ridesOffered: 0,
        ecoCredits: 200,
        ecoTrend: "Offer your first eco ride",
        co2SavedKg: 0,
        rating: null,
      },
      activeRoutes: [],
      upcomingRoutes: [],
      onboarding: true,
    };
  }

  const { data: routesData, error: routesError } = await supabase
    .from("routes")
    .select("*, bookings(*)")
    .eq("driver_id", driver.id)
    .order("start_time", { ascending: true });

  if (routesError) {
    throw routesError;
  }

  const now = new Date();
  const routes = (routesData ?? []) as (Tables<"routes"> & { bookings?: Tables<"bookings">[] | null })[];
  const summaries = routes.map((route) => normaliseDriverRoute(route, driver.vehicle_capacity ?? null, now));

  const activeRoutes = summaries.filter((summary) => summary.status === "active");
  const upcomingRoutes = summaries.filter((summary) => summary.status !== "completed" && summary.status !== "active");

  const co2SavedTotal = summaries.reduce((acc, summary) => acc + summary.co2SavedKg, 0);

  const stats: DriverDashboardStats = {
    ridesOffered: summaries.length,
    ecoCredits: driver.eco_credits ?? summaryEcoCredits(driver.eco_credits, summaries.length),
    ecoTrend: activeRoutes.length > 0 ? `+${activeRoutes.length} trips live` : `Next in ${upcomingRoutes[0]?.startTimeDisplay ?? "TBD"}`,
    co2SavedKg: Number(co2SavedTotal.toFixed(1)),
    rating: driver.rating,
  };

  return {
    profileName: profile?.name ?? "Driver",
    stats,
    activeRoutes,
    upcomingRoutes,
    onboarding: false,
  };
}

function summaryEcoCredits(currentCredits: number | null, totalRoutes: number): number {
  if (typeof currentCredits === "number") {
    return currentCredits;
  }
  const base = totalRoutes * 120;
  return Math.max(200, base);
}
