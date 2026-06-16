import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const API_BASE_URL = 'https://zeepark-api.onrender.com';

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  API_BASE_URL;

console.log('Using API Base URL:', BASE_URL);

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 60000, // 60 seconds for Render cold starts
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
  async (error) => {
    const config = error.config;
    // Retry once on timeout or network error (Render cold start)
    if (!config._retried && (error.code === 'ECONNABORTED' || !error.response)) {
      config._retried = true;
      return client(config);
    }
    return Promise.reject(error);
  }
);

export default client;
