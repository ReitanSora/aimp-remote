import { useSettings } from '@/context/appContext';
import { useAIMP } from '@/hooks/useAIMP';
import { SongInterface } from '@/types/ISongInformation';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, ToastAndroid, TouchableNativeFeedback, View } from 'react-native';
import NormalButton from '../player/normalButton';
import SoundWave from '../player/soundWave';

const defaultSong: SongInterface = {
    album: 'Unknown',
    artist: 'Unknown',
    bitrate: 0,
    genre: 'Unknown',
    play_count: 0,
    rating: 0,
    sample_rate: 0,
    title: 'Unknown'
}

export default function TogglePlayer() {
    const [songInfo, setSongInfo] = useState<SongInterface>(defaultSong);
    const [playerState, setPlayerState] = useState<string>('stop');
    const { aimpEvent } = useAIMP();
    const router = useRouter();
    const { server, appColor } = useSettings();

    const showToast = (message: string) => {
            ToastAndroid.show(message, ToastAndroid.SHORT);
        };

    const handlePause = async () => {
        try {
            const response = await fetch(`http://${server.ip}:3553/playpause`);
            const data = await response.json();
            if (data) {
                const status = playerState;
                setPlayerState(status === 'play' ? 'pause' : 'play')
            }
        } catch {
            showToast('Error toggle set play/pause');
        }
    };

    useEffect(() => {
        if (aimpEvent.playerState === null) return;
        if (aimpEvent.playerState === 2) setPlayerState('play');
        if (aimpEvent.playerState === 1) setPlayerState('pause');
    }, [aimpEvent.playerState])

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
                title: aimpEvent.track.title
            });
        }
    }, [aimpEvent.track])

    useEffect(() => {
        const songInfo = async () => {
            try {
                const response = await fetch(`http://${server.ip}:3553/track/info`);
                const info = await response.json();

                setSongInfo(info);
            } catch {
                showToast('Error toggle song info');
            }
        }

        const playerState = async () => {
            try {
                const response = await fetch(`http://${server.ip}:3553/playerstate`);
                const data = await response.json();
                setPlayerState(data === 0 ? 'stop' : (data === 1 ? 'pause' : 'play'))
            } catch {
                showToast('Error toggle player state');
            }
        }

        songInfo();
        playerState();
    }, [server])

    return (
        <View style={[styles.playerToggle, { backgroundColor: appColor }]}>
            <TouchableNativeFeedback
                background={TouchableNativeFeedback.Ripple('rgba(139, 139, 139, 0.5)', false)}
                useForeground
                onPress={() => router.navigate('/(player)')}
            >
                <View style={styles.toggleInside}>
                    <View style={styles.leftContentToggle}>
                        <View style={styles.soundWave}>
                            <SoundWave wavesContainerGap={2} waveWidth={4} waveHeightOdd={20} waveHeightEven={25} waveBackground='#FFF' animate={playerState === 'play' ? true : false} />
                        </View>
                        <View style={styles.songInfo}>
                            <Text style={[styles.text, { fontFamily: 'MPLUS-Bold' }]} numberOfLines={1} ellipsizeMode='tail'>{songInfo.title}</Text>
                            <Text style={[styles.text, { color: appColor === '#8B8B8B' ? '#FFF' : '#C6C6C6', fontSize: 12 }]} numberOfLines={1} ellipsizeMode='tail'>{songInfo.artist}</Text>
                        </View>
                    </View>
                    <View style={styles.songControl}>
                        <NormalButton
                            rippleColor='rgba(139, 139, 139, 0.5)'
                            onPress={() => handlePause()}
                            IconSet={MaterialCommunityIcons}
                            iconName={playerState === 'play' ? 'pause' : 'play'}
                            iconSize={36}
                        />
                    </View>
                </View>
            </TouchableNativeFeedback>
        </View>
    )
}

const styles = StyleSheet.create({
    playerToggle: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,

        width: '100%',
        height: 80,
        backgroundColor: '#363636',

        overflow: 'hidden',

        borderTopLeftRadius: 20,
        borderTopRightRadius: 20,

        elevation: 5,
    },
    toggleInside: {
        width: '100%',
        height: '100%',
        padding: 20,

        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    leftContentToggle: {
        paddingRight: 20,

        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        gap: 20,
    },
    soundWave: {
        width: 60,
        height: 60,

        alignItems: 'center',
        justifyContent: 'center',
    },
    songInfo: {
        flex: 1,
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    songControl: {
        width: 50,
        // backgroundColor: '#fff',
        alignItems: 'center',
        justifyContent: 'center',
    },
    text: {
        color: '#FFF',
        fontFamily: 'MPLUS-Regular',
        fontSize: 14,
    },
    playState: {
        position: 'absolute',
        top: 10,
        right: 10,

        width: 5,
        height: 5,
        backgroundColor: '#C6C6C6',

        alignItems: 'center',
        justifyContent: 'center',

        borderRadius: 5,
    }
});