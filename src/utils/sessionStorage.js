import * as SecureStore from 'expo-secure-store';

const SESSION_KEY_PREFIX = 'active_parking_session_';
const sessionKeyFor = (userId) => `${SESSION_KEY_PREFIX}${userId}`;

export const saveActiveSession = async (session, userId) => {
  if (!userId) return;
  await SecureStore.setItemAsync(sessionKeyFor(userId), JSON.stringify(session));
};

export const getActiveSession = async (userId) => {
  if (!userId) return null;
  const data = await SecureStore.getItemAsync(sessionKeyFor(userId));
  return data ? JSON.parse(data) : null;
};

export const clearActiveSession = async (userId) => {
  if (!userId) return;
  await SecureStore.deleteItemAsync(sessionKeyFor(userId));
};
