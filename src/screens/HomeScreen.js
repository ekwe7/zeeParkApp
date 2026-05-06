import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import MapView from '../components/MapView';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function HomeScreen({ navigation }) {
  const { user } = useAuth();
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: theme.text }]}>Hey, {user?.username} 👋</Text>
      </View>

      <View style={styles.map}>
        <MapView />
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: theme.primary }]}
          onPress={() => navigation.navigate('Parking')}
        >
          <Text style={styles.actionText}>Start Parking</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: { padding: 16, paddingTop: 48 },
  greeting: { fontSize: 20, fontWeight: '600' },
  map: { flex: 1 },
  actions: { padding: 16 },
  actionBtn: { padding: 16, borderRadius: 8, alignItems: 'center' },
  actionText: { color: '#fff', fontWeight: '600', fontSize: 16 },
});
