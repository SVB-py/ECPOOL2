const STORAGE_KEY = "driver-demo-routes";

export interface DemoRouteRecord {
  id: string;
  driverId: string;
  driverName: string;
  startLocation: string;
  endLocation: string;
  startTimeIso: string;
  seats: number;
  createdAt: string;
}

function safeParse(value: string | null): DemoRouteRecord[] {
  if (!value) {
    return [];
  }

  try {
    const parsed = JSON.parse(value) as DemoRouteRecord[];
    if (Array.isArray(parsed)) {
      return parsed.filter((route) => Boolean(route?.id && route?.startLocation && route?.endLocation));
    }
  } catch (error) {
    console.warn("Failed to parse demo route store", error);
  }

  return [];
}

export function getDemoRoutes(): DemoRouteRecord[] {
  if (typeof sessionStorage === "undefined") {
    return [];
  }

  return safeParse(sessionStorage.getItem(STORAGE_KEY));
}

function broadcastUpdate() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event("demo-routes:updated"));
  }
}

export function addDemoRoute(route: DemoRouteRecord): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  const existing = getDemoRoutes();
  const updated = existing.filter((item) => item.id !== route.id);
  updated.unshift(route);
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated.slice(0, 8)));
  broadcastUpdate();
}

export function clearDemoRoutes(): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }
  sessionStorage.removeItem(STORAGE_KEY);
  broadcastUpdate();
}
