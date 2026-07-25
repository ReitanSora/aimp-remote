import TogglePlayer from '@/components/playlist/togglePlayer';
import { Theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Tabs, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { View } from 'react-native';
import { SettingsProvider, useSettings } from '../context/appContext';

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
    duration: 400,
    fade: true,
});

function RootLayoutNav() {
    const segment = useSegments();
    const page = segment[segment.length - 1];
    const pagesToHideTabBar = ['player', 'songDetails', 'about', 'preferences', 'scan'];
    const { isLoaded } = useSettings();

    const MyTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: '#000',
        },
    };

    useEffect(() => {
        if (isLoaded) {
            SplashScreen.hideAsync();
        }
    }, [isLoaded]);

    if (!isLoaded) {
        return null;
    }

    return (
        <ThemeProvider value={MyTheme}>
            <View style={{ flex: 1 }}>
                <Tabs
                    screenOptions={{
                        tabBarStyle: {
                            display: pagesToHideTabBar.includes(page) ? 'none' : 'flex',

                            height: 70,
                            backgroundColor: Theme.colors.black,

                            alignItems: 'center',
                            justifyContent: 'center',

                            borderTopWidth: 0,
                            elevation: 0,
                        },
                        tabBarItemStyle: {
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '100%',
                            height: 70,
                        },
                        tabBarIconStyle: {
                            flex: 1,
                        },
                        tabBarVisibilityAnimationConfig: {
                            show: { animation: 'spring' },
                            hide: { animation: 'spring' },
                        },
                        tabBarActiveTintColor: Theme.colors.accent,
                        tabBarInactiveTintColor: Theme.colors.gray,
                        // tabBarHideOnKeyboard: true,
                        tabBarShowLabel: false,
                        headerShown: false,
                    }}
                    initialRouteName='(home)'>
                    <Tabs.Screen
                        name='(home)'
                        options={{
                            tabBarIcon: ({ color, focused }) => (
                                <Ionicons
                                    name={focused ? 'home' : 'home-outline'}
                                    size={24}
                                    color={color}
                                />
                            ),
                        }}
                    />
                    {/* <Tabs.Screen
                        name='(player)'
                        options={{ href: null}}
                    /> */}
                    <Tabs.Screen
                        name='(settings)'
                        options={{
                            tabBarIcon: ({ color, focused }) => (
                                <Ionicons
                                    name={focused ? 'settings' : 'settings-outline'}
                                    size={24}
                                    color={color}
                                />
                            ),
                        }}
                        
                    />
                </Tabs>
                {!pagesToHideTabBar.includes(page) ? (
                    <View style={{ position: 'absolute', bottom: 80 }}>
                        <TogglePlayer />
                    </View>
                ) : null}
            </View>
        </ThemeProvider>
    );
}

export default function HomeLayout() {
    return (
        <SettingsProvider>
            <RootLayoutNav />
        </SettingsProvider>
    );
}
