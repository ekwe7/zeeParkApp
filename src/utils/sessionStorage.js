import * as SecureStore from 'expo-secure-store';

const SESSION_KEY = 'active_parking_session';

export const saveActiveSession = async (session) => {
  await SecureStore.setItemAsync(SESSION_KEY, JSON.stringify(session));
};

export const getActiveSession = async () => {
  const data = await SecureStore.getItemAsync(SESSION_KEY);
  return data ? JSON.parse(data) : null;
};

export const clearActiveSession = async () => {
  await SecureStore.deleteItemAsync(SESSION_KEY);
};
