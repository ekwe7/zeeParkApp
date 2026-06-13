import axios from 'axios';
import { Platform } from 'react-native';
import Constants from 'expo-constants';
import * as SecureStore from 'expo-secure-store';

const LOCAL_HOST_URL = 'http://10.67.91.91:8181';
const DEFAULT_BASE_URL = Platform.OS === 'android'
  ? (Constants.isDevice ? LOCAL_HOST_URL : 'http://10.0.2.2:8181')
  : (Constants.isDevice ? LOCAL_HOST_URL : 'http://localhost:8181');

const EXPO_CONFIG_BASE_URL =
  Constants.expoConfig?.extra?.apiBaseUrl ||
  Constants.manifest?.extra?.apiBaseUrl;

const BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  process.env.API_BASE_URL ||
  EXPO_CONFIG_BASE_URL ||
  DEFAULT_BASE_URL;

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
