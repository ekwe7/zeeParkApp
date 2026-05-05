import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function SpotMarker({ spot, onPress }) {
  const { theme } = useTheme();
  const color = spot.available ? theme.success : theme.error;

  return (
    <TouchableOpacity onPress={() => onPress(spot)}>
      <View style={[styles.marker, { backgroundColor: color }]}>
        <Text style={styles.label}>{spot.available ? 'Free' : 'Taken'}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  marker: { padding: 6, borderRadius: 6, minWidth: 50, alignItems: 'center' },
  label: { color: '#fff', fontWeight: '600', fontSize: 12 },
});
