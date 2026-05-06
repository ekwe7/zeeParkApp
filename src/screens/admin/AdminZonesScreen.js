import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { useTheme } from '../../contexts/ThemeContext';
import SkeletonLoader from '../../components/SkeletonLoader';

const LEVELS = ['L1', 'L2', 'BASEMENT'];

export default function AdminZonesScreen() {
  const { theme } = useTheme();
  const [zones, setZones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState('');
  const [level, setLevel] = useState('L1');
  const [saving, setSaving] = useState(false);

  const fetchZones = async () => {
    try {
      const res = await client.get('/api/admin/zones');
      setZones(res.data);
    } catch (e) { console.log(e.message); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchZones(); }, []);

  const createZone = async () => {
    if (!name.trim()) return Alert.alert('Error', 'Enter a zone name');
    setSaving(true);
    try {
      await client.post('/api/admin/zones', { name: name.trim(), level });
      setName('');
      fetchZones();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Could not create zone');
    } finally { setSaving(false); }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Parking Zones</Text>

      <View style={[styles.form, { backgroundColor: theme.surface }]}>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          placeholder="Zone name"
          placeholderTextColor={theme.subtext}
          value={name}
          onChangeText={setName}
        />
        <View style={styles.row}>
          {LEVELS.map(l => (
            <TouchableOpacity
              key={l}
              style={[styles.chip, { borderColor: level === l ? theme.primary : theme.border, backgroundColor: level === l ? theme.primary : 'transparent' }]}
              onPress={() => setLevel(l)}
            >
              <Text style={{ color: level === l ? '#fff' : theme.text, fontSize: 12 }}>{l}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={createZone} disabled={saving}>
          <Text style={styles.btnText}>{saving ? 'Creating...' : 'Create Zone'}</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <View style={{ padding: 16, gap: 10 }}>
          {[1, 2].map(i => <SkeletonLoader key={i} height={60} />)}
        </View>
      ) : (
        <FlatList
          data={zones}
          keyExtractor={z => z.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
              <View>
                <Text style={[styles.cardTitle, { color: theme.text }]}>{item.name}</Text>
                <Text style={[styles.cardSub, { color: theme.primary }]}>{item.level}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Delete Zone', `Delete "${item.name}"?`, [
                    { text: 'Cancel', style: 'cancel' },
                    { text: 'Delete', style: 'destructive', onPress: async () => {
                      try {
                        await client.delete(`/api/admin/zones/${item.id}`);
                        fetchZones();
                      } catch (e) {
                        Alert.alert('Error', e.response?.data?.error || 'Could not delete zone');
                      }
                    }}
                  ]);
                }}
              >
                <Text style={{ color: theme.error, fontSize: 13, fontWeight: '600' }}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={<Text style={[styles.empty, { color: theme.subtext }]}>No zones yet</Text>}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '700', padding: 16 },
  form: { margin: 16, padding: 16, borderRadius: 12 },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 12, fontSize: 15 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  chip: { borderWidth: 1.5, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 },
  btn: { padding: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
  card: { borderRadius: 10, padding: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  cardTitle: { fontSize: 16, fontWeight: '600' },
  cardSub: { fontSize: 13 },
  empty: { textAlign: 'center', marginTop: 32 },
});
