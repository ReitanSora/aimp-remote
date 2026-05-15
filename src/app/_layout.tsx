import { SettingsProvider, useSettings } from '@/context/appContext';
import { Colors } from '@/theme';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Href, Stack, useRouter, useSegments } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';

SplashScreen.preventAutoHideAsync();

function RootLayoutNav() {
  const { isLoaded, server, theme } = useSettings();
  const router = useRouter();
  const segments = useSegments();
  const currentThemeColors = Colors[theme];

  const MyTheme = {
    ...DefaultTheme,
    dark: theme === 'dark',
    colors: {
      ...DefaultTheme.colors,
      primary: currentThemeColors.primary,
      background: currentThemeColors.background,
      card: currentThemeColors.surface,
      text: currentThemeColors.text,
      border: currentThemeColors.border,
      notification: currentThemeColors.primary,
    },
  };

  useEffect(() => {
    if (!isLoaded) return;

    const isConnectScreen = String(segments[0]) === 'connect';
    if (!server.ip && !isConnectScreen) {
      router.replace('/connect' as Href);
    }
    SplashScreen.hideAsync();
  }, [isLoaded, server.ip, segments, router]);

  if (!isLoaded) return null;

  return (
    <ThemeProvider value={MyTheme}>
      <Stack
        screenOptions={{
          headerShown: false,
          animation: 'fade_from_bottom',
          contentStyle: { backgroundColor: currentThemeColors.background },
        }}
      >
        <Stack.Screen name="connect" options={{ animation: 'fade' }} />
        <Stack.Screen name="index" />
        <Stack.Screen name="playlist/[id]" options={{ animation: 'slide_from_right' }} />
        <Stack.Screen name="(player)" options={{ presentation: 'modal', animation: 'slide_from_bottom' }} />
        <Stack.Screen name="settings/index" options={{ animation: 'slide_from_right' }} />
      </Stack>
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
