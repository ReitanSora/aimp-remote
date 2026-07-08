import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface SettingsContextType {
    server: { ip: string; name: string };
    setServer: (value: { ip: string; name: string }) => void;
    appColor: string;
    setAppColor: (value: string) => void;
    isLoaded: boolean;
    isOnboarded: boolean;
    setIsOnboarded: (value: boolean) => void;
}

const DEFAULT_SETTINGS = {
    defaultServer: {
        ip: '192.168.1.1',
        name: 'PC',
    } as const,
    defaultColor: '#8B8B8B' as const,
};

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [server, setServer] = useState<SettingsContextType['server']>(DEFAULT_SETTINGS.defaultServer);
    const [appColor, setAppColor] = useState<string>(DEFAULT_SETTINGS.defaultColor);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [isOnboarded, setIsOnboarded] = useState<boolean>(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const [storedServer, storedColor, storedOnboarded] = await Promise.all([
                    AsyncStorage.getItem('settings'),
                    AsyncStorage.getItem('color'),
                    AsyncStorage.getItem('onboarded'),
                ]);

                if (storedServer) setServer(JSON.parse(storedServer));
                if (storedColor) setAppColor(storedColor);
                if (storedOnboarded) setIsOnboarded(JSON.parse(storedOnboarded));
            } catch (e) {
                console.error('Error loading preferences:', e);
            } finally {
                setIsLoaded(true);
            }
        };
        
        loadSettings();
    }, []);

    useEffect(() => {
        if (!isLoaded) return;

        const saveSettings = async () => {
            try {
                await AsyncStorage.setItem('settings', JSON.stringify(server));
                await AsyncStorage.setItem('color', appColor);
            } catch (e) {
                console.error('Error saving preferences:', e);
            }
        };

        saveSettings();
    }, [server, appColor, isLoaded, isOnboarded]);

    return (
        <SettingsContext.Provider
            value={{
                server,
                setServer,
                appColor,
                setAppColor,
                isLoaded,
                isOnboarded,
                setIsOnboarded,
            }}>
            {children}
        </SettingsContext.Provider>
    );
}

export function useSettings() {
    const context = useContext(SettingsContext);

    if (!context) throw new Error('Error in context');
    return context;
}
