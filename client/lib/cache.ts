import AsyncStorage from '@react-native-async-storage/async-storage';

export type Cached<T> = {
  data: T;
  updatedAt: string;
};

export const CacheKeys = {
  tasks: (userId: string) => `CACHE_TASKS_${userId}`,
  notes: (userId: string) => `CACHE_NOTES_${userId}`,
  projects: (userId: string) => `CACHE_PROJECTS_${userId}`,
  settings: (userId: string) => `CACHE_SETTINGS_${userId}`,
  queue: 'OFFLINE_QUEUE',
  idMap: 'OFFLINE_ID_MAP',
} as const;

export async function setCache<T>(key: string, value: T): Promise<void> {
  const wrapped: Cached<T> = { data: value, updatedAt: new Date().toISOString() };
  await AsyncStorage.setItem(key, JSON.stringify(wrapped));
}

export async function getCache<T>(key: string): Promise<T | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Cached<T>;
    return parsed.data;
  } catch (e) {
    // Fallback if old format
    try {
      return JSON.parse(raw) as T;
    } catch {
      return null;
    }
  }
}

export async function getCacheMeta<T>(key: string): Promise<Cached<T> | null> {
  const raw = await AsyncStorage.getItem(key);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as Cached<T>;
  } catch {
    return null;
  }
}
