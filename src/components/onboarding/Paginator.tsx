import { MAX_WIDTH } from '@/constants';
import { Theme } from '@/theme';
import { useSegments } from 'expo-router';
import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { Easing, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Paginator() {
    const insets = useSafeAreaInsets();
    const segment = useSegments();
    const page = segment[segment.length - 1];
    const progress = useSharedValue(0);

    const animatedProgress = useAnimatedStyle(() => {
        return {
            width: `${progress.value * 100}%`,
        };
    });

    useEffect(() => {
        const actualProgress = () => {
            if (page === 'onboarding') return 1/3;
            if (page === 'configuration') return 2/3;
            if (page === 'success') return 1;
            return 0;
        };

        let value = actualProgress();

        progress.value = withTiming(value, {
            duration: 350,
            easing: Easing.out(Easing.quad),
        });
    }, [page]);

    return (
        <View style={[styles.container, { top: insets.top + 20 }]}>
            <View style={styles.background} />

            <Animated.View style={[styles.progress, animatedProgress]} />

            <View style={styles.segmentOverlay}>
                <View style={[styles.separator, { backgroundColor: 'transparent' }]}></View>
                <View style={styles.separator}></View>
                <View style={styles.separator}></View>
                <View style={[styles.separator, { backgroundColor: 'transparent' }]}></View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        left: 10,
        right: 10,

        width: MAX_WIDTH - 20,
        height: 6,
        overflow: 'hidden',

        borderRadius: 3,
    },
    background: {
        position: 'absolute',
        width: '100%',
        height: '100%',
        backgroundColor: Theme.colors.gray,
    },
    progress: {
        height: '100%',
        backgroundColor: Theme.colors.accent,
        borderRadius: 3,
    },
    segmentOverlay: {
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        zIndex: 1,
    },
    separator: {
        width: 5,
        height: '100%',
        backgroundColor: Theme.colors.background,
    },
});
