import { Stack } from 'expo-router';
import React from 'react';

export default function SettingsLayout() {
    return (
        <Stack
            initialRouteName='index'
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name='index' />
            <Stack.Screen name='about' />
            <Stack.Screen name='preferences' />
            <Stack.Screen name='scan' />
        </Stack>
    );
}
