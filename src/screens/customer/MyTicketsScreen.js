import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function MyTicketsScreen({ navigation }) {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      client.get(`/api/tickets/my/${user.id}`)
        .then(res => setTickets(res.data || []))
        .catch(console.log)
        .finally(() => setLoading(false));
    }
  }, [user?.id]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>My Tickets</Text>
        <View style={{ width: 24 }} />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={tickets}
          keyExtractor={t => t.id}
          contentContainerStyle={{ padding: 16, gap: 12 }}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
              <View style={[styles.iconWrap, { backgroundColor: theme.primary + '20' }]}>
                <Ionicons name="ticket" size={24} color={theme.primary} />
              </View>
              <View style={styles.info}>
                <Text style={[styles.plate, { color: theme.text }]}>
                  {item.vehicleNumberPlate || 'Unknown Vehicle'}
                </Text>
                <Text style={[styles.session, { color: theme.subtext }]}>
                  Session: {item.sessionId?.slice(-8)?.toUpperCase()}
                </Text>
                <Text style={[styles.date, { color: theme.subtext }]}>
                  {item.issuedAt ? new Date(item.issuedAt).toLocaleString() : '—'}
                </Text>
              </View>
              <View style={[styles.badge, { backgroundColor: theme.success + '20' }]}>
                <Text style={[styles.badgeText, { color: theme.success }]}>ISSUED</Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="ticket-outline" size={48} color={theme.subtext} />
              <Text style={[styles.emptyText, { color: theme.subtext }]}>No tickets yet</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 16 },
  title: { fontSize: 18, fontWeight: '700' },
  card: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, padding: 14, gap: 12 },
  iconWrap: { width: 48, height: 48, borderRadius: 24, justifyContent: 'center', alignItems: 'center' },
  info: { flex: 1 },
  plate: { fontSize: 16, fontWeight: '700' },
  session: { fontSize: 12, marginTop: 2 },
  date: { fontSize: 12, marginTop: 2 },
  badge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontWeight: '700' },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 15 },
});
