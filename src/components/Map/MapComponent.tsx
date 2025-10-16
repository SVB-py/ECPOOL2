import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix Leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

export interface MarkerData {
  lat: number;
  lng: number;
  label?: string;
  color?: "blue" | "green" | "red" | "orange" | "gray";
  icon?: string;
  onClick?: () => void;
}

interface MapComponentProps {
  center?: [number, number];
  zoom?: number;
  markers?: MarkerData[];
  route?: [number, number][];
  className?: string;
  darkMode?: boolean;
}

export const MapComponent = ({
  center = [23.588, 58.3829], // Muscat, Oman
  zoom = 12,
  markers = [],
  route = [],
  className = "h-[500px] w-full",
  darkMode = false,
}: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  const routeLineRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    // Initialize map
    const map = L.map(mapRef.current).setView(center, zoom);

    // Add tile layer
    const tileUrl = darkMode
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}.png"
      : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";

    L.tileLayer(tileUrl, {
      maxZoom: 18,
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [center, zoom, darkMode]);

  // Update markers
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    markers.forEach((markerData) => {
      const marker = L.marker([markerData.lat, markerData.lng], {
        icon: createCustomIcon(markerData.icon || "📍", markerData.color),
      }).addTo(mapInstanceRef.current!);

      if (markerData.label) {
        marker.bindPopup(markerData.label);
      }

      if (markerData.onClick) {
        marker.on("click", markerData.onClick);
      }

      markersRef.current.push(marker);
    });

    // Fit bounds if markers exist
    if (markers.length > 0) {
      const bounds = L.latLngBounds(
        markers.map((m) => [m.lat, m.lng] as L.LatLngTuple)
      );
      mapInstanceRef.current.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [markers]);

  // Update route
  useEffect(() => {
    if (!mapInstanceRef.current) return;

    // Remove existing route
    if (routeLineRef.current) {
      routeLineRef.current.remove();
      routeLineRef.current = null;
    }

    // Add new route
    if (route.length > 0) {
      routeLineRef.current = L.polyline(route, {
        color: "#22c55e",
        weight: 4,
        opacity: 0.7,
      }).addTo(mapInstanceRef.current);
    }
  }, [route]);

  return <div ref={mapRef} className={className} />;
};

function createCustomIcon(emoji: string, color?: string): L.DivIcon {
  const colorClass =
    color === "blue"
      ? "bg-blue-500"
      : color === "green"
      ? "bg-green-500"
      : color === "red"
      ? "bg-red-500"
      : color === "orange"
      ? "bg-orange-500"
      : color === "gray"
      ? "bg-gray-500"
      : "bg-primary";

  return L.divIcon({
    html: `<div class="flex items-center justify-center w-10 h-10 ${colorClass} rounded-full text-white text-xl shadow-lg">${emoji}</div>`,
    className: "custom-marker",
    iconSize: [40, 40],
    iconAnchor: [20, 40],
  });
}
