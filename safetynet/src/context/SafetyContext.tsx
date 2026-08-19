"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type AppState = "Safe" | "Monitoring" | "Alert";

interface CheckInSession {
  id: string;
  activityLabel: string;
  durationMinutes: number;
  startedAt: number; // timestamp
}

export interface Contact {
  id: string;
  name: string;
  phone?: string;
  email?: string;
}

interface SafetyContextType {
  appState: AppState;
  setAppState: (state: AppState) => void;
  activeSession: CheckInSession | null;
  startSession: (label: string, minutes: number) => void;
  cancelSession: () => void;
  contacts: Contact[];
  addContact: (contact: Contact) => void;
  removeContact: (id: string) => void;
  timeRemaining: number | null; // seconds
}

const SafetyContext = createContext<SafetyContextType | undefined>(undefined);

export function SafetyProvider({ children }: { children: ReactNode }) {
  const [appState, setAppState] = useState<AppState>("Safe");
  const [activeSession, setActiveSession] = useState<CheckInSession | null>(null);
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [timeRemaining, setTimeRemaining] = useState<number | null>(null);

  // Load contacts from local storage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem("safetynet_contacts");
      if (stored) setContacts(JSON.parse(stored));
    } catch (err) {
      console.error(err);
    }
  }, []);

  // Save contacts to local storage when changed
  useEffect(() => {
    localStorage.setItem("safetynet_contacts", JSON.stringify(contacts));
  }, [contacts]);

  // Timer tick logic
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (activeSession && appState === "Monitoring") {
      interval = setInterval(() => {
        const now = Date.now();
        const expiryTime = activeSession.startedAt + activeSession.durationMinutes * 60 * 1000;
        const remaining = Math.floor((expiryTime - now) / 1000);
        
        if (remaining <= 0) {
          setTimeRemaining(0);
          setAppState("Alert");
          clearInterval(interval);
        } else {
          setTimeRemaining(remaining);
        }
      }, 1000);
    } else {
      setTimeRemaining(null);
    }
    return () => clearInterval(interval);
  }, [activeSession, appState]);

  const startSession = (label: string, minutes: number) => {
    setActiveSession({
      id: Date.now().toString(),
      activityLabel: label,
      durationMinutes: minutes,
      startedAt: Date.now(),
    });
    setAppState("Monitoring");
  };

  const cancelSession = () => {
    setActiveSession(null);
    setAppState("Safe");
  };

  const addContact = (contact: Contact) => setContacts([...contacts, contact]);
  const removeContact = (id: string) => setContacts(contacts.filter((c) => c.id !== id));

  useEffect(() => {
    // Update document body class based on appState for global CSS styling
    document.body.className = `state-${appState.toLowerCase()}`;
  }, [appState]);

  return (
    <SafetyContext.Provider
      value={{
        appState,
        setAppState,
        activeSession,
        startSession,
        cancelSession,
        contacts,
        addContact,
        removeContact,
        timeRemaining,
      }}
    >
      {children}
    </SafetyContext.Provider>
  );
}

export function useSafetyContext() {
  const context = useContext(SafetyContext);
  if (context === undefined) {
    throw new Error("useSafetyContext must be used within a SafetyProvider");
  }
  return context;
}
