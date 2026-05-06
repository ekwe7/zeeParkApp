import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, FlatList, Alert
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import client from '../../api/client';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import SkeletonLoader from '../../components/SkeletonLoader';
import OfflineBanner from '../../components/OfflineBanner';

const VEHICLE_TYPES = ['CAR', 'SUV', 'EV', 'BICYCLE'];

export default function VehicleScreen() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [numberPlate, setNumberPlate] = useState('');
  const [selectedType, setSelectedType] = useState('CAR');
  const [saving, setSaving] = useState(false);

  const fetchVehicles = async () => {
    if (!user?.id) { setLoading(false); return; }
    try {
      const res = await client.get(`/api/vehicles/my/${user.id}`);
      setVehicles(res.data);
    } catch (e) {
      console.log('Fetch vehicles error:', e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { if (user?.id) fetchVehicles(); }, [user?.id]);

  const registerVehicle = async () => {
    if (!numberPlate.trim()) return Alert.alert('Error', 'Enter a number plate');
    setSaving(true);
    try {
      await client.post('/api/vehicles', {
        numberPlate: numberPlate.trim().toUpperCase(),
        type: selectedType,
        customerId: user?.id,
      });
      setNumberPlate('');
      Alert.alert('Success', 'Vehicle registered');
      fetchVehicles();
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Could not register vehicle');
    } finally {
      setSaving(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
      <OfflineBanner />
      <Text style={[styles.title, { color: theme.text }]}>My Vehicles</Text>

      {/* Register form */}
      <View style={[styles.form, { backgroundColor: theme.surface }]}>
        <TextInput
          style={[styles.input, { borderColor: theme.border, color: theme.text }]}
          placeholder="Number plate (e.g. ABC-123)"
          placeholderTextColor={theme.subtext}
          value={numberPlate}
          onChangeText={setNumberPlate}
          autoCapitalize="characters"
        />
        <View style={styles.typeRow}>
          {VEHICLE_TYPES.map((type) => (
            <TouchableOpacity
              key={type}
              style={[
                styles.typeBtn,
                { borderColor: selectedType === type ? theme.primary : theme.border,
                  backgroundColor: selectedType === type ? theme.primary : 'transparent' }
              ]}
              onPress={() => setSelectedType(type)}
            >
              <Text style={{ color: selectedType === type ? '#fff' : theme.text, fontSize: 12 }}>
                {type}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: theme.primary }]}
          onPress={registerVehicle}
          disabled={saving}
        >
          <Text style={styles.addBtnText}>{saving ? 'Saving...' : 'Add Vehicle'}</Text>
        </TouchableOpacity>
      </View>

      {/* Vehicle list */}
      {loading ? (
        <View style={{ padding: 16, gap: 12 }}>
          {[1, 2, 3].map(i => <SkeletonLoader key={i} height={60} />)}
        </View>
      ) : (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id || item.numberPlate}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }) => (
            <View style={[styles.card, { backgroundColor: theme.surface }]}>
              <View>
                <Text style={[styles.plate, { color: theme.text }]}>{item.numberPlate}</Text>
                <Text style={[styles.type, { color: theme.primary }]}>{item.type}</Text>
              </View>
              <TouchableOpacity
                onPress={() => {
                  Alert.alert('Delete Vehicle', `Remove ${item.numberPlate}?`, [
                    { text: 'Cancel', style: 'cancel' },
                    {
                      text: 'Delete', style: 'destructive', onPress: async () => {
                        try {
                          await client.delete(`/api/vehicles/${item.numberPlate}`);
                          fetchVehicles();
                        } catch (e) {
                          Alert.alert('Error', e.response?.data?.error || 'Could not delete vehicle');
                        }
                      }
                    }
                  ]);
                }}
              >
                <Text style={[styles.deleteBtn, { color: theme.error }]}>Delete</Text>
              </TouchableOpacity>
            </View>
          )}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: theme.subtext }]}>No vehicles yet</Text>
          }
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
  typeRow: { flexDirection: 'row', gap: 8, marginBottom: 12, flexWrap: 'wrap' },
  typeBtn: { borderWidth: 1.5, borderRadius: 6, paddingHorizontal: 12, paddingVertical: 6 },
  addBtn: { padding: 14, borderRadius: 8, alignItems: 'center' },
  addBtnText: { color: '#fff', fontWeight: '600' },
  card: { borderRadius: 10, padding: 16, marginBottom: 10, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  plate: { fontSize: 16, fontWeight: '600' },
  type: { fontSize: 13, fontWeight: '500' },
  deleteBtn: { fontSize: 13, fontWeight: '600' },
  empty: { textAlign: 'center', marginTop: 32, fontSize: 15 },
});
