import { ServerSettings } from "@/types/ISettings";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, ReactNode, useContext, useEffect, useState } from "react";

interface SettingsContextType {
    server: ServerSettings;
    setServer: React.Dispatch<React.SetStateAction<ServerSettings>>;
    appColor: string;
    setAppColor: React.Dispatch<React.SetStateAction<string>>;
    isLoaded: boolean;
}

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [server, setServer] = useState<ServerSettings>({ ip: '0.0.0.0', name: '' });
    const [appColor, setAppColor] = useState<string>('#8B8B8B')
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const [storedServer, storedColor] = await Promise.all([
                    AsyncStorage.getItem('settings'),
                    AsyncStorage.getItem('color')
                ]);

                if (storedServer) setServer(JSON.parse(storedServer));
                if (storedColor) setAppColor(storedColor);
            } catch (e) {
                console.error('Error cargando configuraciones:', e);
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
                console.error('Error guardando configuraciones:', e);
            }
        };

        saveSettings();
    }, [server, appColor, isLoaded]);

    return (
        <SettingsContext.Provider value={{ server, setServer, appColor, setAppColor, isLoaded }}>
            {children}
        </SettingsContext.Provider>
    )
}

export function useSettings() {
    const context = useContext(SettingsContext);
    if (context === undefined) {
        return null;
    }
    return context;
}