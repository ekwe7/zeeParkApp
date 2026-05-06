import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

export default function LandingScreen({ navigation }) {
  const { theme } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>ZeePark</Text>
      <Text style={[styles.subtitle, { color: theme.subtext }]}>Smart parking, simplified</Text>

      <TouchableOpacity
        style={[styles.button, { backgroundColor: theme.primary }]}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.outline, { borderColor: theme.primary }]}
        onPress={() => navigation.navigate('Register')}
      >
        <Text style={[styles.outlineText, { color: theme.primary }]}>Create Account</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  title: { fontSize: 40, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 16, marginBottom: 48 },
  button: { width: '100%', padding: 16, borderRadius: 8, alignItems: 'center', marginBottom: 12 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  outline: { width: '100%', padding: 16, borderRadius: 8, alignItems: 'center', borderWidth: 2 },
  outlineText: { fontWeight: '600', fontSize: 16 },
});
