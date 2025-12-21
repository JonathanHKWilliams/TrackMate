import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSettings } from './SettingsContext';

export type Theme = 'dark' | 'light';

export interface ThemeColors {
  background: string;
  surface: string;
  card: string;
  border: string;
  primary: string;
  text: string;
  textSecondary: string;
  success: string;
  warning: string;
  danger: string;
  overlay: string;
}

const darkTheme: ThemeColors = {
  background: '#000000',
  surface: '#1A1A1A',
  card: '#1A1A1A',
  border: '#2A2A2A',
  primary: '#FF8C00',
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  success: '#4CAF50',
  warning: '#FF8C00',
  danger: '#FF4444',
  overlay: 'rgba(0, 0, 0, 0.8)',
};

const lightTheme: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F5F5F5',
  card: '#FFFFFF',
  border: '#E0E0E0',
  primary: '#FF8C00',
  text: '#000000',
  textSecondary: '#666666',
  success: '#4CAF50',
  warning: '#FF8C00',
  danger: '#FF4444',
  overlay: 'rgba(0, 0, 0, 0.5)',
};

interface ThemeContextType {
  theme: Theme;
  colors: ThemeColors;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const { settings, updateSettings } = useSettings();
  const [currentTheme, setCurrentTheme] = useState<Theme>('dark');

  useEffect(() => {
    if (settings?.theme) {
      setCurrentTheme(settings.theme as Theme);
    }
  }, [settings?.theme]);

  const colors = currentTheme === 'dark' ? darkTheme : lightTheme;

  const toggleTheme = () => {
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    setCurrentTheme(newTheme);
    updateSettings({ theme: newTheme });
  };

  const setTheme = (theme: Theme) => {
    setCurrentTheme(theme);
    updateSettings({ theme });
  };

  return (
    <ThemeContext.Provider value={{ theme: currentTheme, colors, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
