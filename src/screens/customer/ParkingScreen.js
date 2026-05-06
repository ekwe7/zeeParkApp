import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, Alert, ScrollView, StatusBar
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useTheme } from '../../contexts/ThemeContext';
import { useParkingSession } from '../../contexts/ParkingSessionContext';
import { useAuth } from '../../contexts/AuthContext';
import SkeletonLoader from '../../components/SkeletonLoader';

export default function ParkingScreen({ navigation }) {
  const { theme, isDark } = useTheme();
  const { activeSession, formatElapsed, calculateCost, startSession, endSession } = useParkingSession();
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [selectedVehicle, setSelectedVehicle] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);

  // Dynamic colors based on theme
  const bg = theme.background;
  const card = theme.surface;
  const card2 = isDark ? '#1C2128' : '#F0F0F0';
  const subtext = theme.subtext;
  const border = theme.border;

  useEffect(() => {
    if (!user?.id) return;
    Promise.all([
      client.get(`/api/vehicles/my/${user.id}`),
      client.get('/api/payments').catch(() => ({ data: [] })),
    ]).then(([vRes, pRes]) => {
      setVehicles(vRes.data || []);
      setRecentActivity((pRes.data || []).slice(0, 5));
    }).catch(console.log)
      .finally(() => setLoading(false));
  }, [user?.id]);

  const startParkingSession = async () => {
    if (!selectedVehicle) return Alert.alert('Select a vehicle', 'Choose your vehicle first');
    setBusy(true);
    try {
      const res = await client.post('/api/parking/start', {
        vehicleId: selectedVehicle.id,
        preferredSpotId: null,
      });
      await startSession({ ...res.data, vehicleNumberPlate: selectedVehicle.numberPlate, vehicleBaseRate: selectedVehicle.baseRate });
      navigation.navigate('Ticket', { sessionId: res.data.id });
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Could not start session');
    } finally {
      setBusy(false);
    }
  };

  const endParkingSession = () => {
    Alert.alert('End Session', 'End this parking session and proceed to payment?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'End & Pay', style: 'destructive', onPress: async () => {
          setBusy(true);
          try {
            const res = await client.post('/api/parking/end', { sessionId: activeSession.id });
            await endSession();
            navigation.navigate('Payment', { sessionId: res.data.id, duration: res.data.duration });
          } catch (e) {
            Alert.alert('Error', e.response?.data?.error || 'Could not end session');
          } finally {
            setBusy(false);
          }
        }
      }
    ]);
  };

  const cost = calculateCost(activeSession?.vehicleBaseRate || 1200);

  return (
    <View style={[styles.container, { backgroundColor: bg }]}>
      <StatusBar barStyle={isDark ? 'light-content' : 'dark-content'} backgroundColor={bg} />
      <SafeAreaView style={{ flex: 1 }}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { color: theme.text }]}>zeePark</Text>
          <TouchableOpacity style={[styles.bellBtn, { backgroundColor: card }]}>
            <Ionicons name="notifications-outline" size={22} color={theme.text} />
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 32 }}>

          {/* Active Session Card */}
          {activeSession ? (
            <View style={styles.section}>
              <View style={styles.sectionHeaderRow}>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>Active Session</Text>
                <View style={[styles.liveBadge, { backgroundColor: card }]}>
                  <View style={styles.liveDot} />
                  <Text style={styles.liveText}>LIVE</Text>
                </View>
              </View>

              <View style={[styles.activeCard, { backgroundColor: card }]}>
                <View style={styles.activeCardTop}>
                  <View>
                    <Text style={[styles.activeCardLabel, { color: subtext }]}>VEHICLE</Text>
                    <Text style={[styles.activeCardValue, { color: theme.primary }]}>{activeSession.vehicleNumberPlate || activeSession.vehicleId?.slice(-8)}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={[styles.activeCardLabel, { color: subtext }]}>ZONE</Text>
                    <Text style={[styles.activeCardValue, { color: theme.primary }]}>Spot {activeSession.spotId?.slice(-6)?.toUpperCase()}</Text>
                  </View>
                </View>

                <View style={[styles.activeCardStats, { borderTopColor: border, borderTopWidth: 1 }]}>
                  <View style={styles.statBox}>
                    <Text style={[styles.statBoxLabel, { color: subtext }]}>ELAPSED</Text>
                    <Text style={[styles.statBoxValue, { color: theme.text }]}>{formatElapsed()}</Text>
                  </View>
                  <View style={[styles.statBox, { borderLeftWidth: 1, borderLeftColor: border }]}>
                    <Text style={[styles.statBoxLabel, { color: subtext }]}>COST</Text>
                    <Text style={[styles.statBoxValue, { color: theme.success }]}>₦{cost}</Text>
                  </View>
                </View>

                <TouchableOpacity
                  style={styles.endBtn}
                  onPress={endParkingSession}
                  disabled={busy}
                >
                  <Ionicons name="stop-circle" size={20} color="#fff" />
                  <Text style={styles.endBtnText}>{busy ? 'Ending...' : 'End Session'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          {/* Quick Start */}
          <View style={styles.section}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Quick Start</Text>

            {loading ? (
              <SkeletonLoader height={60} style={{ marginBottom: 12 }} />
            ) : vehicles.length === 0 ? (
              <TouchableOpacity
                style={[styles.addVehicleBtn, { backgroundColor: card }]}
                onPress={() => navigation.navigate('Vehicles')}
              >
                <Ionicons name="add-circle-outline" size={20} color={theme.primary} />
                <Text style={[styles.addVehicleText, { color: theme.primary }]}>Add a vehicle first</Text>
              </TouchableOpacity>
            ) : (
              <FlatList
                horizontal
                data={vehicles}
                keyExtractor={v => v.id || v.numberPlate}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, marginBottom: 12 }}
                renderItem={({ item }) => {
                  const sel = selectedVehicle?.numberPlate === item.numberPlate;
                  return (
                    <TouchableOpacity
                      style={[styles.vehicleChip,
                        { backgroundColor: sel ? theme.primary : card, borderColor: sel ? theme.primary : border }
                      ]}
                      onPress={() => setSelectedVehicle(sel ? null : item)}
                    >
                      <Ionicons name="car" size={16} color={sel ? '#fff' : subtext} />
                      <Text style={[styles.vehicleChipText, { color: sel ? '#fff' : subtext }]}>
                        {item.numberPlate}
                      </Text>
                    </TouchableOpacity>
                  );
                }}
              />
            )}

            <TouchableOpacity
              style={[styles.startNewBtn, { backgroundColor: theme.primary }, !selectedVehicle && { opacity: 0.5 }]}
              onPress={startParkingSession}
              disabled={busy || !selectedVehicle || !!activeSession}
            >
              <View>
                <Text style={styles.startNewTitle}>{busy ? 'Starting...' : 'Start New'}</Text>
                <Text style={styles.startNewSub}>FIND A PARKING SPOT NEARBY</Text>
              </View>
              <View style={styles.startNewIcon}>
                <Ionicons name="add-circle-outline" size={28} color="#fff" />
              </View>
            </TouchableOpacity>
          </View>

          {/* Recent Activity */}
          <View style={styles.section}>
            <View style={styles.sectionHeaderRow}>
              <Text style={[styles.sectionTitle, { color: theme.text }]}>Recent Activity</Text>
              <TouchableOpacity>
                <Text style={[styles.viewAll, { color: subtext }]}>VIEW ALL</Text>
              </TouchableOpacity>
            </View>

            {loading ? (
              <View style={{ gap: 8 }}>
                {[1, 2, 3].map(i => <SkeletonLoader key={i} height={60} />)}
              </View>
            ) : recentActivity.length === 0 ? (
              <View style={styles.noActivity}>
                <Ionicons name="time-outline" size={28} color={subtext} />
                <Text style={[styles.noActivityText, { color: subtext }]}>No recent activity</Text>
              </View>
            ) : (
              recentActivity.map(item => (
                <View key={item.id} style={[styles.activityItem, { backgroundColor: card }]}>
                  <View style={[styles.activityIcon, { backgroundColor: card2 }]}>
                    <Ionicons name="car" size={18} color={subtext} />
                  </View>
                  <View style={styles.activityInfo}>
                    <Text style={[styles.activityLabel, { color: theme.text }]}>
                      Spot {item.sessionId?.slice(-6)?.toUpperCase() || '—'}
                    </Text>
                    <Text style={[styles.activitySub, { color: subtext }]}>
                      {item.paidAt
                        ? `${new Date(item.paidAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} • ${item.currency}`
                        : 'Pending'}
                    </Text>
                  </View>
                  <Text style={[styles.activityAmount, { color: theme.text }]}>
                    ₦{item.amount}
                  </Text>
                </View>
              ))
            )}
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingHorizontal: 20, paddingVertical: 12 },
  headerTitle: { fontSize: 20, fontWeight: '800' },
  bellBtn: { width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center' },
  section: { paddingHorizontal: 20, marginBottom: 24 },
  sectionHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sectionTitle: { fontSize: 20, fontWeight: '800' },
  liveBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#4CAF50' },
  liveText: { color: '#4CAF50', fontSize: 11, fontWeight: '700' },
  viewAll: { fontSize: 12, fontWeight: '700', letterSpacing: 0.5 },
  activeCard: { borderRadius: 16, padding: 18, gap: 16 },
  activeCardTop: { flexDirection: 'row', justifyContent: 'space-between' },
  activeCardLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 },
  activeCardValue: { fontSize: 16, fontWeight: '700' },
  activeCardStats: { flexDirection: 'row', paddingTop: 12 },
  statBox: { flex: 1, paddingVertical: 12, paddingHorizontal: 8 },
  statBoxLabel: { fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginBottom: 4 },
  statBoxValue: { fontSize: 22, fontWeight: '800', letterSpacing: 1 },
  endBtn: { backgroundColor: '#C0392B', borderRadius: 12, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  endBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  vehicleChip: { flexDirection: 'row', alignItems: 'center', gap: 6, borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, borderWidth: 1 },
  vehicleChipText: { fontSize: 13, fontWeight: '600' },
  addVehicleBtn: { flexDirection: 'row', alignItems: 'center', gap: 8, padding: 14, borderRadius: 12, marginBottom: 12 },
  addVehicleText: { fontSize: 14, fontWeight: '600' },
  startNewBtn: { borderRadius: 16, padding: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  startNewTitle: { color: '#fff', fontSize: 24, fontWeight: '800' },
  startNewSub: { color: 'rgba(255,255,255,0.7)', fontSize: 11, fontWeight: '600', letterSpacing: 0.5, marginTop: 2 },
  startNewIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: 'rgba(255,255,255,0.15)', justifyContent: 'center', alignItems: 'center' },
  activityItem: { flexDirection: 'row', alignItems: 'center', borderRadius: 12, padding: 14, marginBottom: 8, gap: 12 },
  activityIcon: { width: 40, height: 40, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  activityInfo: { flex: 1 },
  activityLabel: { fontSize: 14, fontWeight: '600' },
  activitySub: { fontSize: 12, marginTop: 2 },
  activityAmount: { fontSize: 15, fontWeight: '700' },
  noActivity: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  noActivityText: { fontSize: 14 },
});
