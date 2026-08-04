import Paginator from '@/components/onboarding/Paginator';
import { Stack } from 'expo-router';
import React from 'react';
import { View } from 'react-native';

export default function OnboardingLayout() {
    return (
        <View style={{ flex: 1 }}>
            <Stack
                screenOptions={{ headerShown: false }}
                initialRouteName='index'>
                <Stack.Screen name='index' />
                <Stack.Screen name='configuration' />
                <Stack.Screen name='success' />
            </Stack>
            <Paginator/>
        </View>
    );
}
