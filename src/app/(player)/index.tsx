import NormalButton from '@/components/player/normalButton';
import { useAIMP } from '@/hooks/useAIMP';
// import { useAppState } from '@/hooks/useAppState';
import { SongInterface } from '@/types/ISongInformation';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';
import { BlurView } from 'expo-blur';
import { Image, ImageBackground } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Dimensions, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../../context/appContext';
import { formatTimeHelper } from '@/utils/helpers';

const { height: screenHeight } = Dimensions.get('window');

const defaultSong: SongInterface = {
  album: 'Unknown',
  artist: 'Unknown',
  bitrate: 0,
  genre: 'Unknown',
  play_count: 0,
  rating: 0,
  sample_rate: 0,
  title: 'Unknown',
};

export default function Home() {
  const [imageUri, setImageUri] = useState<string>();
  const [songInfo, setSongInfo] = useState<SongInterface>(defaultSong);
  const [songDuration, setSongDuration] = useState<number>(0);
  const [repeatState, setRepeatState] = useState<boolean>(false);
  const [shuffleState, setShuffleState] = useState<boolean>(false);
  const [muteState, setMuteState] = useState<boolean>(false);
  const [volumeState, setVolumeState] = useState<number>(0);
  const [playerState, setPlayerState] = useState<string>('stop');
  const [showSlider, setShowSlider] = useState<boolean>(false);
  const [songPosition, setSongPosition] = useState<number>(0);
  const transition = useSharedValue(0);
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { server } = useSettings();

  const showToast = (message: string) => {
    ToastAndroid.show(message, ToastAndroid.SHORT);
  };

  const { aimpEvent } = useAIMP();

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
      const response = await fetch(`http://${server.ip}:3553/track/repeat`, {
        method: 'POST',
        body: JSON.stringify({ repeat: repeatState ? 0 : 1 }),
      });
      const data = await response.json();
      if (data) setRepeatState(!repeatState);
    } catch {
      showToast('Error set repeat state');
    }
  };

  const handleShuffleState = async () => {
    try {
      const response = await fetch(`http://${server.ip}:3553/shuffle`, {
        method: 'POST',
        body: JSON.stringify({ shuffle: shuffleState ? 0 : 1 }),
      });
      const data = await response.json();
      if (data) setShuffleState(!shuffleState);
    } catch {
      showToast('Error set shuffle state');
      console.warn('Error set shuffle state');
    }
  };

  const handleMuteState = async () => {
    try {
      const response = await fetch(`http://${server.ip}:3553/mute`, {
        method: 'POST',
        body: JSON.stringify({ mute: muteState ? 0 : 1 }),
      });
      const data = await response.json();
      if (data) setMuteState(!muteState);
    } catch {
      showToast('Error set mute state');
      console.warn('Error set mute state');
    }
  };

  const handleVolumeState = async (volume: number) => {
    try {
      const response = await fetch(`http://${server.ip}:3553/volume`, {
        method: 'POST',
        body: JSON.stringify({ level: volume }),
      });
      const data = await response.json();
      if (data) setVolumeState(volume);
      if (volume === 0 && !muteState) handleMuteState();
      else if (volume > 0 && muteState) handleMuteState();
    } catch {
      showToast('Error set volume');
      console.warn('Error set volume');
    }
  };

  const handleNextTrack = async () => {
    try {
      await fetch(`http://${server.ip}:3553/next`);
    } catch {
      showToast('Error next track');
      console.warn('Error next track');
    }
  };

  const handlePreviousTrack = async () => {
    try {
      await fetch(`http://${server.ip}:3553/previous`);
    } catch {
      showToast('Error previous track');
      console.warn('Error previous track');
    }
  };

  const handlePause = async () => {
    try {
      const response = await fetch(`http://${server.ip}:3553/playpause`);
      const data = await response.json();
      if (data) {
        const status = playerState;
        setPlayerState(status === 'play' ? 'pause' : 'play');
      }
    } catch {
      showToast('Error set play/pause state');
      console.warn('Error set play/pause state');
    }
  };

  const handleShowSlider = async () => {
    setShowSlider(!showSlider);
    transition.value = withTiming(showSlider ? 0 : 1, { duration: 250 });
  };

  const handleSongPosition = async (positionMillis: number) => {
    try {
      setSongPosition(positionMillis);
      await fetch(`http://${server.ip}:3553/track/position`, {
        method: 'POST',
        body: JSON.stringify({ position: positionMillis / 1000 }),
      });
    } catch {
      showToast('Error set song position');
      console.warn('Error set song position');
    }
  };

  useEffect(() => {
    if (!server.ip) return;

    const fetchAllPlayerState = async () => {
      try {
        const requests = [
          fetch(`http://${server.ip}:3553/track/info`).then((res) => res.json()),
          fetch(`http://${server.ip}:3553/track/duration`).then((res) => res.json()),
          fetch(`http://${server.ip}:3553/track/repeat`).then((res) => res.json()),
          fetch(`http://${server.ip}:3553/shuffle`).then((res) => res.json()),
          fetch(`http://${server.ip}:3553/mute`).then((res) => res.json()),
          fetch(`http://${server.ip}:3553/volume`).then((res) => res.json()),
          fetch(`http://${server.ip}:3553/playerstate`).then((res) => res.json()),
        ];

        const results = await Promise.allSettled(requests);

        if (results[0].status === 'fulfilled') setSongInfo(results[0].value);
        if (results[1].status === 'fulfilled') setSongDuration(Number(results[1].value) * 1000);
        if (results[2].status === 'fulfilled') setRepeatState(results[2].value === -1);
        if (results[3].status === 'fulfilled') setShuffleState(results[3].value === -1);
        if (results[4].status === 'fulfilled') setMuteState(results[4].value === 1);
        if (results[5].status === 'fulfilled') setVolumeState(Number(results[5].value));
        if (results[6].status === 'fulfilled') setPlayerState(results[6].value === 0 ? 'stop' : results[6].value === 1 ? 'pause' : 'play');

        setImageUri(`http://${server.ip}:3553/track/cover?t=${new Date().getTime()}`);
      } catch (e) {
        console.warn('Error fetching states', e);
      }
    };

    fetchAllPlayerState();
  }, [server]);

  useEffect(() => {
    if (aimpEvent.playerState === null) return;
    if (aimpEvent.playerState === 2) setPlayerState('play');
    if (aimpEvent.playerState === 1) setPlayerState('pause');
  }, [aimpEvent.playerState]);

  useEffect(() => {
    if (aimpEvent.repeatState === null) return;
    if (aimpEvent.repeatState !== repeatState) setRepeatState(aimpEvent.repeatState);
  }, [aimpEvent.repeatState, repeatState]);

  useEffect(() => {
    if (aimpEvent.shuffleState === null) return;
    if (aimpEvent.shuffleState !== shuffleState) setShuffleState(aimpEvent.shuffleState);
  }, [aimpEvent.shuffleState, shuffleState]);

  useEffect(() => {
    if (aimpEvent.muteState === null) return;
    if (aimpEvent.muteState !== muteState) setMuteState(aimpEvent.muteState);
  }, [aimpEvent.muteState, muteState]);

  useEffect(() => {
    if (aimpEvent.volumeState !== null) setVolumeState(aimpEvent.volumeState);
  }, [aimpEvent.volumeState]);

  useEffect(() => {
    if (aimpEvent.position !== 0) setSongPosition(Math.trunc(Number(aimpEvent.position) * 1000));
  }, [aimpEvent.position]);

  useEffect(() => {
    if (aimpEvent.track.title || aimpEvent.track.filename) {
      setSongInfo({
        album: aimpEvent.track.album,
        artist: aimpEvent.track.artist,
        bitrate: aimpEvent.track.bitrate,
        genre: aimpEvent.track.genre,
        play_count: aimpEvent.track.play_count,
        rating: aimpEvent.track.rating,
        sample_rate: aimpEvent.track.sample_rate,
        title: aimpEvent.track.title,
        name: aimpEvent.track.name,
        filename: aimpEvent.track.filename,
      });
      setImageUri(`http://${server.ip}:3553/track/cover?t=${new Date().getTime()}`);
    }
  }, [aimpEvent.track, server.ip]);

  useEffect(() => {
    if (aimpEvent.track.duration && Math.trunc(aimpEvent.track.duration * 1000) !== songDuration) {
      setSongDuration(Math.trunc(aimpEvent.track.duration * 1000));
    }
  }, [aimpEvent.track.duration, songDuration]);

  const displayTitle = songInfo.title || songInfo.name || (songInfo.filename ? songInfo.filename.split('\\').pop()?.split('/').pop() : 'Unknown');

  return (
    <>
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
        <ImageBackground style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: screenHeight }} source={{ uri: imageUri }} transition={400} cachePolicy={'none'} placeholder={null} recyclingKey={imageUri}>
          <BlurView intensity={100} tint="dark" experimentalBlurMethod="dimezisBlurView" style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: screenHeight }} />
        </ImageBackground>
        <View style={styles.header}>
          <NormalButton onPress={() => router.back()} IconSet={Ionicons} iconName="chevron-down" />
          <View style={styles.headerInfo}>
            <Text style={styles.headerTitle}>Playing from</Text>
            <Text style={styles.headerSubtitle}>{server.name}</Text>
          </View>
          <NormalButton
            onPress={() =>
              router.navigate({
                pathname: '/(player)/songDetails',
                params: { song: JSON.stringify(songInfo) },
              })
            }
            IconSet={MaterialCommunityIcons}
            iconName="dots-vertical"
          />
        </View>
        <View style={styles.content}>
          <View style={[styles.songImage, { aspectRatio: 1 }]}>
            {imageUri && <Image source={{ uri: imageUri }} style={styles.image} transition={400} contentFit="cover" placeholder={null} cachePolicy={'none'} recyclingKey={imageUri} />}
          </View>
          <View style={styles.songInfo}>
            <Text style={styles.songTitle} numberOfLines={1} ellipsizeMode="tail">
              {displayTitle}
            </Text>
            <Text style={styles.songArtist} numberOfLines={1} ellipsizeMode="tail">
              {songInfo.artist || 'Unknown Artist'}
            </Text>
          </View>
        </View>
        <View style={styles.controls}>
          <View style={styles.playerExtraControls}>
            <Animated.View style={[styles.extraControlsWrapper, animatedSlider, { justifyContent: 'space-evenly', gap: 10 }]}>
              <View style={{ flexDirection: 'column' }}>
                <NormalButton
                  onPress={() => handleShowSlider()}
                  insideStyle={{ flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
                  TextElement={
                    <>
                      <Ionicons name="volume-medium-outline" size={24} color="white" />
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
                minimumTrackTintColor="#FFFFFF"
                maximumTrackTintColor="#C6C6C6"
                thumbTintColor="#FFFFFF"
                value={volumeState}
                onSlidingComplete={(e) => handleVolumeState(e)}
              />
            </Animated.View>
            <Animated.View style={[styles.extraControlsWrapper, animatedButtons]}>
              <NormalButton onPress={() => handleRepeatState()} IconSet={Ionicons} iconName="repeat" iconColor={repeatState ? 'white' : '#8b8b8b'} />
              <NormalButton onPress={() => handleShuffleState()} IconSet={Ionicons} iconName="shuffle" iconColor={shuffleState ? 'white' : '#8b8b8b'} />
              <NormalButton onPress={() => handleMuteState()} IconSet={Ionicons} iconName="volume-mute-outline" iconColor={muteState ? 'white' : '#8b8b8b'} />
              <NormalButton onPress={() => handleShowSlider()} IconSet={Ionicons} iconName="volume-medium-outline" />
            </Animated.View>
          </View>
          <View style={styles.playerSlider}>
            <Text style={styles.playerSliderTime}>{formatTimeHelper(songPosition)}</Text>
            <Slider
              style={{ flex: 1 }}
              step={1000}
              minimumValue={0}
              maximumValue={songDuration}
              minimumTrackTintColor="#FFFFFF"
              maximumTrackTintColor="#C6C6C6"
              thumbTintColor="#FFFFFF"
              value={songPosition}
              onSlidingComplete={(e) => handleSongPosition(e)}
            />
            <Text style={styles.playerSliderTime}>{formatTimeHelper(songDuration)}</Text>
          </View>
          <View style={styles.playerBasicControls}>
            <NormalButton rippleColor="rgba(139, 139, 139, 0.5)" onPress={() => handlePreviousTrack()} IconSet={Ionicons} iconName="play-skip-back" />
            <NormalButton
              rippleColor="rgba(139, 139, 139, 0.5)"
              onPress={() => handlePause()}
              containerStyle={{ width: 60, height: 60, borderColor: '#FFF', borderWidth: 2 }}
              IconSet={MaterialCommunityIcons}
              iconName={playerState === 'play' ? 'pause' : 'play'}
              iconSize={36}
            />
            <NormalButton rippleColor="rgba(139, 139, 139, 0.5)" onPress={() => handleNextTrack()} IconSet={Ionicons} iconName="play-skip-forward" />
          </View>
        </View>
      </View>
      <View style={{ position: 'absolute', top: 0, left: 0, right: 0, height: insets.top, backgroundColor: '#252525', filter: [{ opacity: 0.5 }] }} />
    </>
  );
}

const styles = StyleSheet.create({
  container: { position: 'relative', width: '100%', height: '100%' },
  header: { width: '100%', height: 60, paddingHorizontal: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerInfo: { flex: 1, paddingHorizontal: 20, flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  headerTitle: { color: '#C6C6C6', fontFamily: 'MPLUS-Regular', fontSize: 10, textAlign: 'center', textTransform: 'uppercase' },
  headerSubtitle: { color: '#FFF', fontFamily: 'MPLUS-Regular', fontSize: 12, textAlign: 'center' },
  content: { height: 'auto', paddingHorizontal: 20, paddingVertical: 10, alignContent: 'flex-start', justifyContent: 'flex-start', gap: 20 },
  songImage: { width: '100%', alignItems: 'center', justifyContent: 'flex-end', overflow: 'hidden', borderRadius: 20, elevation: 5 },
  image: { width: '100%', height: '100%' },
  songInfo: { paddingTop: 10, alignItems: 'center', justifyContent: 'flex-start', gap: 20 },
  songTitle: { color: '#FFF', fontFamily: 'MPLUS-ExtraBold', fontSize: 24 },
  songArtist: { color: '#8B8B8B', fontFamily: 'MPLUS', fontSize: 14 },
  controls: { marginTop: 10, paddingVertical: 20, flex: 1, alignItems: 'center', justifyContent: 'space-between', gap: 20 },
  playerExtraControls: { position: 'relative', width: '100%', height: 60, paddingHorizontal: 20, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  extraControlsWrapper: { position: 'absolute', width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  playerSlider: { position: 'relative', width: '100%', height: 60, paddingHorizontal: 20, flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center' },
  playerSliderTime: { color: '#FFF', fontFamily: 'MPLUS-Bold' },
  playerBasicControls: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 40, zIndex: 20 },
});
