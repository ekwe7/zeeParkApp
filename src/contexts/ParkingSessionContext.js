import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { AppState } from 'react-native';
import { saveActiveSession, getActiveSession, clearActiveSession } from '../utils/sessionStorage';
import { useAuth } from './AuthContext';

const ParkingSessionContext = createContext();

export function ParkingSessionProvider({ children }) {
  const { user } = useAuth();
  const [activeSession, setActiveSession] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const timerRef = useRef(null);

  // Restore session only for the currently logged-in user
  useEffect(() => {
    // Reset state immediately when user changes
    setActiveSession(null);
    setElapsed(0);

    if (!user?.id) return;

    (async () => {
      const saved = await getActiveSession();
      if (saved && saved.userId === user.id) {
        setActiveSession(saved);
        const entryTime = new Date(saved.entryTime).getTime();
        setElapsed(Math.floor((Date.now() - entryTime) / 1000));
      } else {
        // No session or belongs to different user — clear it
        await clearActiveSession();
      }
    })();
  }, [user?.id]);

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
      userId: user?.id,  // tie session to current user
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
