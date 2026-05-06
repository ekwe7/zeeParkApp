import React, { useState, useEffect } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  FlatList, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { useTheme } from '../../contexts/ThemeContext';
import SkeletonLoader from '../../components/SkeletonLoader';

export default function AdminSpotsScreen() {
  const { theme } = useTheme();
  const [zones, setZones] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedZone, setSelectedZone] = useState(null);
  const [selectedCat, setSelectedCat] = useState(null);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      client.get('/api/admin/zones'),
      client.get('/api/admin/spot-categories'),
    ]).then(([z, c]) => {
      setZones(z.data);
      setCategories(c.data);
      if (z.data.length) setSelectedZone(z.data[0]);
      if (c.data.length) setSelectedCat(c.data[0]);
    }).catch(console.log)
      .finally(() => setLoading(false));
  }, []);

  const createSpot = async () => {
    if (!selectedZone) return Alert.alert('Error', 'Select a zone');
    setSaving(true);
    try {
      await client.post('/api/admin/spots', {
        zoneId: selectedZone.id,
        categoryId: selectedCat?.id,
      });
      Alert.alert('Success', 'Spot created');
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Could not create spot');
    } finally { setSaving(false); }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
        <View style={{ padding: 16, gap: 10 }}>
          {[1, 2, 3].map(i => <SkeletonLoader key={i} height={60} />)}
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Parking Spots</Text>

      <View style={[styles.form, { backgroundColor: theme.surface }]}>
        <Text style={[styles.label, { color: theme.text }]}>Zone</Text>
        <FlatList
          horizontal
          data={zones}
          keyExtractor={z => z.id}
          contentContainerStyle={{ gap: 8, marginBottom: 12 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, { borderColor: selectedZone?.id === item.id ? theme.primary : theme.border, backgroundColor: selectedZone?.id === item.id ? theme.primary : 'transparent' }]}
              onPress={() => setSelectedZone(item)}
            >
              <Text style={{ color: selectedZone?.id === item.id ? '#fff' : theme.text, fontSize: 12 }}>{item.name}</Text>
            </TouchableOpacity>
          )}
        />

        <Text style={[styles.label, { color: theme.text }]}>Category</Text>
        <FlatList
          horizontal
          data={categories}
          keyExtractor={c => c.id}
          contentContainerStyle={{ gap: 8, marginBottom: 16 }}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[styles.chip, { borderColor: selectedCat?.id === item.id ? theme.primary : theme.border, backgroundColor: selectedCat?.id === item.id ? theme.primary : 'transparent' }]}
              onPress={() => setSelectedCat(item)}
            >
              <Text style={{ color: selectedCat?.id === item.id ? '#fff' : theme.text, fontSize: 12 }}>{item.type}</Text>
            </TouchableOpacity>
          )}
        />

        <TouchableOpacity style={[styles.btn, { backgroundColor: theme.primary }]} onPress={createSpot} disabled={saving}>
          <Text style={styles.btnText}>{saving ? 'Creating...' : 'Create Spot'}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 24, fontWeight: '700', padding: 16 },
  form: { margin: 16, padding: 16, borderRadius: 12 },
  label: { fontSize: 14, fontWeight: '600', marginBottom: 8 },
  chip: { borderWidth: 1.5, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 },
  btn: { padding: 14, borderRadius: 8, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '600' },
});
