import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { saveActiveSession, getActiveSession, clearActiveSession } from '../utils/sessionStorage';

const ParkingSessionContext = createContext();

export function ParkingSessionProvider({ children }) {
  const [activeSession, setActiveSession] = useState(null);
  const [elapsed, setElapsed] = useState(0); // seconds since session started
  const timerRef = useRef(null);

  // Restore session on app start
  useEffect(() => {
    (async () => {
      const saved = await getActiveSession();
      if (saved) {
        setActiveSession(saved);
        // Calculate elapsed time from entry time
        const entryTime = new Date(saved.entryTime).getTime();
        const now = Date.now();
        setElapsed(Math.floor((now - entryTime) / 1000));
      }
    })();
  }, []);

  // Start/stop timer when session changes
  useEffect(() => {
    if (activeSession) {
      timerRef.current = setInterval(() => {
        setElapsed(prev => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setElapsed(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeSession]);

  const startSession = async (session) => {
    const sessionWithTime = {
      ...session,
      entryTime: session.entryTime || new Date().toISOString(),
    };
    setActiveSession(sessionWithTime);
    setElapsed(0);
    await saveActiveSession(sessionWithTime);
  };

  const endSession = async () => {
    setActiveSession(null);
    setElapsed(0);
    await clearActiveSession();
  };

  // Format elapsed as HH:MM:SS
  const formatElapsed = () => {
    const h = Math.floor(elapsed / 3600);
    const m = Math.floor((elapsed % 3600) / 60);
    const s = elapsed % 60;
    return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Calculate running cost based on vehicle base rate
  const calculateCost = (baseRatePerHour = 1200) => {
    const hours = elapsed / 3600;
    return (baseRatePerHour * hours).toFixed(2);
  };

  return (
    <ParkingSessionContext.Provider value={{
      activeSession,
      elapsed,
      formatElapsed,
      calculateCost,
      startSession,
      endSession,
    }}>
      {children}
    </ParkingSessionContext.Provider>
  );
}

export const useParkingSession = () => useContext(ParkingSessionContext);
