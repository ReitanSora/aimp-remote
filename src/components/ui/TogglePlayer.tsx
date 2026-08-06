import { MAX_WIDTH } from '@/constants';
import { useSettings } from '@/context/AppContext';
import { useAIMP } from '@/hooks/useAimp';
import { Theme } from '@/theme';
import { Songs } from '@/types/songs';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import Animated, { Extrapolation, interpolate, useAnimatedProps, useSharedValue, withTiming } from 'react-native-reanimated';
import Svg, { Circle } from 'react-native-svg';
import IconButton from '../ui/IconButton';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const defaultSong: Songs = {
    album: 'Unknown',
    artist: 'Unknown',
    bitrate: 0,
    genre: 'Unknown',
    play_count: 0,
    rating: 0,
    sample_rate: 0,
    title: 'Unknown',
};

const noServer: Songs = {
    album: 'Unknown',
    artist: 'Verify your server',
    bitrate: 0,
    genre: 'Unknown',
    play_count: 0,
    rating: 0,
    sample_rate: 0,
    title: 'Server unreacheable',
};

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const CIRCUMFERENCE = 157;
const CIRCLE_RADIUS = 25;
const CIRCLE_CX = 40;
const CIRCLE_CY = 35;

export default function TogglePlayer() {
    const [songInfo, setSongInfo] = useState<Songs>(defaultSong);
    const [isPlaying, setIsPlaying] = useState<boolean>(false);
    const [songDuration, setSongDuration] = useState<number>(0);

    const { aimpEvent } = useAIMP();
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { actualServer, isLoaded } = useSettings();

    const progress = useSharedValue(0);
    const enableButton = useMemo(() => actualServer.ip !== '127.0.0.1', [actualServer.ip]);

    const handlePlayerVisible = useCallback(() => {
        router.navigate('/(tabs)/(home)/player');
    }, [router]);

    const showToast = (message: string) => {
        ToastAndroid.show(message, ToastAndroid.SHORT);
    };

    const handlePause = useCallback(async () => {
        if (!enableButton) return;
        try {
            const response = await fetch(`http://${actualServer.ip}:3553/player/playpause`, {
                method: 'POST',
            });
            if (response.ok) {
                setIsPlaying(!isPlaying);
            }
        } catch {
            showToast('Error toggle set play/pause');
        }
    }, [actualServer.ip, isPlaying]);

    useEffect(() => {
        if (aimpEvent.playerState !== null) {
            setIsPlaying(aimpEvent.playerState === 2? true: false);
        }
    }, [aimpEvent.playerState]);

    const animatedProps = useAnimatedProps(() => {
        const strokeDashoffset = interpolate(progress.value, [0, songDuration || 1], [CIRCUMFERENCE, 0], Extrapolation.CLAMP);
        return { strokeDashoffset };
    }, [songDuration]);

    useEffect(() => {
        progress.value = withTiming(aimpEvent.position);
    }, [aimpEvent.position]);

    useEffect(() => {
        if (aimpEvent.track.album !== '') {
            setSongInfo({
                album: aimpEvent.track.album,
                artist: aimpEvent.track.artist,
                bitrate: Number(aimpEvent.track.bitrate),
                genre: aimpEvent.track.genre,
                play_count: 0,
                rating: 0,
                sample_rate: Number(aimpEvent.track.sample_rate),
                title: aimpEvent.track.title,
            });
            setSongDuration(Math.trunc(aimpEvent.track.duration * 1000));
        }
    }, [aimpEvent.track]);

    useEffect(() => {
        if (!isLoaded) return;

        if (!enableButton) {
            setSongInfo(noServer);
            return;
        }

        const toggleInfo = async () => {
            try {
                if (actualServer.ip === '127.0.0.1') {
                    setSongInfo(noServer);
                    return;
                }

                const [trackResponse, playerResponse] = await Promise.all([
                    fetch(`http://${actualServer.ip}:3553/track/info`),
                    fetch(`http://${actualServer.ip}:3553/player/state`),
                ]);

                const [trackInfo, playerInfo] = await Promise.all([trackResponse.json(), playerResponse.json()]);

                setSongInfo(trackInfo);
                setIsPlaying(playerInfo.state === 2 ? true : false);
                setSongDuration(playerInfo.duration);
            } catch (error) {
                showToast('Error toggle player');
            }
        };

        toggleInfo();
    }, [actualServer.ip, isLoaded, enableButton]);

    return (
        <View style={[styles.playerToggle, {bottom: insets.bottom}]}>
            <Pressable
                android_ripple={{ color: Theme.colors.ripple, borderless: false, foreground: true }}
                onPress={handlePlayerVisible}
                disabled={!enableButton}>
                <View style={[styles.toggleInside, { backgroundColor: Theme.colors.lightBlack }]}>
                    <View style={styles.leftContentToggle}>
                        <Svg
                            height='80'
                            width='65'>
                            <AnimatedCircle
                                cx={CIRCLE_CX}
                                cy={CIRCLE_CY}
                                r={CIRCLE_RADIUS}
                                stroke={Theme.colors.accent}
                                strokeWidth={5}
                                fill={'transparent'}
                                strokeDasharray={156}
                                animatedProps={animatedProps}
                                strokeLinecap={'round'}
                                transform={`rotate(-90, ${CIRCLE_CX}, ${CIRCLE_CX})`}
                            />
                        </Svg>
                        <IconButton
                            containerStyle={{ position: 'absolute', left: 15, top: 20, width: 40, height: 40 }}
                            insideStyle={{ backgroundColor: Theme.colors.white }}
                            onPress={enableButton ? handlePause : () => {}}
                            IconSet={MaterialCommunityIcons}
                            iconName={isPlaying ? 'pause' : 'play'}
                            iconSize={36}
                            iconColor={Theme.colors.lightBlack}
                        />
                        <View style={styles.songInfo}>
                            <Text
                                style={[styles.text, { fontFamily: Theme.fontFamily.bold }]}
                                numberOfLines={1}
                                ellipsizeMode='tail'>
                                {songInfo.title}
                            </Text>
                            <Text
                                style={[styles.text, { color: Theme.colors.lightGray }]}
                                numberOfLines={1}
                                ellipsizeMode='tail'>
                                {songInfo.artist}
                            </Text>
                        </View>
                    </View>
                </View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    playerToggle: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,

        width: MAX_WIDTH - 30,
        height: 80,
        marginHorizontal: 15,

        overflow: 'hidden',

        borderRadius: 40,
        borderWidth: 1,
        borderColor: Theme.colors.gray,

        elevation: 5,
    },
    toggleInside: {
        width: '100%',
        height: '100%',
        padding: 10,

        flexDirection: 'row',
        alignItems: 'center',
    },
    leftContentToggle: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    songInfo: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    text: {
        color: '#FFF',
        fontFamily: 'MPLUS-Regular',
        fontSize: Theme.fontSize.paragraph,
    },
});
