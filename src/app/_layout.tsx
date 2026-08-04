import { SettingsProvider, useSettings } from '@/context/appContext';
import { Theme } from '@/theme';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import React, { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
    duration: 400,
    fade: true,
});

function RootLayout() {
    const { isLoaded, isOnboarded } = useSettings();

    const MyTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: Theme.colors.background,
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
            <Stack screenOptions={{ headerShown: false }}>
                <Stack.Protected guard={isOnboarded}>
                    <Stack.Screen name='(tabs)'/>
                </Stack.Protected>
                <Stack.Protected guard={!isOnboarded}>
                    <Stack.Screen name='onboarding'/>
                </Stack.Protected>
            </Stack>
        </ThemeProvider>
    );
}

export default function HomeLayout() {
    return (
        <SettingsProvider>
            <RootLayout />
        </SettingsProvider>
    );
}
