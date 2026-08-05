import { useAIMP } from '@/hooks/useAimp';
import IconButton from '@/components/ui/IconButton';
import { MAX_HEIGHT } from '@/constants';
import { useSettings } from '@/context/AppContext';
import { Theme } from '@/theme';
import { Songs } from '@/types/songs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { BlurTargetView, BlurView } from 'expo-blur';
import { Image, ImageBackground } from 'expo-image';
import { useIsFocused, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
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

interface PlayerState {
    isPlaying: boolean;
    duration: number;
    position: number;
    repeat: boolean;
    shuffle: boolean;
    mute: boolean;
    volume: number;
}

const formatTime = (ms: number): string => {
    if (!ms || isNaN(ms)) return '00:00';
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

const RatingStars = React.memo(({ rating }: { rating: number }) => {
    const validRating = Math.max(0, Math.min(5, rating || 0));
    return (
        <View style={{ flexDirection: 'row' }}>
            {Array.from({ length: 5 }).map((_, index) => (
                <MaterialCommunityIcons
                    key={`star-${index}`}
                    name={index < validRating ? 'music-note-quarter' : 'music-note-half'}
                    size={24}
                    color={index < validRating ? 'white' : '#8B8B8B'}
                />
            ))}
        </View>
    );
});

export default function Player() {
    const isFocused = useIsFocused();
    if (!isFocused) {
        return null;
    }

    return <PlayerContent />;
}

function PlayerContent() {
    const [imageUri, setImageUri] = useState<string>();
    const [showSlider, setShowSlider] = useState<boolean>(false);
    const [loading, setLoading] = useState<boolean>(true);

    const [songInfo, setSongInfo] = useState<Songs>(defaultSong);
    const [player, setPlayer] = useState<PlayerState>({
        isPlaying: false,
        duration: 0,
        position: 0,
        repeat: false,
        shuffle: false,
        mute: false,
        volume: 0,
    });

    const transition = useSharedValue(0);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { actualServer, isLoaded } = useSettings();
    const targetRef = useRef<View | null>(null);
    const targetTrackRef = useRef<string>('');
    const { aimpEvent } = useAIMP();
    const baseUrl = useMemo(() => `http://${actualServer.ip}:3553`, [actualServer.ip]);

    const showToast = (message: string) => {
        ToastAndroid.show(message, ToastAndroid.SHORT);
    };

    const animatedSlider = useAnimatedStyle(() => {
        return {
            opacity: transition.value,
            transform: [{ scale: withTiming(transition.value === 0 ? 0.9 : 1) }],
            zIndex: transition.value > 0 ? 1 : -1,
        };
    });
    const animatedButtons = useAnimatedStyle(() => {
        return {
            opacity: 1 - transition.value,
            transform: [{ scale: 1 - transition.value * 0.1 }],
            zIndex: transition.value < 1 ? 1 : -1,
        };
    });

    const sendPlayerCommand = useCallback(
        async (endpoint: string, body?: object) => {
            try {
                const response = await fetch(`${baseUrl}/player/${endpoint}`, {
                    method: 'POST',
                    headers: body ? { 'Content-Type': 'application/json' } : undefined,
                    body: body ? JSON.stringify(body) : undefined,
                });
                return response.ok ? await response.json().catch(() => true) : null;
            } catch {
                showToast(`Error command: ${endpoint}`);
                return null;
            }
        },
        [baseUrl],
    );

    const handleRepeatState = useCallback(async () => {
        const response = await sendPlayerCommand('repeat');
        if (response) {
            setPlayer((prev) => ({ ...prev, repeat: !player.repeat }));
        }
    }, [sendPlayerCommand, player.repeat]);

    const handleShuffleState = useCallback(async () => {
        const response = await sendPlayerCommand('shuffle');
        if (response) {
            setPlayer((prev) => ({ ...prev, shuffle: !player.shuffle }));
        }
    }, [sendPlayerCommand, player.shuffle]);

    const handleMuteState = useCallback(async () => {
        const response = await sendPlayerCommand('mute');
        if (response) {
            setPlayer((prev) => ({ ...prev, mute: !player.mute }));
        }
    }, [sendPlayerCommand, player.mute]);

    const handleVolumeState = useCallback(
        async (volume: number) => {
            const response = await sendPlayerCommand('volume', { volume });
            if (response !== null) {
                setPlayer((prev) => {
                    const shouldMute = (volume === 0 && !prev.mute) || (volume > 0 && prev.mute);
                    if (shouldMute) handleMuteState();
                    return { ...prev, volume };
                });
            }
        },
        [sendPlayerCommand, handleMuteState],
    );

    const handlePause = useCallback(async () => {
        const response = await sendPlayerCommand('playpause');
        if (response) {
            setPlayer((prev) => ({ ...prev, isPlaying: !player.isPlaying }));
        }
    }, [sendPlayerCommand, player.isPlaying]);

    const handleSongPosition = useCallback(
        async (position: number) => {
            const response = await sendPlayerCommand('seek', { position });
            if (response !== null) {
                setPlayer((prev) => ({ ...prev, position: position }));
            }
        },
        [sendPlayerCommand],
    );

    const handleShowSlider = useCallback(() => {
        setShowSlider(!showSlider);
        transition.value = withTiming(showSlider ? 0 : 1, { duration: 250 });
    }, [transition, showSlider]);

    useEffect(() => {
        if (!aimpEvent) return;

        setPlayer((prev) => {
            const hasValidVolume = typeof aimpEvent.volumeState === 'number' && !isNaN(aimpEvent.volumeState);

            const nextIsPlaying = aimpEvent.playerState !== null ? aimpEvent.playerState === 2 : prev.isPlaying;
            const nextRepeat = aimpEvent.repeatState !== null ? aimpEvent.repeatState : prev.repeat;
            const nextShuffle = aimpEvent.shuffleState !== null ? aimpEvent.shuffleState : prev.shuffle;
            const nextMute = aimpEvent.muteState !== null ? aimpEvent.muteState : prev.mute;
            const nextPosition = aimpEvent.position !== 0 ? Number(aimpEvent.position) : prev.position;
            const nextDuration = aimpEvent.track?.duration ? Math.trunc(aimpEvent.track.duration * 1000) : prev.duration;
            const nextVolume = hasValidVolume ? Number(aimpEvent.volumeState) : prev.volume;
            if (
                prev.isPlaying === nextIsPlaying &&
                prev.repeat === nextRepeat &&
                prev.shuffle === nextShuffle &&
                prev.mute === nextMute &&
                prev.position === nextPosition &&
                prev.duration === nextDuration &&
                prev.volume === nextVolume
            ) {
                return prev;
            }

            return {
                isPlaying: nextIsPlaying,
                repeat: nextRepeat,
                shuffle: nextShuffle,
                mute: nextMute,
                position: nextPosition,
                duration: nextDuration,
                volume: nextVolume,
            };
        });

        const track = aimpEvent.track;
        if (track?.title || track?.album) {
            setSongInfo((prev) => {
                if (
                    prev.title === track.title &&
                    prev.artist === track.artist &&
                    prev.album === track.album &&
                    prev.rating === track.rating &&
                    prev.play_count === track.play_count
                ) {
                    return prev;
                }
                return {
                    album: track.album,
                    artist: track.artist,
                    bitrate: track.bitrate,
                    genre: track.genre,
                    play_count: track.play_count,
                    rating: track.rating,
                    sample_rate: track.sample_rate,
                    title: track.title,
                };
            });

            const newTrackId = `${track.artist}-${track.album}-${track.title}`;
            setImageUri((prevUri) => {
                const currentTrackIdRef = targetTrackRef.current;
                if (currentTrackIdRef !== newTrackId) {
                    targetTrackRef.current = newTrackId;
                    return `${baseUrl}/track/cover?t=${Date.now()}`;
                }
                return prevUri;
            });
        }
    }, [aimpEvent, baseUrl]);

    useEffect(() => {
        let isMounted = true;
        if (!isLoaded) return;

        if (actualServer.ip === '127.0.0.1') {
            setSongInfo(defaultSong);
            setLoading(false);
            return;
        }

        const songInformationAndCover = async () => {
            try {
                const [songResponse, playerResponse] = await Promise.all([
                    fetch(`http://${actualServer.ip}:3553/track/info`),
                    fetch(`http://${actualServer.ip}:3553/player/state`),
                ]);

                const [songInfo, playerInfo] = await Promise.all([songResponse.json(), playerResponse.json()]);

                if (isMounted) {
                    setSongInfo(songInfo);
                    setPlayer({
                        duration: Number(playerInfo.duration),
                        repeat: Boolean(playerInfo.repeat),
                        shuffle: Boolean(playerInfo.shuffle),
                        mute: Boolean(playerInfo.mute),
                        volume: Number(playerInfo.volume),
                        isPlaying: playerInfo.state === 2 ? true : false,
                        position: Number(playerInfo.position || 0),
                    });
                    setImageUri(`${baseUrl}/track/cover?t=${Date.now()}`);
                }
            } catch (error) {
                showToast('Error player');
            } finally {
                if (isMounted) setLoading(false);
            }
        };

        songInformationAndCover();
        return () => {
            isMounted = false;
        };
    }, [actualServer, baseUrl, isLoaded]);

    if (loading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator
                    color={Theme.colors.darkGray}
                    size={'large'}
                />
            </View>
        );
    }

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <BlurTargetView
                ref={targetRef}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: MAX_HEIGHT }}>
                <ImageBackground
                    style={{ flex: 1 }}
                    source={{ uri: imageUri }}
                    transition={250}
                    cachePolicy={'memory-disk'}
                />
            </BlurTargetView>
            <BlurView
                intensity={400}
                tint='systemMaterialDark'
                blurTarget={targetRef}
                blurMethod='dimezisBlurViewSdk31Plus'
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: MAX_HEIGHT }}
            />
            <View style={styles.header}>
                <IconButton
                    onPress={() => router.back()}
                    IconSet={Ionicons}
                    iconName='chevron-down'
                />
                <View style={styles.headerInfo}>
                    <Text style={styles.headerTitle}>Playing from</Text>
                    <Text style={styles.headerSubtitle}>{actualServer.name}</Text>
                </View>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
                <View style={{ height: MAX_HEIGHT - 60 - insets.top - insets.bottom, paddingBottom: insets.bottom }}>
                    <View style={styles.content}>
                        <View style={[styles.songImage, { aspectRatio: 1 }]}>
                            {imageUri && (
                                <Image
                                    source={{ uri: imageUri }}
                                    style={{ width: '100%', height: '100%' }}
                                    transition={250}
                                    contentFit='cover'
                                    cachePolicy={'memory-disk'}
                                />
                            )}
                        </View>
                        <View style={styles.songInfo}>
                            <Text
                                style={styles.songTitle}
                                numberOfLines={1}
                                ellipsizeMode='tail'>
                                {songInfo.title}
                            </Text>
                            <Text
                                style={styles.songArtist}
                                numberOfLines={1}
                                ellipsizeMode='tail'>
                                {songInfo.album}
                            </Text>
                            <Text
                                style={styles.songArtist}
                                numberOfLines={1}
                                ellipsizeMode='tail'>
                                {songInfo.artist}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.controls}>
                        <View style={styles.playerExtraControls}>
                            <Animated.View style={[styles.extraControlsWrapper, animatedSlider]}>
                                <View style={{ flexDirection: 'column' }}>
                                    <IconButton
                                        onPress={() => handleShowSlider()}
                                        insideStyle={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                                        InsideElement={
                                            <>
                                                <Ionicons
                                                    name='volume-medium-outline'
                                                    size={24}
                                                    color='white'
                                                />
                                                <Text style={{ color: '#C6C6C6', fontFamily: 'MPLUS-Regular', fontSize: 10 }}>{player.volume}</Text>
                                            </>
                                        }
                                    />
                                </View>
                                <Slider
                                    style={{ flex: 1 }}
                                    step={1}
                                    minimumValue={0}
                                    maximumValue={100}
                                    minimumTrackTintColor='#FFFFFF'
                                    maximumTrackTintColor='#C6C6C6'
                                    thumbTintColor='#FFFFFF'
                                    value={player.volume}
                                    onValueChange={(e: any) => handleVolumeState(e)}
                                />
                            </Animated.View>
                            <Animated.View style={[styles.extraControlsWrapper, animatedButtons]}>
                                <IconButton
                                    onPress={() => handleRepeatState()}
                                    IconSet={Ionicons}
                                    iconName='repeat'
                                    iconColor={player.repeat ? 'white' : '#8b8b8b'}
                                />
                                <IconButton
                                    onPress={() => handleShuffleState()}
                                    IconSet={Ionicons}
                                    iconName='shuffle'
                                    iconColor={player.shuffle ? 'white' : '#8b8b8b'}
                                />
                                <IconButton
                                    onPress={() => handleMuteState()}
                                    IconSet={Ionicons}
                                    iconName='volume-mute-outline'
                                    iconColor={player.mute ? 'white' : '#8b8b8b'}
                                />
                                <IconButton
                                    onPress={() => handleShowSlider()}
                                    IconSet={Ionicons}
                                    iconName='volume-medium-outline'
                                />
                            </Animated.View>
                        </View>
                        <View style={styles.playerSlider}>
                            <Text style={styles.playerSliderTime}>{formatTime(player.position)}</Text>
                            <Slider
                                style={{ flex: 1 }}
                                step={1}
                                minimumValue={0}
                                maximumValue={player.duration}
                                minimumTrackTintColor='#FFFFFF'
                                maximumTrackTintColor='#C6C6C6'
                                thumbTintColor='#FFFFFF'
                                value={player.position}
                                onValueChange={(e: any) => handleSongPosition(e)}
                            />
                            <Text style={styles.playerSliderTime}>{formatTime(player.duration)}</Text>
                        </View>
                        <View style={styles.playerBasicControls}>
                            <IconButton
                                onPress={() => sendPlayerCommand('previous')}
                                containerStyle={{ width: 80, height: 80 }}
                                IconSet={Ionicons}
                                iconName='play-skip-back'
                                iconSize={36}
                            />
                            <IconButton
                                onPress={() => handlePause()}
                                containerStyle={{ width: 80, height: 80, borderColor: '#FFF', borderWidth: 2 }}
                                IconSet={MaterialCommunityIcons}
                                iconName={player.isPlaying ? 'pause' : 'play'}
                                iconSize={48}
                            />
                            <IconButton
                                onPress={() => sendPlayerCommand('next')}
                                containerStyle={{ width: 80, height: 80 }}
                                IconSet={Ionicons}
                                iconName='play-skip-forward'
                                iconSize={36}
                            />
                        </View>
                    </View>
                </View>
                <View style={styles.songDetailsContainer}>
                    <View style={styles.extraInfoSong}>
                        <View style={styles.extraInfoSection}>
                            <Text style={styles.extraInfoTitle}>Album</Text>
                            <Text style={styles.extraInfoText}>{songInfo.album}</Text>
                        </View>
                        <View style={styles.extraInfoSection}>
                            <Text style={styles.extraInfoTitle}>Genre</Text>
                            <Text style={styles.extraInfoText}>{songInfo.genre}</Text>
                        </View>
                        <View style={styles.extraInfoSection}>
                            <Text style={styles.extraInfoTitle}>Artist</Text>
                            <Text style={styles.extraInfoText}>{songInfo.artist}</Text>
                        </View>
                    </View>
                    <View style={styles.extraInfoPlay}>
                        <View style={styles.extraInfoPlaySection}>
                            <Text style={styles.extraInfoTitle}>Play Count</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                <Text style={[styles.extraInfoText, { fontSize: 24, fontFamily: 'MPLUS-Bold' }]}>{songInfo.play_count}</Text>
                            </View>
                        </View>
                        <View style={styles.extraInfoPlaySection}>
                            <Text style={styles.extraInfoTitle}>Rating</Text>
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                                <RatingStars rating={songInfo.rating} />
                            </View>
                        </View>
                    </View>
                    <View style={[styles.extraInfoPlay]}>
                        <View style={styles.extraInfoPlaySection}>
                            <Text style={styles.extraInfoTitle}>Bitrate (kbps)</Text>
                            <Text style={[styles.extraInfoText, { fontSize: 24, fontFamily: 'MPLUS-Bold' }]}>{songInfo.bitrate}</Text>
                        </View>
                        <View style={styles.extraInfoPlaySection}>
                            <Text style={styles.extraInfoTitle}>Sample Rate (Hz)</Text>
                            <Text style={[styles.extraInfoText, { fontSize: 24, fontFamily: 'MPLUS-Bold' }]}>{songInfo.sample_rate}</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        position: 'relative',

        width: '100%',
        height: '100%',
        backgroundColor: '#FFF',
    },
    header: {
        width: '100%',
        height: 60,
        paddingHorizontal: 20,
        // backgroundColor: '#FFF',

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    headerInfo: {
        paddingHorizontal: 20,

        flexDirection: 'column',
        alignItems: 'flex-end',
        justifyContent: 'center',
    },
    headerTitle: {
        color: '#C6C6C6',
        fontFamily: 'MPLUS-Regular',
        fontSize: 10,
        textTransform: 'uppercase',
    },
    headerSubtitle: {
        color: '#FFF',
        fontFamily: 'MPLUS-Regular',
        fontSize: 12,
    },
    content: {
        height: 'auto',
        // backgroundColor: '#363636',
        paddingHorizontal: 20,
        paddingVertical: 10,

        alignContent: 'flex-start',
        justifyContent: 'flex-start',
        gap: 20,
    },
    songImage: {
        width: '100%',
        backgroundColor: Theme.colors.lightBlack,

        alignItems: 'center',
        justifyContent: 'flex-end',
        overflow: 'hidden',

        borderRadius: 20,
        boxShadow: '0px 0px 5px 0px rgba(0, 0, 0, 0.2)',
    },
    songInfo: {
        // backgroundColor: '#c6c6c6',
        paddingTop: 10,

        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 20,
    },
    songTitle: {
        color: '#FFF',
        fontFamily: 'MPLUS-ExtraBold',
        fontSize: 24,
    },
    songArtist: {
        color: '#8B8B8B',
        fontFamily: 'MPLUS-Regular',
        fontSize: 14,
    },
    controls: {
        paddingBottom: 20,

        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
    },
    playerExtraControls: {
        position: 'relative',

        width: '100%',
        height: 60,
        // backgroundColor: '#FFF',
        paddingHorizontal: 20,

        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    extraControlsWrapper: {
        position: 'absolute',

        width: '70%',

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    playerSlider: {
        position: 'relative',

        width: '100%',
        height: 60,
        // backgroundColor: '#FFF',
        paddingHorizontal: 20,

        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    playerSliderTime: {
        color: '#FFF',
        fontFamily: 'MPLUS-Bold',
    },
    playerBasicControls: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 40,

        zIndex: 20,
    },
    songDetailsContainer: {
        padding: 20,
        paddingBottom: 0,

        gap: 20,
    },
    extraInfoSection: {
        flexDirection: 'column',
        justifyContent: 'center',
        gap: 5,
    },
    extraInfoSong: {
        width: '100%',
        backgroundColor: `${Theme.colors.lightBlack}80`,
        padding: 20,

        gap: 20,

        borderRadius: 20,
    },
    extraInfoPlay: {
        width: '100%',

        flexDirection: 'row',
        gap: 20,
    },
    extraInfoPlaySection: {
        backgroundColor: `${Theme.colors.lightBlack}80`,
        padding: 20,

        flex: 1,
        flexDirection: 'column-reverse',
        gap: 5,

        borderRadius: 20,
    },
    extraInfoTitle: {
        color: '#8B8B8B',
        fontFamily: 'MPLUS-Regular',
        fontSize: 10,
    },
    extraInfoText: {
        color: '#FFF',
        fontFamily: 'MPLUS-Regular',
        fontSize: 14,
    },
});
