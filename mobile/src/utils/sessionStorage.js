import AsyncStorage from '@react-native-async-storage/async-storage';

const SESSION_PREFIX = 'dm_sessions_';

export async function loadSessions(username) {
  try {
    const raw = await AsyncStorage.getItem(`${SESSION_PREFIX}${username}`);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function saveSessions(username, sessions) {
  try {
    await AsyncStorage.setItem(`${SESSION_PREFIX}${username}`, JSON.stringify(sessions));
  } catch {
    // Silently fail on storage errors
  }
}

export async function clearSessions(username) {
  try {
    await AsyncStorage.removeItem(`${SESSION_PREFIX}${username}`);
  } catch {
    // ignore
  }
}

export function createDefaultSession() {
  const id = `sess_${Date.now()}`;
  return { id, title: 'New Chat', history: [], files: [] };
}
