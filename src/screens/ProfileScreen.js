import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Switch } from 'react-native';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export default function ProfileScreen() {
  const { user, logout } = useAuth();
  const { theme, isDark, toggleTheme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Profile</Text>

      <View style={[styles.card, { backgroundColor: theme.surface }]}>
        <Text style={[styles.name, { color: theme.text }]}>{user?.username}</Text>
        <Text style={[styles.email, { color: theme.subtext }]}>{user?.email}</Text>
        <Text style={[styles.role, { color: theme.primary }]}>{user?.role}</Text>
      </View>

      <View style={[styles.row, { borderColor: theme.border }]}>
        <Text style={[styles.rowLabel, { color: theme.text }]}>Dark Mode</Text>
        <Switch value={isDark} onValueChange={toggleTheme} />
      </View>

      <TouchableOpacity
        style={[styles.logoutBtn, { borderColor: theme.error }]}
        onPress={logout}
      >
        <Text style={[styles.logoutText, { color: theme.error }]}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, paddingTop: 48 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 24 },
  card: { borderRadius: 12, padding: 20, marginBottom: 24 },
  name: { fontSize: 20, fontWeight: '600', marginBottom: 4 },
  email: { fontSize: 14, marginBottom: 4 },
  role: { fontSize: 13, fontWeight: '500' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, marginBottom: 24 },
  rowLabel: { fontSize: 16 },
  logoutBtn: { borderWidth: 2, borderRadius: 8, padding: 16, alignItems: 'center' },
  logoutText: { fontWeight: '600', fontSize: 16 },
});
