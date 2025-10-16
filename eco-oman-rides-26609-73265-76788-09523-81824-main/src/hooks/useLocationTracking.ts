import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

export const useLocationTracking = (routeId: string | null) => {
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!routeId) return;

    let watchId: number;

    // Get current position
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;
          setCurrentLocation({ lat: latitude, lng: longitude });

          // Update location in database
          try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            await supabase
              .from('live_locations')
              .upsert({
                user_id: user.id,
                route_id: routeId,
                latitude,
                longitude,
                updated_at: new Date().toISOString(),
              });
          } catch (err) {
            console.error('Error updating location:', err);
          }
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError('Unable to access location');
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      setError('Geolocation not supported');
    }

    return () => {
      if (watchId) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [routeId]);

  return { currentLocation, error };
};
