import { Stack } from 'expo-router';
import React from 'react';

export default function HomeLayout() {
    return (
        <Stack
            initialRouteName='index'
            screenOptions={{ headerShown: false }}>
            <Stack.Screen name='index' />
            <Stack.Screen
                name='player/index'
                options={{ animation: 'fade_from_bottom' }}
            />
            <Stack.Screen
                name='player/songDetails'
                options={{ animation: 'fade' }}
            />
            <Stack.Screen name='playlist/[id]' />
        </Stack>
    );
}
