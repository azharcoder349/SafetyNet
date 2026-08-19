"use client";

import { useSafetyContext } from "@/context/SafetyContext";
import { Timer, X, Play } from "lucide-react";
import { useState, useEffect } from "react";
import SOSConfirmModal from "./SOSConfirmModal";
import { useGeolocation } from "@/hooks/useGeolocation";

export default function CheckInTimer() {
  const { appState, activeSession, startSession, cancelSession, timeRemaining, setAppState } = useSafetyContext();
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [label, setLabel] = useState("Walking home");
  const [minutes, setMinutes] = useState(15);
  const { getLocation } = useGeolocation();
  
  const [autoEscalateModal, setAutoEscalateModal] = useState(false);
  const [locationData, setLocationData] = useState<{lat: number; lng: number} | null>(null);

  // Auto-escalation listener
  useEffect(() => {
    if (timeRemaining === 0 && appState === "Alert" && activeSession) {
      // Timer just expired
      const triggerEscalation = async () => {
        try {
          const loc = await getLocation();
          setLocationData({ lat: loc.latitude, lng: loc.longitude });
        } catch (e) {
          console.warn("Location capture failed on auto-escalate");
        }
        setAutoEscalateModal(true);
      };
      triggerEscalation();
    }
  }, [timeRemaining, appState, activeSession]);

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (minutes > 0 && label) {
      startSession(label, minutes);
      setIsSetupOpen(false);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-md border border-white/20 shadow-sm text-foreground">
        {!activeSession ? (
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-300">
              <Timer size={32} />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Safety Timer</h2>
              <p className="text-sm opacity-80 mt-1">Set a check-in timer. If you don't cancel it, we'll alert your contacts.</p>
            </div>
            <button
              onClick={() => setIsSetupOpen(true)}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl transition-colors"
            >
              Start Check-In
            </button>
          </div>
        ) : (
          <div className="text-center space-y-4">
            <h2 className="text-lg font-medium opacity-80">{activeSession.activityLabel}</h2>
            <div className="text-6xl font-mono font-bold tracking-tighter">
              {timeRemaining !== null ? formatTime(timeRemaining) : "00:00"}
            </div>
            {appState === "Alert" ? (
              <div className="text-red-500 font-bold animate-pulse">TIMER EXPIRED</div>
            ) : (
              <button
                onClick={cancelSession}
                className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-4 rounded-xl transition-colors text-lg flex justify-center items-center gap-2"
              >
                <X size={24} />
                I'M SAFE (Cancel)
              </button>
            )}
          </div>
        )}
      </div>

      {/* Setup Modal */}
      {isSetupOpen && (
        <div className="fixed inset-0 bg-black/50 z-[100] flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 text-foreground rounded-xl shadow-xl w-full max-w-sm overflow-hidden p-6 animate-in fade-in zoom-in-95">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Timer /> Setup Check-In
            </h2>
            <form onSubmit={handleStart} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1 opacity-80">Activity</label>
                <input
                  type="text"
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1 opacity-80">Duration (Minutes)</label>
                <input
                  type="number"
                  min="1"
                  max="1440"
                  value={minutes}
                  onChange={(e) => setMinutes(parseInt(e.target.value))}
                 className="w-full border border-gray-300 dark:border-gray-700 rounded-md p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsSetupOpen(false)}
                  className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg flex justify-center items-center gap-2 transition-colors"
                >
                  <Play size={18} /> Start
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Auto-escalation Modal */}
      {autoEscalateModal && (
        <SOSConfirmModal
          location={locationData}
          onClose={() => {
            setAutoEscalateModal(false);
            cancelSession(); // Reset state after sending or dismissing
          }}
        />
      )}
    </>
  );
}
