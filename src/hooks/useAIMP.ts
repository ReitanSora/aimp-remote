import { useSettings } from '@/context/appContext';
import { SongInterface } from '@/types/ISongInformation';
import { useEffect, useRef, useState } from 'react';

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
  const [aimpEvent, setAimpEvent] = useState<AIMPState>({
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

  useEffect(() => {
    if (!server || !server.ip) return;

    ws.current = new WebSocket(`ws://${server.ip}:3554`);

    ws.current.onopen = () => setAimpEvent((prev) => ({ ...prev, status: 'connected' }));

    ws.current.onmessage = (e) => {
      try {
        const data = JSON.parse(e.data);

        setAimpEvent((prev) => {
          let changed = false;
          const next = { ...prev };

          if (data.event === 'mute_changed' && prev.muteState !== data.mute) {
            next.muteState = data.mute;
            changed = true;
          }
          if (data.event === 'player_state' && prev.playerState !== data.state) {
            next.playerState = data.state;
            changed = true;
          }

          if (data.event === 'position') {
            const newPos = Math.floor(data.position);
            const oldPos = Math.floor(prev.position);
            if (newPos !== oldPos) {
              next.position = data.position;
              changed = true;
            }
          }

          if (data.event === 'repeat_changed' && prev.repeatState !== data.repeat) {
            next.repeatState = data.repeat;
            changed = true;
          }
          if (data.event === 'shuffle_changed' && prev.shuffleState !== data.shuffle) {
            next.shuffleState = data.shuffle;
            changed = true;
          }
          if (data.event === 'track_changed') {
            next.track = data;
            changed = true;
          }
          if (data.event === 'volume_changed' && prev.volumeState !== data.volume) {
            next.volumeState = data.volume;
            changed = true;
          }

          return changed ? next : prev;
        });
      } catch {
        console.warn('Error parsing websocket');
      }
    };

    ws.current.onerror = () => setAimpEvent((prev) => ({ ...prev, status: 'disconnected' }));

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [server]);

  return { aimpEvent };
};
