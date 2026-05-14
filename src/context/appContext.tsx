import { ThemeType } from '@/theme';
import { ServerSettings } from '@/types/ISettings';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';

interface SettingsContextType {
  server: ServerSettings;
  setServer: React.Dispatch<React.SetStateAction<ServerSettings>>;
  appColor: string;
  setAppColor: React.Dispatch<React.SetStateAction<string>>;
  theme: ThemeType;
  setTheme: React.Dispatch<React.SetStateAction<ThemeType | 'system'>>;
  isLoaded: boolean;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const systemTheme = useColorScheme();
  const [server, setServer] = useState<ServerSettings>({ ip: '', name: '' });
  const [appColor, setAppColor] = useState<string>('#8B8B8B');
  const [themePreference, setThemePreference] = useState<ThemeType | 'system'>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  const activeTheme: ThemeType = themePreference === 'system' ? systemTheme || 'dark' : themePreference;

  useEffect(() => {
    const loadSettings = async () => {
      try {
        const [storedServer, storedColor, storedTheme] = await Promise.all([AsyncStorage.getItem('settings'), AsyncStorage.getItem('color'), AsyncStorage.getItem('theme')]);
        if (storedServer) setServer(JSON.parse(storedServer));
        if (storedColor) setAppColor(storedColor);
        if (storedTheme) setThemePreference(storedTheme as ThemeType | 'system');
      } catch (e) {
        console.error('Error loading settings:', e);
      } finally {
        setIsLoaded(true);
      }
    };
    loadSettings();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    AsyncStorage.setItem('settings', JSON.stringify(server));
    AsyncStorage.setItem('color', appColor);
    AsyncStorage.setItem('theme', themePreference);
  }, [server, appColor, themePreference, isLoaded]);

  return (
    <SettingsContext.Provider
      value={{
        server,
        setServer,
        appColor,
        setAppColor,
        theme: activeTheme,
        setTheme: setThemePreference,
        isLoaded,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) throw new Error('useSettings must be used within a SettingsProvider');
  return context;
}
