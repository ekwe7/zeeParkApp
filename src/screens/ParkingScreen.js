import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import client from '../api/client';
import { useTheme } from '../contexts/ThemeContext';

export default function ParkingScreen({ navigation }) {
  const { theme } = useTheme();
  const [vehicleId, setVehicleId] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [loading, setLoading] = useState(false);

  const startSession = async () => {
    if (!vehicleId) return Alert.alert('Error', 'Enter a vehicle ID');
    setLoading(true);
    try {
      const res = await client.post('/api/parking/start', { vehicleId });
      setSessionId(res.data.id);
      Alert.alert('Session started', `Session ID: ${res.data.id}`);
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Could not start session');
    } finally {
      setLoading(false);
    }
  };

  const endSession = async () => {
    if (!sessionId) return Alert.alert('Error', 'No active session');
    setLoading(true);
    try {
      const res = await client.post('/api/parking/end', { sessionId });
      Alert.alert('Session ended', `Duration: ${res.data.duration} mins`);
      navigation.navigate('Payment', { sessionId, duration: res.data.duration });
    } catch (e) {
      Alert.alert('Error', e.response?.data?.error || 'Could not end session');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Parking</Text>

      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text }]}
        placeholder="Vehicle ID"
        placeholderTextColor={theme.subtext}
        value={vehicleId}
        onChangeText={setVehicleId}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={startSession}
        disabled={loading}
      >
        <Text style={styles.buttonText}>Start Session</Text>
      </TouchableOpacity>

      {sessionId ? (
        <>
          <Text style={[styles.sessionId, { color: theme.subtext }]}>Active: {sessionId}</Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: theme.error }]}
            onPress={endSession}
            disabled={loading}
          >
            <Text style={styles.buttonText}>End Session</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 48 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  input: { borderWidth: 1, borderRadius: 8, padding: 14, marginBottom: 16, fontSize: 16 },
  button: { padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  sessionId: { fontSize: 13, marginBottom: 12 },
});
