import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { useNetwork } from '../../contexts/NetworkContext';
import OfflineBanner from '../../components/OfflineBanner';
import { getApiErrorMessage } from '../../utils/apiError';

export default function RegisterScreen({ navigation }) {
  const { register } = useAuth();
  const { theme } = useTheme();
  const { isConnected } = useNetwork();
  const [form, setForm] = useState({ username: '', password: '', email: '' });
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!isConnected) return Alert.alert('Offline', 'No internet connection');
    if (!form.username || !form.password || !form.email) {
      return Alert.alert('Error', 'Fill in all fields');
    }
    setLoading(true);
    try {
      await register(form.username, form.password, form.email);
      Alert.alert('Success', 'Account created. Please login.');
      navigation.navigate('Login');
    } catch (e) {
      Alert.alert('Registration failed', getApiErrorMessage(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <OfflineBanner />
      <Text style={[styles.title, { color: theme.text }]}>Create Account</Text>

      {['username', 'email', 'password'].map((field) => (
        <TextInput
          key={field}
          style={[styles.input, { borderColor: theme.border, color: theme.text, backgroundColor: theme.surface }]}
          placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          placeholderTextColor={theme.subtext}
          value={form[field]}
          onChangeText={(val) => setForm(prev => ({ ...prev, [field]: val }))}
          secureTextEntry={field === 'password'}
          autoCapitalize="none"
          keyboardType={field === 'email' ? 'email-address' : 'default'}
        />
      ))}

      <TouchableOpacity
        style={[styles.button, { backgroundColor: loading ? theme.border : theme.primary }]}
        onPress={handleRegister}
        disabled={loading}
      >
        <Text style={styles.buttonText}>{loading ? 'Creating...' : 'Register'}</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => navigation.navigate('Login')}>
        <Text style={[styles.link, { color: theme.primary }]}>Already have an account? Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 32 },
  input: { borderWidth: 1, borderRadius: 10, padding: 14, marginBottom: 16, fontSize: 16 },
  button: { padding: 16, borderRadius: 10, alignItems: 'center', marginBottom: 16 },
  buttonText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  link: { textAlign: 'center', fontSize: 14 },
});
