import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import SkeletonLoader from '../../components/SkeletonLoader';

export default function AdminDashboardScreen() {
  const { user, logout } = useAuth();
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.get('/api/admin/zones'),
      client.get('/api/admin/spot-categories'),
      client.get('/api/vehicles'),
    ]).then(([zones, cats, vehicles]) => {
      setStats({
        zones: zones.data.length,
        categories: cats.data.length,
        vehicles: vehicles.data.length,
      });
    }).catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.text }]}>Admin Dashboard</Text>
        <TouchableOpacity onPress={logout}>
          <Text style={[styles.logout, { color: theme.error }]}>Logout</Text>
        </TouchableOpacity>
      </View>
      <Text style={[styles.sub, { color: theme.subtext }]}>Welcome, {user?.username}</Text>

      {loading ? (
        <View style={{ padding: 16, gap: 12 }}>
          {[1, 2, 3].map(i => <SkeletonLoader key={i} height={80} />)}
        </View>
      ) : (
        <View style={styles.statsGrid}>
          {[
            { label: 'Zones', value: stats?.zones },
            { label: 'Categories', value: stats?.categories },
            { label: 'Vehicles', value: stats?.vehicles },
          ].map(({ label, value }) => (
            <View key={label} style={[styles.statCard, { backgroundColor: theme.surface }]}>
              <Text style={[styles.statValue, { color: theme.primary }]}>{value}</Text>
              <Text style={[styles.statLabel, { color: theme.subtext }]}>{label}</Text>
            </View>
          ))}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 },
  title: { fontSize: 24, fontWeight: '700' },
  logout: { fontSize: 14, fontWeight: '600' },
  sub: { fontSize: 14, marginBottom: 24 },
  statsGrid: { flexDirection: 'row', gap: 12, flexWrap: 'wrap' },
  statCard: { flex: 1, minWidth: 100, borderRadius: 12, padding: 20, alignItems: 'center' },
  statValue: { fontSize: 32, fontWeight: '700' },
  statLabel: { fontSize: 13, marginTop: 4 },
});
