import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useNetwork } from '../contexts/NetworkContext';

export default function OfflineBanner() {
  const { isConnected } = useNetwork();
  if (isConnected) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.text}>No internet connection</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#B00020',
    padding: 8,
    alignItems: 'center',
  },
  text: { color: '#fff', fontSize: 13, fontWeight: '600' },
});
