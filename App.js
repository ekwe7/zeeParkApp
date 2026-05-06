import React, { useEffect } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider, useAuth } from './src/contexts/AuthContext';
import { ThemeProvider } from './src/contexts/ThemeContext';
import { NetworkProvider } from './src/contexts/NetworkContext';
import { ParkingSessionProvider } from './src/contexts/ParkingSessionContext';
import { setActivityTracker } from './src/api/client';
import AppNavigator from './src/navigation/AppNavigator';

function AppWithTracker() {
  const { resetInactivityTimer } = useAuth();
  useEffect(() => {
    setActivityTracker(resetInactivityTimer);
  }, [resetInactivityTimer]);
  return <AppNavigator />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <NetworkProvider>
          <ParkingSessionProvider>
            <AuthProvider>
              <AppWithTracker />
            </AuthProvider>
          </ParkingSessionProvider>
        </NetworkProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
