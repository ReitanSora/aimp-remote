import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from 'react';

interface SettingsContextType {
    actualServer: { ip: string; name: string };
    setActualServer: (value: { ip: string; name: string }) => void;
    serverList: Array<{ ip: string; name: string }>;
    setServerList: Dispatch<SetStateAction<Array<{ ip: string; name: string }>>>;
    isLoaded: boolean;
    isOnboarded: boolean;
    setIsOnboarded: (value: boolean) => void;
}

const DEFAULT_SETTINGS = {
    defaultServer: {
        ip: '192.168.1.9',
        name: 'PC',
    } as const,
};

export const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [actualServer, setActualServer] = useState<SettingsContextType['actualServer']>(DEFAULT_SETTINGS.defaultServer);
    const [serverList, setServerList] = useState<SettingsContextType['serverList']>([]);
    const [isLoaded, setIsLoaded] = useState<boolean>(false);
    const [isOnboarded, setIsOnboarded] = useState<boolean>(false);

    useEffect(() => {
        const loadSettings = async () => {
            try {
                const [storedActualServer, storedServerList, storedOnboarded] = await Promise.all([
                    AsyncStorage.getItem('actualServer'),
                    AsyncStorage.getItem('serverList'),
                    AsyncStorage.getItem('onboarded'),
                ]);

                if (storedActualServer) setActualServer(JSON.parse(storedActualServer));
                if (storedServerList) setServerList(JSON.parse(storedServerList));
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
                await AsyncStorage.setItem('actualServer', JSON.stringify(actualServer));
                await AsyncStorage.setItem('serverList', JSON.stringify(serverList));
                await AsyncStorage.setItem('onboarded', JSON.stringify(isOnboarded));
            } catch (e) {
                console.error('Error saving preferences:', e);
            }
        };

        saveSettings();
    }, [actualServer, serverList, isLoaded, isOnboarded]);

    return (
        <SettingsContext.Provider
            value={{
                actualServer,
                setActualServer,
                serverList,
                setServerList,
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
