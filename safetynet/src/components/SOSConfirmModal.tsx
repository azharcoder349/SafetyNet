"use client";

import { useSafetyContext } from "@/context/SafetyContext";
import { MapPin, Send, X, AlertTriangle } from "lucide-react";
import { useState, useEffect } from "react";

interface SOSConfirmModalProps {
  location: { lat: number; lng: number } | null;
  onClose: () => void;
}

export default function SOSConfirmModal({ location, onClose }: SOSConfirmModalProps) {
  const { contacts, activeSession } = useSafetyContext();
  const [manualLocation, setManualLocation] = useState("");
  const [messagePreview, setMessagePreview] = useState("");

  const mapLink = location 
    ? `https://maps.google.com/?q=${location.lat},${location.lng}` 
    : "";

  useEffect(() => {
    let msg = "URGENT SOS: I am feeling unsafe and need you to check on me.\n\n";
    if (activeSession) {
      msg += `Context: I was ${activeSession.activityLabel}.\n`;
    }
    if (mapLink) {
      msg += `My current live location: ${mapLink}\n`;
    } else if (manualLocation) {
      msg += `I am at/near: ${manualLocation}\n`;
    } else {
      msg += "Location unavailable.\n";
    }
    msg += "\nPlease contact me immediately. If I don't respond, send help.";
    setMessagePreview(msg);
  }, [location, manualLocation, activeSession, mapLink]);

  const handleSend = async () => {
    // Attempt native Web Share API first
    if (navigator.share) {
      try {
        await navigator.share({
          title: "SafetyNet URGENT SOS",
          text: messagePreview,
        });
        onClose();
        return;
      } catch (err) {
        console.log("Web Share API failed or cancelled", err);
      }
    }

    // Fallback: Use sms: or mailto: links
    if (contacts.length > 0) {
      // Create SMS link for the first contact with a phone number
      const phoneContact = contacts.find(c => c.phone);
      if (phoneContact && phoneContact.phone) {
        window.location.href = `sms:${phoneContact.phone}?body=${encodeURIComponent(messagePreview)}`;
        onClose();
        return;
      }
      
      const emailContact = contacts.find(c => c.email);
      if (emailContact && emailContact.email) {
        window.location.href = `mailto:${emailContact.email}?subject=SafetyNet URGENT SOS&body=${encodeURIComponent(messagePreview)}`;
        onClose();
        return;
      }
    }

    // If no contacts, try a generic sms scheme (user will pick contact in OS)
    window.location.href = `sms:?body=${encodeURIComponent(messagePreview)}`;
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-[100] flex items-center justify-center p-4">
      <div className="bg-white text-gray-900 rounded-xl shadow-xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-red-600 p-4 text-white flex justify-between items-center">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle /> Confirm SOS
          </h2>
          <button onClick={onClose} className="text-white/80 hover:text-white" aria-label="Cancel">
            <X size={24} />
          </button>
        </div>
        
        <div className="p-6 space-y-4">
          {!location && (
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700 block">
                GPS Unavailable. Enter location manually (optional):
              </label>
              <input
                type="text"
                placeholder="e.g. Corner of 5th and Main"
                value={manualLocation}
                onChange={(e) => setManualLocation(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2 focus:ring-2 focus:ring-red-500"
              />
            </div>
          )}

          {contacts.length === 0 && (
            <div className="bg-amber-100 text-amber-800 p-3 rounded-md text-sm">
              <strong>Note:</strong> You have no trusted contacts saved. 
              Sending will open your device's default share menu or messaging app.
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-semibold text-gray-700 block">Message Preview:</label>
            <div className="bg-gray-100 p-3 rounded-md text-sm whitespace-pre-wrap font-mono text-gray-800 border border-gray-200">
              {messagePreview}
            </div>
          </div>

          <button
            onClick={handleSend}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-bold text-lg py-4 rounded-xl flex justify-center items-center gap-2 transition-transform active:scale-95"
          >
            <Send size={24} />
            SEND SOS NOW
          </button>
          
          <p className="text-xs text-gray-500 text-center">
            This tool does not contact 911 directly. It sends the message above via your device.
          </p>
        </div>
      </div>
    </div>
  );
}
