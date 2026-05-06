import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';

export default function AdminLoginScreen({ navigation }) {
  const { login } = useAuth();
  const { theme } = useTheme();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!username || !password) return Alert.alert('Error', 'Fill in all fields');
    setLoading(true);
    try {
      const user = await login(username, password);
      if (user.role !== 'ADMIN') {
        Alert.alert('Access denied', 'This login is for admins only');
        // logout immediately if not admin
      }
    } catch (e) {
      Alert.alert('Login failed', e.response?.data?.error || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <Text style={[styles.title, { color: theme.text }]}>Admin Access</Text>
      <Text style={[styles.subtitle, { color: theme.subtext }]}>Restricted area</Text>

      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }]}
        placeholder="Admin username"
        placeholderTextColor={theme.subtext}
        value={username}
        onChangeText={setUsername}
        autoCapitalize="none"
      />
      <TextInput
        style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }]}
        placeholder="Password"
        placeholderTextColor={theme.subtext}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#B00020' }]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Verifying...' : 'Admin Login'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.goBack()}>
        <Text style={[styles.link, { color: theme.subtext }]}>← Back</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 4 },
  subtitle: { fontSize: 14, marginBottom: 32 },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 16 },
  button: { padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { textAlign: 'center', fontSize: 14 },
});
