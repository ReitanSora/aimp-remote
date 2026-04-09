import { DefaultTheme, ThemeProvider } from "@react-navigation/native";
import { Stack } from "expo-router";
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from "react";
import { SettingsProvider, useSettings } from "../context/appContext";

SplashScreen.preventAutoHideAsync();

SplashScreen.setOptions({
    duration: 400,
    fade: true,
});

function RootLayoutNav() {

    const { isLoaded } = useSettings();

    const MyTheme = {
        ...DefaultTheme,
        colors: {
            ...DefaultTheme.colors,
            background: '#000'
        },
    };

    useEffect(() => {
        if (isLoaded) {
            SplashScreen.hideAsync();
        }
    }, [isLoaded])

    if (!isLoaded) {
        return null;
    }

    return (
        <ThemeProvider value={MyTheme}>
            <Stack>
                <Stack.Screen name="index" options={{ headerShown: false, animation: 'simple_push' }}></Stack.Screen>
                <Stack.Screen name="playlist/[id]" options={{ headerShown: false, }}></Stack.Screen>
                <Stack.Screen name="(player)" options={{ headerShown: false, animation: 'slide_from_bottom' }}></Stack.Screen>
                <Stack.Screen name="settings/index" options={{ headerShown: false }}></Stack.Screen>
            </Stack>
        </ThemeProvider>
    )
};

export default function HomeLayout() {
    return (
        <SettingsProvider>
            <RootLayoutNav />
        </SettingsProvider>
    )
}