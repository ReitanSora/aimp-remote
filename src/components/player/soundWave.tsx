import React, { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withDelay, withRepeat, withTiming } from 'react-native-reanimated';

interface SoundWaveProps {
    wavesContainerGap: number;
    waveWidth: number;
    waveHeightOdd: number;
    waveHeightEven: number;
    waveBackground: string;
    animate: boolean;
}

export default function SoundWave({ wavesContainerGap, waveWidth, waveHeightOdd, waveHeightEven, waveBackground, animate }: SoundWaveProps) {
    const heightOdd = useSharedValue(waveWidth);
    const heightEven = useSharedValue(waveWidth)

    const animatedOdd = useAnimatedStyle(() => ({
        height: heightOdd.value
    }));

    const animatedEven = useAnimatedStyle(() => ({
        height: heightEven.value
    }));

    useEffect(() => {
        heightOdd.value = withDelay(100, withRepeat(
            withTiming(waveHeightOdd, { duration: 500 }),
            -1,
            true
        ));
        heightEven.value = withDelay(500, withRepeat(
            withTiming(waveHeightEven, { duration: 500 }),
            -1,
            true
        ));
    }, [])

    if (!animate) {
        return (
            <View style={[styles.wavesContainer, { gap: wavesContainerGap }]}>
                <Animated.View style={{ width: waveWidth, borderRadius: waveWidth, backgroundColor: waveBackground }} />
                <Animated.View style={{ width: waveWidth, borderRadius: waveWidth, backgroundColor: waveBackground }} />
                <Animated.View style={{ width: waveWidth, borderRadius: waveWidth, backgroundColor: waveBackground }} />
                <Animated.View style={{ width: waveWidth, borderRadius: waveWidth, backgroundColor: waveBackground }} />
                <Animated.View style={{ width: waveWidth, borderRadius: waveWidth, backgroundColor: waveBackground }} />
                <Animated.View style={{ width: waveWidth, borderRadius: waveWidth, backgroundColor: waveBackground }} />
                <Animated.View style={{ width: waveWidth, borderRadius: waveWidth, backgroundColor: waveBackground }} />
            </View>
        )
    }

    return (
        <View style={[styles.wavesContainer, { gap: wavesContainerGap }]}>
            <Animated.View style={[animatedOdd, { width: waveWidth, borderRadius: waveWidth, backgroundColor: waveBackground }]} />
            <Animated.View style={[animatedEven, { width: waveWidth, borderRadius: waveWidth, backgroundColor: waveBackground }]} />
            <Animated.View style={[animatedOdd, { width: waveWidth, borderRadius: waveWidth, backgroundColor: waveBackground }]} />
            <Animated.View style={[animatedEven, { width: waveWidth, borderRadius: waveWidth, backgroundColor: waveBackground }]} />
            <Animated.View style={[animatedOdd, { width: waveWidth, borderRadius: waveWidth, backgroundColor: waveBackground }]} />
            <Animated.View style={[animatedEven, { width: waveWidth, borderRadius: waveWidth, backgroundColor: waveBackground }]} />
            <Animated.View style={[animatedOdd, { width: waveWidth, borderRadius: waveWidth, backgroundColor: waveBackground }]} />
        </View>
    )
}

const styles = StyleSheet.create({
    wavesContainer: {
        width: '100%',

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});