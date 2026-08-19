"use client";

import { useState } from "react";

interface LocationData {
  latitude: number | null;
  longitude: number | null;
  error: string | null;
  loading: boolean;
}

export function useGeolocation() {
  const [location, setLocation] = useState<LocationData>({
    latitude: null,
    longitude: null,
    error: null,
    loading: false,
  });

  const getLocation = (): Promise<{ latitude: number; longitude: number }> => {
    return new Promise((resolve, reject) => {
      setLocation((prev) => ({ ...prev, loading: true, error: null }));
      
      if (!navigator.geolocation) {
        const errorMsg = "Geolocation is not supported by your browser.";
        setLocation({ latitude: null, longitude: null, error: errorMsg, loading: false });
        reject(new Error(errorMsg));
        return;
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setLocation({ latitude, longitude, error: null, loading: false });
          resolve({ latitude, longitude });
        },
        (err) => {
          let errorMsg = "Failed to retrieve location.";
          if (err.code === 1) errorMsg = "Location access denied.";
          if (err.code === 2) errorMsg = "Location unavailable.";
          if (err.code === 3) errorMsg = "Location request timed out.";
          
          setLocation({ latitude: null, longitude: null, error: errorMsg, loading: false });
          reject(new Error(errorMsg));
        },
        { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
      );
    });
  };

  return { location, getLocation };
}
