import { useSettings } from '@/context/appContext';
import { useEffect, useState } from 'react';
import { ToastAndroid } from 'react-native';

export const useAIMP = () => {
    const [aimpEvent, setAimpEvent] = useState({
        muteState: null,
        playerState: null,
        position: 0,
        repeatState: null,
        shuffleState: null,
        status: 'disconnected',
        track: {
            album: '',
            artist: '',
            bitrate: 0,
            duration: 0,
            event: '',
            genre: '',
            play_count: 0,
            playlist_id: '',
            rating: 0,
            sample_rate: 0,
            title: '',
        },
        volumeState: 0,
    });
    // const ws = useRef(null);

    const { actualServer: server } = useSettings();

    const showToast = (message: string) => {
        ToastAndroid.show(message, ToastAndroid.SHORT);
    };

    useEffect(() => {
        const socket = new WebSocket(`ws://${server.ip}:3554`);

        socket.onopen = () => {
            setAimpEvent((prev) => ({ ...prev, status: 'connected' }));
        };

        socket.onmessage = (e) => {
            try {
                const data = JSON.parse(e.data);
                setAimpEvent((prev) => ({
                    ...prev,
                    ...(data.event === 'mute_changed' && { muteState: data.mute }),
                    ...(data.event === 'player_state' && { playerState: data.state }),
                    ...(data.event === 'position' && { position: data.position }),
                    ...(data.event === 'repeat_changed' && { repeatState: data.repeat }),
                    ...(data.event === 'shuffle_changed' && { shuffleState: data.shuffle }),
                    ...(data.event === 'track_changed' && { track: data }),
                    ...(data.event === 'volume_changed' && { volumeState: data.volume }),
                }));
            } catch {
                showToast('Error parsing websocket');
            }
        };

        socket.onerror = (e) => {
            setAimpEvent((prev) => ({ ...prev, status: 'disconnected' }));
        };

        return () => socket.close();
    }, [server]);

    return { aimpEvent };
};
