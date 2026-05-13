import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import * as SplashScreen from 'expo-splash-screen';
import { AppState } from 'react-native';
import client from '../api/client';
import { clearActiveSession } from '../utils/sessionStorage';

SplashScreen.preventAutoHideAsync();

const AuthContext = createContext();

const INACTIVITY_TIMEOUT = 2 * 60 * 1000;

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const inactivityTimer = useRef(null);

  const clearSession = useCallback(async () => {
    await client.post('/api/auth/logout').catch(() => {});
    await SecureStore.deleteItemAsync('token');
    await SecureStore.deleteItemAsync('user');
    // Preserve the active parking session across logout so it can still be completed or paid later.
    // The session is cleared only when the user explicitly ends it in ParkingSessionContext.
    setToken(null);
    setUser(null);
    setIsLoggedIn(false);
  }, [user?.id]);

  const resetInactivityTimer = useCallback(() => {
    if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    inactivityTimer.current = setTimeout(() => {
      clearSession();
    }, INACTIVITY_TIMEOUT);
  }, [clearSession]);

  // Handle app state changes
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (state) => {
      if (state === 'active' && isLoggedIn) {
        // App came to foreground — reset inactivity timer
        resetInactivityTimer();
      } else if (state === 'background' || state === 'inactive') {
        // App minimized — log out immediately
        if (isLoggedIn) {
          if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
          clearSession();
        }
      }
    });
    return () => subscription.remove();
  }, [isLoggedIn, resetInactivityTimer, clearSession]);

  // Start timer when logged in
  useEffect(() => {
    if (isLoggedIn) {
      resetInactivityTimer();
    } else {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    }
    return () => {
      if (inactivityTimer.current) clearTimeout(inactivityTimer.current);
    };
  }, [isLoggedIn, resetInactivityTimer]);

  // Hydrate token on startup
  useEffect(() => {
    (async () => {
      try {
        const savedToken = await SecureStore.getItemAsync('token');
        const savedUser = await SecureStore.getItemAsync('user');
        if (savedToken && savedUser) {
          setToken(savedToken);
          setUser(JSON.parse(savedUser));
          setIsLoggedIn(true);
        }
      } catch (e) {
        console.log('Auth hydration error:', e);
      } finally {
        setIsLoading(false);
        await SplashScreen.hideAsync();
      }
    })();
  }, []);

  const login = async (username, password) => {
    const res = await client.post('/api/auth/login', { username, password });
    const { token, ...userData } = res.data;
    await SecureStore.setItemAsync('token', token);
    await SecureStore.setItemAsync('user', JSON.stringify(userData));
    setToken(token);
    setUser(userData);
    setIsLoggedIn(true);
    return userData;
  };

  const register = async (username, password, email, role = 'CUSTOMER') => {
    const res = await client.post('/api/users/register', { username, password, email, role });
    return res.data;
  };

  const logout = async () => {
    await clearSession();
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, isLoggedIn, login, register, logout, resetInactivityTimer }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
