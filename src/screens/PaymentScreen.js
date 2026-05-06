import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import client from '../api/client';
import { useTheme } from '../contexts/ThemeContext';

const METHODS = ['MASTERCARD', 'PAYPAL'];

export default function PaymentScreen({ route, navigation }) {
  const { theme } = useTheme();
  const { sessionId, duration } = route.params || {};
  const [selected, setSelected] = useState(null);
  const [loading, setLoading] = useState(false);

  const pay = async () => {
    if (!selected) return Alert.alert('Error', 'Select a payment method');
    setLoading(true);
    try {
      const res = await client.post('/api/payments', {
        sessionId,
        method: selected,
      });
      Alert.alert('Payment successful', `Amount: ${res.data.amount} ${res.data.currency}`);
      navigation.navigate('Home');
    } catch (e) {
      Alert.alert('Payment failed', e.response?.data?.error || 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Payment</Text>
      {duration && (
        <Text style={[styles.info, { color: theme.subtext }]}>Duration: {duration} mins</Text>
      )}

      <Text style={[styles.label, { color: theme.text }]}>Select payment method:</Text>
      {METHODS.map((method) => (
        <TouchableOpacity
          key={method}
          style={[
            styles.method,
            { borderColor: selected === method ? theme.primary : theme.border },
          ]}
          onPress={() => setSelected(method)}
        >
          <Text style={[styles.methodText, { color: theme.text }]}>{method}</Text>
        </TouchableOpacity>
      ))}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={pay}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Processing...' : 'Pay Now'}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 48 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  info: { fontSize: 14, marginBottom: 24 },
  label: { fontSize: 16, marginBottom: 12 },
  method: { borderWidth: 2, borderRadius: 8, padding: 14, marginBottom: 12 },
  methodText: { fontSize: 16, fontWeight: '500' },
  button: { padding: 16, borderRadius: 8, alignItems: 'center', marginTop: 8 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
