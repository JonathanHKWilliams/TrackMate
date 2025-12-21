import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserSettings, UserSettingsInput } from '../types/settings';
import { getOrCreateUserSettings, updateUserSettings, subscribeToUserSettings } from '../services/settingsService';
import { useAuth } from './AuthContext';

interface SettingsContextType {
  settings: UserSettings | null;
  updateSettings: (newSettings: UserSettingsInput) => Promise<void>;
  loading: boolean;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadSettings();
      const unsubscribe = subscribeToUserSettings(user.id, (updatedSettings) => {
        setSettings(updatedSettings);
      });
      return unsubscribe;
    } else {
      setSettings(null);
      setLoading(false);
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    try {
      const userSettings = await getOrCreateUserSettings(user.id);
      setSettings(userSettings);
    } catch (error) {
      console.error('Error loading settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateSettings = async (newSettings: UserSettingsInput) => {
    if (!user) return;
    try {
      const updated = await updateUserSettings(user.id, newSettings);
      setSettings(updated);
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  };

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, loading }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
