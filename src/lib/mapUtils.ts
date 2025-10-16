// Map utility functions for route optimization and calculations

export interface Location {
  lat: number;
  lng: number;
  name?: string;
}

/**
 * Calculate distance between two points using Haversine formula
 * Returns distance in kilometers
 */
export function calculateDistance(point1: Location, point2: Location): number {
  const R = 6371; // Earth's radius in km
  const dLat = toRad(point2.lat - point1.lat);
  const dLng = toRad(point2.lng - point1.lng);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(point1.lat)) *
      Math.cos(toRad(point2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Calculate ETA based on distance and average speed
 * Returns time in minutes
 */
export function calculateETA(distanceKm: number, avgSpeedKmh: number = 40): number {
  return Math.round((distanceKm / avgSpeedKmh) * 60);
}

/**
 * Check if a point is within a given radius from center
 */
export function isWithinRadius(
  point: Location,
  center: Location,
  radiusKm: number
): boolean {
  return calculateDistance(point, center) <= radiusKm;
}

/**
 * Format distance for display
 */
export function formatDistance(km: number): string {
  if (km < 1) {
    return `${Math.round(km * 1000)}m`;
  }
  return `${km.toFixed(1)} km`;
}

/**
 * Format ETA for display
 */
export function formatETA(minutes: number): string {
  if (minutes < 60) {
    return `${minutes} mins`;
  }
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

/**
 * Optimize route using nearest neighbor algorithm
 * Returns reordered array of locations
 */
export function optimizeRoute(
  start: Location,
  stops: Location[],
  end: Location
): Location[] {
  if (stops.length === 0) return [start, end];
  
  const unvisited = [...stops];
  const route: Location[] = [start];
  let current = start;
  
  while (unvisited.length > 0) {
    let nearest = unvisited[0];
    let nearestIndex = 0;
    let nearestDist = calculateDistance(current, nearest);
    
    for (let i = 1; i < unvisited.length; i++) {
      const dist = calculateDistance(current, unvisited[i]);
      if (dist < nearestDist) {
        nearest = unvisited[i];
        nearestIndex = i;
        nearestDist = dist;
      }
    }
    
    route.push(nearest);
    current = nearest;
    unvisited.splice(nearestIndex, 1);
  }
  
  route.push(end);
  return route;
}

/**
 * Get center point of multiple locations
 */
export function getCenterPoint(locations: Location[]): Location {
  if (locations.length === 0) {
    return { lat: 23.588, lng: 58.3829 }; // Default to Muscat
  }
  
  const sum = locations.reduce(
    (acc, loc) => ({
      lat: acc.lat + loc.lat,
      lng: acc.lng + loc.lng,
    }),
    { lat: 0, lng: 0 }
  );
  
  return {
    lat: sum.lat / locations.length,
    lng: sum.lng / locations.length,
  };
}
