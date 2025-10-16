import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export interface RideSearchParams {
  from?: string;
  to?: string;
  date?: string;
  time?: string;
  riders?: number;
  womenOnly?: boolean;
  studentsOnly?: boolean;
  parentsOnly?: boolean;
  verifiedOnly?: boolean;
  schoolRoutesOnly?: boolean;
}

export interface RideSearchResult {
  route: Tables<"routes">;
  bookings: Tables<"bookings">[];
  driver: Tables<"drivers"> | null;
  driverName: string;
  driverAvatar: string | null;
  driverRating: number | null;
  vehicleLabel: string;
  routeMatchScore: number;
  availableSeats: number;
  totalSeats: number;
  pickupTimeDisplay: string;
  pricePerSeat: number;
}

export interface RideSearchOptions {
  startLocations: string[];
  endLocations: string[];
}

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
});

function normaliseString(value?: string | null): string {
  return (value ?? "").trim().toLowerCase();
}

function computeTimeWindow(date?: string, time?: string): { startIso: string; endIso: string | null } {
  const now = new Date();

  if (!date) {
    return { startIso: now.toISOString(), endIso: null };
  }

  const base = new Date(date);
  if (Number.isNaN(base.getTime())) {
    return { startIso: now.toISOString(), endIso: null };
  }

  if (time) {
    const [hour, minute] = time.split(":").map((part) => Number(part));
    if (!Number.isNaN(hour)) {
      base.setHours(hour, Number.isNaN(minute) ? 0 : minute, 0, 0);
    }

    const endWindow = new Date(base.getTime() + 2 * 60 * 60 * 1000);
    return { startIso: base.toISOString(), endIso: endWindow.toISOString() };
  }

  const dayStart = new Date(base);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(base);
  dayEnd.setHours(23, 59, 59, 999);

  return { startIso: dayStart.toISOString(), endIso: dayEnd.toISOString() };
}

function computeRouteMatchScore(route: Tables<"routes">, params: RideSearchParams): number {
  let score = 100;

  if (params.from) {
    const target = normaliseString(params.from);
    const routeFrom = normaliseString(route.start_location);
    if (!routeFrom.includes(target)) {
      score -= 25;
    }
  }

  if (params.to) {
    const target = normaliseString(params.to);
    const routeTo = normaliseString(route.end_location);
    if (!routeTo.includes(target)) {
      score -= 25;
    }
  }

  if (params.schoolRoutesOnly) {
    const routeTo = normaliseString(route.end_location);
    if (!routeTo.includes("school")) {
      score -= 20;
    }
  }

  return Math.max(40, score);
}

function matchesPreference(driver: Tables<"drivers"> | null, route: Tables<"routes">, params: RideSearchParams): boolean {
  const driverStatus = normaliseString(driver?.status);
  const routeName = normaliseString(route.route_name);
  const toLocation = normaliseString(route.end_location);

  if (params.womenOnly && !(driverStatus.includes("women") || routeName.includes("women"))) {
    return false;
  }

  if (params.studentsOnly && !(routeName.includes("student") || toLocation.includes("school"))) {
    return false;
  }

  if (params.parentsOnly && !driverStatus.includes("parent")) {
    return false;
  }

  if (params.verifiedOnly && !(driverStatus.includes("verified") || (driver?.rating ?? 0) >= 4.5)) {
    return false;
  }

  if (params.schoolRoutesOnly && !toLocation.includes("school")) {
    return false;
  }

  return true;
}

function derivePricePerSeat(route: Tables<"routes">, capacity: number): number {
  if (route.estimated_earnings && capacity > 0) {
    const inferred = Math.max(1, Math.round(route.estimated_earnings / capacity));
    return inferred;
  }
  return 2;
}

export async function fetchRideSearchOptions(): Promise<RideSearchOptions> {
  const { data, error } = await supabase
    .from("routes")
    .select("start_location, end_location")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    throw error;
  }

  const startSet = new Set<string>();
  const endSet = new Set<string>();

  (data ?? []).forEach((row) => {
    if (row.start_location) {
      startSet.add(row.start_location);
    }
    if (row.end_location) {
      endSet.add(row.end_location);
    }
  });

  const startLocations = Array.from(startSet).sort((a, b) => a.localeCompare(b));
  const endLocations = Array.from(endSet).sort((a, b) => a.localeCompare(b));

  return { startLocations, endLocations };
}

export async function searchAvailableRides(params: RideSearchParams): Promise<RideSearchResult[]> {
  const { startIso, endIso } = computeTimeWindow(params.date, params.time);

  let query = supabase
    .from("routes")
    .select("*, bookings(*)")
    .gte("start_time", startIso)
    .order("start_time", { ascending: true });

  if (endIso) {
    query = query.lte("start_time", endIso);
  }

  if (params.from) {
    query = query.ilike("start_location", `%${params.from}%`);
  }

  if (params.to) {
    query = query.ilike("end_location", `%${params.to}%`);
  }

  const { data: routesData, error: routesError } = await query;

  if (routesError) {
    throw routesError;
  }

  const routes = (routesData ?? []) as (Tables<"routes"> & { bookings?: Tables<"bookings">[] | null })[];

  if (routes.length === 0) {
    return [];
  }

  const driverIds = Array.from(new Set(routes.map((route) => route.driver_id).filter(Boolean)));

  let driversData: Tables<"drivers">[] = [];
  if (driverIds.length > 0) {
    const { data, error } = await supabase.from("drivers").select("*").in("id", driverIds);
    if (error) {
      throw error;
    }
    driversData = (data ?? []) as Tables<"drivers">[];
  }

  const driverUserIds = Array.from(new Set(driversData.map((driver) => driver.user_id).filter(Boolean)));

  let profilesData: { id: string; name: string; avatar_url: string | null }[] = [];
  if (driverUserIds.length > 0) {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .in("id", driverUserIds);
    if (error) {
      throw error;
    }
    profilesData = (data ?? []) as { id: string; name: string; avatar_url: string | null }[];
  }

  const driverById = new Map<string, Tables<"drivers">>();
  driversData.forEach((driver) => {
    driverById.set(driver.id, driver);
  });

  const profilesById = new Map<string, { id: string; name: string; avatar_url: string | null }>();
  profilesData.forEach((profile) => {
    profilesById.set(profile.id, profile);
  });

  return routes
    .map((route) => {
      if (route.status === "completed") {
        return null;
      }

      const driver = driverById.get(route.driver_id) ?? null;
      const driverProfile = driver ? profilesById.get(driver.user_id) ?? null : null;
      const bookings = route.bookings ?? [];
      const capacity = Math.max(route.passenger_count ?? driver?.vehicle_capacity ?? 6, 0);
      const seatsUsed = bookings.length;
      const availableSeats = Math.max(capacity - seatsUsed, 0);

      if (params.riders && availableSeats < params.riders) {
        return null;
      }

      if (!matchesPreference(driver, route, params)) {
        return null;
      }

      if (availableSeats === 0) {
        return null;
      }

      const pricePerSeat = derivePricePerSeat(route, capacity || 1);

      return {
        route,
        bookings,
        driver,
        driverName: driverProfile?.name ?? "Driver",
        driverAvatar: driverProfile?.avatar_url ?? null,
        driverRating: driver?.rating ?? null,
  vehicleLabel: driver ? [driver.vehicle_model, driver.vehicle_number].filter(Boolean).join(" • ") || "Vehicle" : "Vehicle",
        routeMatchScore: computeRouteMatchScore(route, params),
        availableSeats,
        totalSeats: capacity,
        pickupTimeDisplay: timeFormatter.format(new Date(route.start_time)),
        pricePerSeat,
      } satisfies RideSearchResult | null;
    })
    .filter(Boolean) as RideSearchResult[];
}
