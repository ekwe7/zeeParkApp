import React, { useState, useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import client from '../../api/client';
import { useTheme } from '../../contexts/ThemeContext';

export default function AllSpotsScreen({ navigation, route }) {
  const { theme } = useTheme();
  const { onSelect } = route.params || {};
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('available'); // 'available' | 'all'

  useEffect(() => {
    client.get('/api/admin/spots')
      .then(res => setSpots(res.data || []))
      .catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  const filtered = filter === 'available'
    ? spots.filter(s => s.available)
    : spots;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={theme.text} />
        </TouchableOpacity>
        <Text style={[styles.title, { color: theme.text }]}>Parking Spots</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Filter tabs */}
      <View style={[styles.filterRow, { backgroundColor: theme.surface }]}>
        {['available', 'all'].map(f => (
          <TouchableOpacity
            key={f}
            style={[styles.filterTab, filter === f && { backgroundColor: theme.primary }]}
            onPress={() => setFilter(f)}
          >
            <Text style={[styles.filterText, { color: filter === f ? '#fff' : theme.subtext }]}>
              {f === 'available' ? `Available (${spots.filter(s => s.available).length})` : `All (${spots.length})`}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={theme.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={s => s.id}
          contentContainerStyle={{ padding: 16, gap: 10 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.spotCard, { backgroundColor: theme.surface, borderColor: item.available ? theme.success : theme.border }]}
              onPress={() => {
                if (item.available && onSelect) {
                  onSelect(item);
                  navigation.goBack();
                }
              }}
              disabled={!item.available}
            >
              <View style={[styles.spotIcon, { backgroundColor: item.available ? theme.success + '20' : theme.border + '40' }]}>
                <Ionicons
                  name="location"
                  size={22}
                  color={item.available ? theme.success : theme.subtext}
                />
              </View>
              <View style={styles.spotInfo}>
                <Text style={[styles.spotId, { color: theme.text }]}>
                  Spot #{item.id?.slice(-6)?.toUpperCase()}
                </Text>
                <Text style={[styles.spotZone, { color: theme.subtext }]}>
                  Zone {item.zoneId?.slice(-6) || '—'}
                </Text>
              </View>
              <View style={[styles.statusBadge, { backgroundColor: item.available ? theme.success + '20' : theme.error + '20' }]}>
                <Text style={[styles.statusText, { color: item.available ? theme.success : theme.error }]}>
                  {item.available ? 'Free' : 'Taken'}
                </Text>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name="location-outline" size={40} color={theme.subtext} />
              <Text style={[styles.emptyText, { color: theme.subtext }]}>No spots found</Text>
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
  filterRow: { flexDirection: 'row', margin: 16, borderRadius: 10, padding: 4, gap: 4 },
  filterTab: { flex: 1, padding: 8, borderRadius: 8, alignItems: 'center' },
  filterText: { fontSize: 13, fontWeight: '600' },
  spotCard: { flexDirection: 'row', alignItems: 'center', borderRadius: 14, borderWidth: 1.5, padding: 14, gap: 12 },
  spotIcon: { width: 44, height: 44, borderRadius: 22, justifyContent: 'center', alignItems: 'center' },
  spotInfo: { flex: 1 },
  spotId: { fontSize: 15, fontWeight: '700' },
  spotZone: { fontSize: 12, marginTop: 2 },
  statusBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  statusText: { fontSize: 12, fontWeight: '600' },
  empty: { alignItems: 'center', marginTop: 60, gap: 12 },
  emptyText: { fontSize: 15 },
});
