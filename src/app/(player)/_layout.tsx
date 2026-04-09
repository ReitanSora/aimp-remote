import { Stack } from 'expo-router'
import React from 'react'

export default function PlayerLayout() {
    return (
        <Stack>
            <Stack.Screen name="index" options={{ headerShown: false }}></Stack.Screen>
            <Stack.Screen name="songDetails" options={{ headerShown: false, presentation: 'transparentModal', animation: 'fade_from_bottom' }}></Stack.Screen>
        </Stack>
    )
}