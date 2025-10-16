import { supabase } from "@/integrations/supabase/client";
import type { Tables } from "@/integrations/supabase/types";

export interface RouteContext {
  route: Tables<"routes">;
  driver: Tables<"drivers"> | null;
  bookings: Tables<"bookings">[];
  attendance: Tables<"attendance">[];
  liveLocations: Tables<"live_locations">[];
  profileMap: Record<string, { name: string | null; avatar_url: string | null }>;
}

export async function fetchRouteContext(routeId: string): Promise<RouteContext> {
  const { data: route, error: routeError } = await supabase
    .from("routes")
    .select("*")
    .eq("id", routeId)
    .maybeSingle();

  if (routeError) {
    throw routeError;
  }

  if (!route) {
    throw new Error("Route not found");
  }

  const { data: driver, error: driverError } = await supabase
    .from("drivers")
    .select("*")
    .eq("id", route.driver_id)
    .maybeSingle();

  if (driverError) {
    throw driverError;
  }

  const [{ data: bookings, error: bookingsError }, { data: attendance, error: attendanceError }, { data: liveLocations, error: liveError }] = await Promise.all([
    supabase.from("bookings").select("*").eq("route_id", routeId),
    supabase
      .from("attendance")
      .select("*")
      .eq("route_id", routeId)
      .order("marked_at", { ascending: false }),
    supabase.from("live_locations").select("*").eq("route_id", routeId),
  ]);

  if (bookingsError) {
    throw bookingsError;
  }

  if (attendanceError) {
    throw attendanceError;
  }

  if (liveError) {
    throw liveError;
  }

  const userIds = new Set<string>();

  if (driver?.user_id) {
    userIds.add(driver.user_id);
  }

  bookings?.forEach((booking) => {
    if (booking.student_id) {
      userIds.add(booking.student_id);
    }
  });

  liveLocations?.forEach((location) => {
    if (location.user_id) {
      userIds.add(location.user_id);
    }
  });

  let profileMap: RouteContext["profileMap"] = {};

  if (userIds.size > 0) {
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, name, avatar_url")
      .in("id", Array.from(userIds));

    if (profilesError) {
      throw profilesError;
    }

    profileMap = (profiles || []).reduce<RouteContext["profileMap"]>((acc, profile) => {
      acc[profile.id] = {
        name: profile.name,
        avatar_url: profile.avatar_url,
      };
      return acc;
    }, {});
  }

  return {
    route,
    driver: driver ?? null,
    bookings: bookings ?? [],
    attendance: attendance ?? [],
    liveLocations: liveLocations ?? [],
    profileMap,
  };
}
