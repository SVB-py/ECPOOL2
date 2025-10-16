import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export interface StudentStatsSummary {
  ridesTaken: number;
  hoursSaved: number;
  co2Saved: number;
}

export interface StudentWalletSummary {
  credits: number;
  tier: "Bronze" | "Silver" | "Gold";
  co2Saved: number;
}

export interface StudentRideSummary {
  booking: Tables<"bookings">;
  route: Tables<"routes">;
  driverName: string;
  seats: number;
  co2Saved: number;
  startTimeDisplay: string;
  status: "pending" | "active" | "completed";
}

export interface StudentDashboardPayload {
  profileName: string;
  stats: StudentStatsSummary;
  wallet: StudentWalletSummary;
  activeRides: StudentRideSummary[];
  upcomingRides: StudentRideSummary[];
  availableRides: StudentRideSummary[];
}

const timeFormatter = new Intl.DateTimeFormat("en-GB", {
  hour: "numeric",
  minute: "2-digit",
});

function formatTime(iso: string | null): string {
  if (!iso) {
    return "TBD";
  }
  const parsed = new Date(iso);
  if (Number.isNaN(parsed.getTime())) {
    return "TBD";
  }
  return timeFormatter.format(parsed);
}

function deriveTier(credits: number): StudentWalletSummary["tier"] {
  if (credits >= 2000) {
    return "Gold";
  }
  if (credits >= 1000) {
    return "Silver";
  }
  return "Bronze";
}

function estimateCo2Saved(count: number): number {
  return Number((count * 3.2).toFixed(1));
}

function normaliseRide(
  booking: Tables<"bookings"> & { routes?: Tables<"routes"> | null },
  route: Tables<"routes">,
  driverName: string,
  seats: number
): StudentRideSummary {
  const now = new Date();
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

  return {
    booking,
    route,
    driverName,
    seats,
    co2Saved: Number((3.2).toFixed(1)),
    startTimeDisplay: formatTime(route.start_time ?? booking.pickup_time),
    status,
  };
}

export async function fetchStudentDashboard(userId: string): Promise<StudentDashboardPayload> {
  const [{ data: profile, error: profileError }, { data: bookingsData, error: bookingsError }] = await Promise.all([
    supabase.from("profiles").select("name").eq("id", userId).maybeSingle(),
    supabase
      .from("bookings")
      .select("*, routes(*)")
      .eq("student_id", userId)
      .order("pickup_time", { ascending: true }),
  ]);

  if (profileError) {
    throw profileError;
  }

  if (bookingsError) {
    throw bookingsError;
  }

  const bookings = (bookingsData ?? []) as (Tables<"bookings"> & { routes?: Tables<"routes"> | null })[];
  const initialDriverIds = Array.from(new Set(bookings.map((booking) => booking.routes?.driver_id).filter(Boolean))) as string[];

  const { data: driversData, error: driversError } = initialDriverIds.length
    ? await supabase.from("drivers").select("*").in("id", initialDriverIds)
    : { data: [], error: null };

  if (driversError) {
    throw driversError;
  }

  const driverUserIdSet = new Set<string>();
  (driversData ?? []).forEach((driver) => {
    if (driver.user_id) {
      driverUserIdSet.add(driver.user_id);
    }
  });

  const initialDriverProfileIds = Array.from(driverUserIdSet);

  const { data: driverProfiles, error: driverProfilesError } = initialDriverProfileIds.length
    ? await supabase.from("profiles").select("id, name").in("id", initialDriverProfileIds)
    : { data: [], error: null };

  if (driverProfilesError) {
    throw driverProfilesError;
  }

  const driverById = new Map<string, Tables<"drivers">>();
  (driversData ?? []).forEach((driver) => {
    driverById.set(driver.id, driver as Tables<"drivers">);
  });

  const profileByUserId = new Map<string, string>();
  (driverProfiles ?? []).forEach((driverProfile) => {
    profileByUserId.set(driverProfile.id, driverProfile.name);
  });

  const rideSummaries: StudentRideSummary[] = bookings
    .filter((booking) => booking.routes)
    .map((booking) => {
      const route = booking.routes as Tables<"routes">;
  const driver = driverById.get(route.driver_id);
  const driverName = driver ? profileByUserId.get(driver.user_id) ?? "Driver" : "Driver";
  return normaliseRide(booking, route, driverName, 1);
    });

  const activeRides = rideSummaries.filter((ride) => ride.status === "active");
  const upcomingRides = rideSummaries.filter((ride) => ride.status === "pending");

  const ridesTaken = bookings.filter((booking) => booking.status === "completed").length;
  const stats: StudentStatsSummary = {
    ridesTaken,
    hoursSaved: Number((ridesTaken * 0.6).toFixed(1)),
    co2Saved: estimateCo2Saved(ridesTaken || rideSummaries.length),
  };

  const credits = Math.max(200, ridesTaken * 120 + upcomingRides.length * 40);
  const wallet: StudentWalletSummary = {
    credits,
    tier: deriveTier(credits),
    co2Saved: stats.co2Saved,
  };

  const nowIso = new Date().toISOString();
  const bookedRouteIds = new Set(rideSummaries.map((ride) => ride.route.id));

  const { data: availableRoutesData, error: availableRoutesError } = await supabase
    .from("routes")
    .select("*, bookings(*)")
    .gte("start_time", nowIso)
    .order("start_time", { ascending: true })
    .limit(6);

  if (availableRoutesError) {
    throw availableRoutesError;
  }

  const availableRoutes = (availableRoutesData ?? []) as (Tables<"routes"> & {
    bookings?: Tables<"bookings">[] | null;
  })[];

  const missingDriverIds = Array.from(
    new Set(
      availableRoutes
        .map((route) => route.driver_id)
        .filter((driverId) => driverId && !driverById.has(driverId))
    )
  ) as string[];

  if (missingDriverIds.length > 0) {
    const { data: extraDrivers, error: extraDriversError } = await supabase
      .from("drivers")
      .select("*")
      .in("id", missingDriverIds);

    if (extraDriversError) {
      throw extraDriversError;
    }

    (extraDrivers ?? []).forEach((driver) => {
      driverById.set(driver.id, driver as Tables<"drivers">);
      if (driver.user_id) {
        driverUserIdSet.add(driver.user_id);
      }
    });

    const newProfileIds = Array.from(driverUserIdSet).filter((id) => !profileByUserId.has(id));

    if (newProfileIds.length > 0) {
      const { data: extraProfiles, error: extraProfilesError } = await supabase
        .from("profiles")
        .select("id, name")
        .in("id", newProfileIds);

      if (extraProfilesError) {
        throw extraProfilesError;
      }

      (extraProfiles ?? []).forEach((profileRecord) => {
        profileByUserId.set(profileRecord.id, profileRecord.name);
      });
    }
  }

  const availableSummaries: StudentRideSummary[] = availableRoutes
    .filter((route) => !bookedRouteIds.has(route.id))
    .map((route) => {
      const driver = driverById.get(route.driver_id);
      const driverName = driver ? profileByUserId.get(driver.user_id) ?? "Driver" : "Driver";
      const capacity = route.passenger_count ?? driver?.vehicle_capacity ?? 6;
      const pseudoBooking: Tables<"bookings"> = {
        created_at: null,
        dropoff_location: route.end_location,
        id: `${route.id}-preview`,
        payment_amount: null,
        payment_status: null,
        pickup_location: route.start_location,
        pickup_time: route.start_time,
        route_id: route.id,
        status: "pending",
        student_id: userId,
      };

      const seats = Math.max(capacity - (route.bookings ?? []).length, 0);

      return normaliseRide(pseudoBooking, route, driverName, seats);
    });

  return {
    profileName: profile?.name ?? "Student",
    stats,
    wallet,
    activeRides,
    upcomingRides,
    availableRides: availableSummaries,
  };
}
