import { useSettings } from '@/context/appContext';
import { SongInterface } from '@/types/ISongInformation';
import { useEffect, useRef, useState } from 'react';
import { ToastAndroid } from 'react-native';

export interface AIMPState {
  muteState: boolean | null;
  playerState: number | null;
  position: number;
  repeatState: boolean | null;
  shuffleState: boolean | null;
  status: 'connected' | 'disconnected';
  track: SongInterface & { playlist_id?: string; event?: string };
  volumeState: number | null;
}

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
    volumeState: null,
  });
  const ws = useRef<WebSocket | null>(null);

  const { server } = useSettings();

  const showToast = (message: string) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  };

  useEffect(() => {
    if (!server || !server.ip) return;

    ws.current = new WebSocket(`ws://${server.ip}:3554`);

    ws.current.onopen = () => setAimpEvent((prev) => ({ ...prev, status: 'connected' }));

    ws.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);
        setAimpEvent((prev) => ({
          ...prev,
          ...(data.event === 'mute_changed' && { muteState: data.mute }),
          ...(data.event === 'player_state' && { playerState: data.state }),
          ...(data.event === 'position' && { position: data.position }),
          ...(data.event === 'repeat_changed' && { repeatState: data.repeat }),
          ...(data.event === 'shuffle_changed' && {
            shuffleState: data.shuffle,
          }),
          ...(data.event === 'track_changed' && { track: data }),
          ...(data.event === 'volume_changed' && { volumeState: data.volume }),
        }));
      } catch {
        showToast('Error parsing websocket');
        console.warn('Error parsing websocket');
      }
    };

    ws.current.onerror = (e) => setAimpEvent((prev) => ({ ...prev, status: 'disconnected' }));

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [server]);

  return { aimpEvent };
};
