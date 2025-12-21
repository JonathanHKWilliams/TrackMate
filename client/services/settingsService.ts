import { supabase } from '../lib/supabase';
import { UserSettings, UserSettingsInput, DEFAULT_SETTINGS } from '../types/settings';
import { getCache, setCache, CacheKeys } from '../lib/cache';
import { isOnline, isNetworkError } from '../lib/network';
import { optimisticInsert, optimisticUpdate } from '../lib/offlineQueue';

export const getUserSettings = async (userId: string): Promise<UserSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', userId)
      .single();
    if (error) throw error;
    if (data) await setCache(CacheKeys.settings(userId), data);
    return data;
  } catch (error) {
    if (isNetworkError(error)) {
      const cached = await getCache<UserSettings>(CacheKeys.settings(userId));
      return cached || null;
    }
    console.error('Error fetching user settings:', error);
    return null;
  }
};

export const createUserSettings = async (userId: string): Promise<UserSettings> => {
  const base = { ...DEFAULT_SETTINGS } as any;
  if (!isOnline()) {
    return optimisticInsert<UserSettings>('user_settings', userId, base, CacheKeys.settings(userId));
  }
  const { data, error } = await supabase
    .from('user_settings')
    .insert({ user_id: userId, ...base })
    .select()
    .single();
  if (error) throw error;
  await setCache(CacheKeys.settings(userId), data);
  return data;
};

export const updateUserSettings = async (
  userId: string,
  updates: UserSettingsInput
): Promise<UserSettings> => {
  if (!isOnline()) {
    return optimisticUpdate<UserSettings>('user_settings', userId, userId, updates, CacheKeys.settings(userId));
  }
  const { data, error } = await supabase
    .from('user_settings')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single();
  if (error) throw error;
  await setCache(CacheKeys.settings(userId), data);
  return data;
};

export const getOrCreateUserSettings = async (userId: string): Promise<UserSettings> => {
  let settings = await getUserSettings(userId);
  
  if (!settings) {
    settings = await createUserSettings(userId);
  }
  
  return settings;
};

export const subscribeToUserSettings = (
  userId: string,
  onSettingsUpdate: (settings: UserSettings) => void
) => {
  const channel = supabase
    .channel('user-settings-changes')
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'user_settings',
        filter: `user_id=eq.${userId}`,
      },
      () => {
        getUserSettings(userId).then((settings) => {
          if (settings) onSettingsUpdate(settings);
        });
      }
    )
    .subscribe();

  getUserSettings(userId).then((settings) => {
    if (settings) onSettingsUpdate(settings);
  });

  return () => {
    supabase.removeChannel(channel);
  };
};
