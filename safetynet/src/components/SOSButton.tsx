"use client";

import { useSafetyContext } from "@/context/SafetyContext";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import SOSConfirmModal from "./SOSConfirmModal";
import { useGeolocation } from "@/hooks/useGeolocation";

export default function SOSButton() {
  const { setAppState, contacts } = useSafetyContext();
  const { getLocation } = useGeolocation();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [locationData, setLocationData] = useState<{lat: number; lng: number} | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);

  const handleSOSClick = async () => {
    // 1. Visually escalate state immediately
    setAppState("Alert");
    
    // 2. Capture location
    setIsCapturing(true);
    try {
      const loc = await getLocation();
      setLocationData({ lat: loc.latitude, lng: loc.longitude });
    } catch (err) {
      console.warn("Location capture failed during SOS, proceeding without location.");
    } finally {
      setIsCapturing(false);
      setIsModalOpen(true);
    }
  };

  return (
    <>
      <button
        onClick={handleSOSClick}
        disabled={isCapturing}
        className="fixed bottom-6 right-6 w-16 h-16 bg-red-600 hover:bg-red-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-95 z-50 animate-pulse focus:outline-none focus:ring-4 focus:ring-red-300"
        aria-label="Send SOS Alert"
      >
        <AlertCircle size={32} />
      </button>

      {isModalOpen && (
        <SOSConfirmModal
          location={locationData}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}
