import { useAIMP } from '@/hooks/useAIMP';
// import { useAppState } from '@/hooks/useAppState';
import IconButton from '@/components/ui/IconButton';
import { MAX_HEIGHT } from '@/constants';
import { Theme } from '@/theme';
import { Songs } from '@/types/songs';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { BlurTargetView, BlurView } from 'expo-blur';
import { Image, ImageBackground } from 'expo-image';
import { useIsFocused, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { Dimensions, ScrollView, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../../../context/appContext';

const { height: screenHeight } = Dimensions.get('window');
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

export default function PlayerBottomSheet() {
    const [imageUri, setImageUri] = useState<string>();
    const [songInfo, setSongInfo] = useState<Songs>(defaultSong);
    const [songDuration, setSongDuration] = useState<number>(0);
    const [repeatState, setRepeatState] = useState<boolean>(false);
    const [shuffleState, setShuffleState] = useState<boolean>(false);
    const [muteState, setMuteState] = useState<boolean>(false);
    const [volumeState, setVolumeState] = useState<number>(0);
    const [playerState, setPlayerState] = useState<boolean>(false);
    const [showSlider, setShowSlider] = useState<boolean>(false);
    const [songPosition, setSongPosition] = useState<number>(0);
    const transition = useSharedValue(0);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { actualServer, isLoaded } = useSettings();
    const targetRef = useRef<View | null>(null);
    const { aimpEvent } = useAIMP();
    const isFocused = useIsFocused();

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

    const handleRepeatState = async () => {
        try {
            const response = await fetch(`http://${actualServer.ip}:3553/player/repeat`, {
                method: 'POST',
            });
            const data = await response.json();
            if (data) setRepeatState(!repeatState);
        } catch {
            showToast('Error set repeat state');
        }
    };

    const handleShuffleState = async () => {
        try {
            const response = await fetch(`http://${actualServer.ip}:3553/player/shuffle`, {
                method: 'POST',
            });
            const data = await response.json();
            if (data) setShuffleState(!shuffleState);
        } catch {
            showToast('Error set shuffle state');
        }
    };

    const handleMuteState = async () => {
        try {
            const response = await fetch(`http://${actualServer.ip}:3553/player/mute`, {
                method: 'POST',
            });
            const data = await response.json();
            if (data) setMuteState(!muteState);
        } catch {
            showToast('Error set mute state');
        }
    };

    const handleVolumeState = async (volume: number) => {
        try {
            const response = await fetch(`http://${actualServer.ip}:3553/player/volume`, {
                method: 'POST',
                body: JSON.stringify({ volume: volume }),
            });
            const data = await response.json();
            if (data) setVolumeState(volume);
            if (volume === 0 && !muteState) handleMuteState();
            else if (volume > 0 && muteState) handleMuteState();
        } catch {
            showToast('Error set volume');
        }
    };

    const handleNextTrack = async () => {
        try {
            const response = await fetch(`http://${actualServer.ip}:3553/player/next`, {
                method: 'POST',
            });
            await response.json();
        } catch {
            showToast('Error next track');
        }
    };

    const handlePreviousTrack = async () => {
        try {
            const response = await fetch(`http://${actualServer.ip}:3553/player/previous`, {
                method: 'POST',
            });
            await response.json();
        } catch {
            showToast('Error previous track');
        }
    };

    const handlePause = async () => {
        try {
            const response = await fetch(`http://${actualServer.ip}:3553/player/playpause`, {
                method: 'POST',
            });
            await response.json();
            setPlayerState(!playerState);
        } catch {
            showToast('Error set play/pause state');
        }
    };

    const handleShowSlider = () => {
        setShowSlider(!showSlider);
        transition.value = withTiming(showSlider ? 0 : 1, { duration: 250 });
    };

    const handleSongPosition = async (position: number) => {
        try {
            const response = await fetch(`http://${actualServer.ip}:3553/player/seek`, {
                method: 'POST',
                body: JSON.stringify({ position: position }),
            });
            const data = await response.json();
            if (data) setSongPosition(position);
        } catch {
            showToast('Error set song position');
        }
    };

    useEffect(() => {
        if (aimpEvent.playerState === null) return;
        if (aimpEvent.playerState === 2) setPlayerState(true);
        if (aimpEvent.playerState !== 2) setPlayerState(false);
    }, [aimpEvent.playerState]);

    useEffect(() => {
        if (aimpEvent.repeatState === null) return;
        if (aimpEvent.repeatState !== repeatState) setRepeatState(aimpEvent.repeatState);
    }, [aimpEvent.repeatState, repeatState]);

    useEffect(() => {
        if (aimpEvent.shuffleState === null) return;
        if (aimpEvent.shuffleState !== shuffleState) setShuffleState(aimpEvent.shuffleState);
    }, [aimpEvent.shuffleState]);

    useEffect(() => {
        if (aimpEvent.muteState === null) return;
        if (aimpEvent.muteState !== muteState) setMuteState(aimpEvent.muteState);
    }, [aimpEvent.muteState, muteState]);

    useEffect(() => {
        if (aimpEvent.position !== 0) setSongPosition(Number(aimpEvent.position));
    }, [aimpEvent.position]);

    useEffect(() => {
        if (aimpEvent.track.album !== '') {
            setSongInfo({
                album: aimpEvent.track.album,
                artist: aimpEvent.track.artist,
                bitrate: aimpEvent.track.bitrate,
                genre: aimpEvent.track.genre,
                play_count: aimpEvent.track.play_count,
                rating: aimpEvent.track.rating,
                sample_rate: aimpEvent.track.sample_rate,
                title: aimpEvent.track.title,
            });
        }
    }, [aimpEvent.track]);

    useEffect(() => {
        if (Math.trunc(aimpEvent.track.duration * 1000) !== songDuration && aimpEvent.track.duration !== 0) {
            setSongDuration(Math.trunc(aimpEvent.track.duration * 1000));
        }
    }, [aimpEvent.track.duration, songDuration]);

    useEffect(() => {
        if (!isLoaded) return;

        const songCover = async () => {
            try {
                const timestamp = new Date().getTime();
                const url = `http://${actualServer.ip}:3553/track/cover?t=${timestamp}`;
                setImageUri(url);
            } catch {
                showToast('Error get actual song cover');
            }
        };

        if (aimpEvent.track.title) {
            songCover();
        }
    }, [aimpEvent.track.title, aimpEvent.track.artist, actualServer]);

    useEffect(() => {
        if (!isLoaded) return;

        const songInformationAndCover = async () => {
            try {
                if (actualServer.ip === '127.0.0.1') {
                    setSongInfo(defaultSong);
                    return;
                }

                const timestamp = new Date().getTime();
                const url = `http://${actualServer.ip}:3553/track/cover?t=${timestamp}`;

                const [songResponse, playerResponse] = await Promise.all([
                    fetch(`http://${actualServer.ip}:3553/track/info`),
                    fetch(`http://${actualServer.ip}:3553/player/state`),
                ]);

                const [songInfo, playerInfo] = await Promise.all([songResponse.json(), playerResponse.json()]);
                setImageUri(url);
                setSongInfo(songInfo);
                setSongDuration(Number(playerInfo.duration));
                setRepeatState(playerInfo.repeat ? true : false);
                setShuffleState(playerInfo.shuffle ? true : false);
                setMuteState(playerInfo.mute ? true : false);
                setVolumeState(Number(playerInfo.volume));
                setPlayerState(playerInfo.state === 2 ? true : false);
            } catch (error) {
                showToast('Error player');
            }
        };

        songInformationAndCover();
    }, [actualServer]);

    if (!isFocused) {
        return null;
    }

    return (
        <>
            <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
                <BlurTargetView
                    ref={targetRef}
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: screenHeight }}>
                    <ImageBackground
                        style={{ flex: 1 }}
                        source={{ uri: imageUri }}
                        transition={250}
                        cachePolicy={'none'}
                    />
                </BlurTargetView>
                <BlurView
                    intensity={400}
                    tint='systemMaterialDark'
                    blurTarget={targetRef}
                    blurMethod='dimezisBlurViewSdk31Plus'
                    style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: screenHeight }}
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
                                        cachePolicy={'memory'}
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
                                <Animated.View style={[styles.extraControlsWrapper, animatedSlider, { justifyContent: 'space-evenly', gap: 10 }]}>
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
                                                    <Text style={{ color: '#C6C6C6', fontFamily: 'MPLUS-Regular', fontSize: 10 }}>{volumeState}</Text>
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
                                        value={volumeState}
                                        onValueChange={(e: any) => handleVolumeState(e)}
                                    />
                                </Animated.View>
                                <Animated.View style={[styles.extraControlsWrapper, animatedButtons]}>
                                    <IconButton
                                        onPress={() => handleRepeatState()}
                                        IconSet={Ionicons}
                                        iconName='repeat'
                                        iconColor={repeatState ? 'white' : '#8b8b8b'}
                                    />
                                    <IconButton
                                        onPress={() => handleShuffleState()}
                                        IconSet={Ionicons}
                                        iconName='shuffle'
                                        iconColor={shuffleState ? 'white' : '#8b8b8b'}
                                    />
                                    <IconButton
                                        onPress={() => handleMuteState()}
                                        IconSet={Ionicons}
                                        iconName='volume-mute-outline'
                                        iconColor={muteState ? 'white' : '#8b8b8b'}
                                    />
                                    <IconButton
                                        onPress={() => handleShowSlider()}
                                        IconSet={Ionicons}
                                        iconName='volume-medium-outline'
                                    />
                                </Animated.View>
                            </View>
                            <View style={styles.playerSlider}>
                                <Text style={styles.playerSliderTime}>{new Date(songPosition).toISOString().slice(14, 19)}</Text>
                                <Slider
                                    style={{ flex: 1 }}
                                    step={1}
                                    minimumValue={0}
                                    maximumValue={songDuration}
                                    minimumTrackTintColor='#FFFFFF'
                                    maximumTrackTintColor='#C6C6C6'
                                    thumbTintColor='#FFFFFF'
                                    value={songPosition}
                                    onValueChange={(e: any) => handleSongPosition(e)}
                                />
                                <Text style={styles.playerSliderTime}>{new Date(songDuration).toISOString().slice(14, 19)}</Text>
                            </View>
                            <View style={styles.playerBasicControls}>
                                <IconButton
                                    onPress={() => handlePreviousTrack()}
                                    containerStyle={{ width: 80, height: 80 }}
                                    IconSet={Ionicons}
                                    iconName='play-skip-back'
                                    iconSize={36}
                                />
                                <IconButton
                                    onPress={() => handlePause()}
                                    containerStyle={{ width: 80, height: 80, borderColor: '#FFF', borderWidth: 2 }}
                                    IconSet={MaterialCommunityIcons}
                                    iconName={playerState ? 'pause' : 'play'}
                                    iconSize={48}
                                />
                                <IconButton
                                    onPress={() => handleNextTrack()}
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
                                    <View style={{ flexDirection: 'row' }}>
                                        {[...Array(songInfo.rating)].map((_, index) => (
                                            <MaterialCommunityIcons
                                                name='music-note-quarter'
                                                size={24}
                                                color='white'
                                                key={`rating-music-note-${index}`}
                                            />
                                        ))}
                                        {[...Array(5 - songInfo.rating)].map((_, index) => (
                                            <MaterialCommunityIcons
                                                name='music-note-half'
                                                size={24}
                                                color='#8B8B8B'
                                                key={`rating-music-note-${index}`}
                                            />
                                        ))}
                                    </View>
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
        </>
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
        boxShadow: '0px 0px 15px 5px rgba(0, 0, 0, 0.2)',
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

        width: '100%',

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
