import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import MapView from '../../components/MapView';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useParkingSession } from '../../contexts/ParkingSessionContext';
import OfflineBanner from '../../components/OfflineBanner';
import client from '../../api/client';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { activeSession, formatElapsed } = useParkingSession();
  const [stats, setStats] = useState({ available: 0, total: 0 });

  useEffect(() => {
    client.get('/api/parking/spots')
      .then(res => {
        const all = res.data || [];
        setStats({ available: all.filter(s => s.available).length, total: all.length });
      }).catch(() => {});
  }, []);

  return (
    <View style={styles.container}>
      <OfflineBanner />
      <MapView style={StyleSheet.absoluteFill} />

      {/* Top greeting overlay */}
      <SafeAreaView style={styles.topOverlay} pointerEvents="box-none">
        <View style={[styles.greetingCard, { backgroundColor: theme.background }]}>
          <View>
            <Text style={[styles.greeting, { color: theme.text }]}>Hey, {user?.username} 👋</Text>
            <Text style={[styles.sub, { color: theme.subtext }]}>Find parking near you</Text>
          </View>
          <View style={[styles.avatarSmall, { backgroundColor: theme.primary }]}>
            <Text style={styles.avatarLetter}>{user?.username?.[0]?.toUpperCase()}</Text>
          </View>
        </View>

        {/* Active session banner */}
        {activeSession && (
          <TouchableOpacity
            style={[styles.activeBanner, { backgroundColor: theme.primary }]}
            onPress={() => navigation.navigate('Tickets')}
          >
            <Ionicons name="navigate-circle" size={20} color="#fff" />
            <Text style={styles.activeBannerText}>Session active — {formatElapsed()}</Text>
            <Ionicons name="chevron-forward" size={16} color="#fff" />
          </TouchableOpacity>
        )}
      </SafeAreaView>

      {/* Bottom card — stats + start button only */}
      <View style={[styles.bottomCard, { backgroundColor: theme.background }]}>
        <View style={styles.statsRow}>
          <View style={styles.stat}>
            <Ionicons name="checkmark-circle" size={20} color={theme.success} />
            <Text style={[styles.statLabel, { color: theme.subtext }]}>Available</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{stats.available} spots</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.stat}>
            <Ionicons name="location" size={20} color={theme.primary} />
            <Text style={[styles.statLabel, { color: theme.subtext }]}>Total</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>{stats.total} spots</Text>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.stat}>
            <Ionicons name="time" size={20} color="#F59E0B" />
            <Text style={[styles.statLabel, { color: theme.subtext }]}>Open</Text>
            <Text style={[styles.statValue, { color: theme.text }]}>24/7</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.parkBtn, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('Tickets')}
        >
          <Ionicons name="navigate-circle" size={22} color="#fff" />
          <Text style={styles.parkBtnText}>
            {activeSession ? 'View Active Session' : 'Start Parking'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  topOverlay: { position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, padding: 16, gap: 8 },
  greetingCard: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    borderRadius: 16, padding: 14,
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12, shadowRadius: 8, elevation: 4,
  },
  greeting: { fontSize: 17, fontWeight: '700' },
  sub: { fontSize: 12, marginTop: 2 },
  avatarSmall: { width: 38, height: 38, borderRadius: 19, justifyContent: 'center', alignItems: 'center' },
  avatarLetter: { color: '#fff', fontWeight: '700', fontSize: 16 },
  activeBanner: { flexDirection: 'row', alignItems: 'center', gap: 8, borderRadius: 12, padding: 12 },
  activeBannerText: { flex: 1, color: '#fff', fontWeight: '600', fontSize: 14 },
  bottomCard: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopLeftRadius: 24, borderTopRightRadius: 24,
    padding: 20, paddingBottom: 32,
    shadowColor: '#000', shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1, shadowRadius: 10, elevation: 10,
  },
  statsRow: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginBottom: 16 },
  stat: { alignItems: 'center', gap: 2 },
  statLabel: { fontSize: 11, marginTop: 2 },
  statValue: { fontSize: 13, fontWeight: '700' },
  divider: { width: 1, height: 40 },
  parkBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, padding: 16, borderRadius: 14 },
  parkBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
});
