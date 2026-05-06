import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL || 'http://localhost:8181';

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
});

// Attach token to every request automatically
client.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Activity tracker — call this to reset inactivity timer
let _resetTimer = null;
export const setActivityTracker = (fn) => { _resetTimer = fn; };

client.interceptors.response.use(
  (response) => {
    if (_resetTimer) _resetTimer();
    return response;
  },
  (error) => Promise.reject(error)
);

export default client;
