import TogglePlayer from '@/components/playlist/togglePlayer';
import { Drawer, DrawerBackground } from '@/components/ui/drawerNavigation';
import Header from '@/components/ui/header';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, TouchableNativeFeedback, useWindowDimensions, View } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../context/appContext';
import { Colors } from '@/theme';
import Skeleton from '@/components/ui/Skeleton';
import OfflineScreen from '@/components/ui/OfflineScreen';

type Playlist = {
  id: string;
  itemCount: number;
  name: string;
};

type EmptyPlaylistItem = {
  empty: true;
};

type PlaylistItem = Playlist | EmptyPlaylistItem;

export default function Home() {
  const [playlists, setPlaylists] = useState<Playlist[]>([]);
  const [currentPlaylist, setCurrentPlaylist] = useState<string>('');
  const [searchbarVisible, setSearchbarVisible] = useState<boolean>(false);
  const [searchValue, setSearchValue] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const transition = useSharedValue(0);
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { server, appColor, theme } = useSettings();
  const currentThemeColors = Colors[theme];
  const { width } = useWindowDimensions();

  const numColumns = width > 600 ? 3 : 2;

  const formatData = (data: Playlist[], columns: number): PlaylistItem[] => {
    const newData: PlaylistItem[] = [...data];

    const numberOfFullRows = Math.floor(newData.length / columns);

    let numberOfElementsLastRow = newData.length - numberOfFullRows * columns;

    while (numberOfElementsLastRow !== columns && numberOfElementsLastRow !== 0) {
      newData.push({ empty: true });
      numberOfElementsLastRow++;
    }

    return newData;
  };

  const filteredData = useMemo(() => {
    if (!playlists) return [];
    if (!searchValue.trim()) return playlists;

    return playlists.filter((playlist) => playlist.name?.toUpperCase().includes(searchValue.toUpperCase()));
  }, [searchValue, playlists]);

  const handleShowDrawer = () => {
    transition.value = withTiming(transition.value ? 0 : 1, { duration: 500 });
  };

  const fetchData = useCallback(async () => {
    if (!server || !server.ip) return;
    setIsLoading(true);
    setIsOffline(false);

    try {
      const [playlistResponse, currentPlaylistResponse] = await Promise.all([fetch(`http://${server.ip}:3553/playlist`), fetch(`http://${server.ip}:3553/playlist/current`)]);

      if (!playlistResponse.ok || !currentPlaylistResponse.ok) throw new Error('Server response error');

      const info = await playlistResponse.json();
      const currentData = await currentPlaylistResponse.json();

      setPlaylists(info);
      setCurrentPlaylist(currentData.id);
    } catch (e) {
      console.warn('Error fetching playlists data', e);
      setIsOffline(true);
    } finally {
      setIsLoading(false);
    }
  }, [server]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const renderSkeletons = () => {
    return (
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
        {[...Array(6)].map((_, index) => (
          <View key={index} style={{ flex: 1, minWidth: '40%' }}>
            <Skeleton width="100%" height={80} borderRadius={20} theme={theme} />
          </View>
        ))}
      </View>
    );
  };
  return (
    <>
      <Drawer transition={transition} currentPlaylist={currentPlaylist} />
      <DrawerBackground transition={transition} />
      <View style={[styles.container, { paddingTop: insets.top, paddingBottom: 80 + insets.bottom }]}>
        <Header
          searchBarVisible={searchbarVisible}
          searchValue={searchValue}
          setSearchBarVisible={setSearchbarVisible}
          setSearchValue={setSearchValue}
          LeftSideIconSet={Ionicons}
          iconName="menu"
          leftSideOnPress={() => handleShowDrawer()}
        />

        <View style={styles.content}>
          {isOffline ? (
            <OfflineScreen theme={theme} appColor={appColor} onRetry={fetchData} />
          ) : isLoading ? (
            renderSkeletons()
          ) : (
            <FlatList
              data={formatData(filteredData, numColumns)}
              keyExtractor={(item, index) => ('id' in item ? item.id : `empty-${index}`)}
              numColumns={numColumns}
              key={numColumns}
              ListHeaderComponent={() => {
                return <Text style={[styles.text, { fontFamily: 'MPLUS-Bold', color: currentThemeColors.text }]}>Playlists</Text>;
              }}
              columnWrapperStyle={{ gap: 20 }}
              contentContainerStyle={{ width: '100%', gap: 20 }}
              showsVerticalScrollIndicator={false}
              renderItem={({ item }) => {
                if ('empty' in item) {
                  return <View style={[styles.playlistItem, { backgroundColor: 'transparent' }]} />;
                }
                return (
                  <View key={item.id} style={[styles.playlistItem, { backgroundColor: appColor }]}>
                    <TouchableNativeFeedback background={TouchableNativeFeedback.Ripple('rgba(255, 255, 255, 0.3)', false)} useForeground onPress={() => router.navigate({ pathname: '/playlist/[id]', params: { id: item.id } })}>
                      <View style={[styles.playlistItemInside]}>
                        <MaterialCommunityIcons name="folder-music-outline" size={24} color="#FFFFFF" />
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.text, { fontFamily: 'MPLUS-Bold' }]} numberOfLines={1}>
                            {item.name}
                          </Text>
                          <Text style={[styles.text, { color: 'rgba(255, 255, 255, 0.7)', fontSize: 10 }]}>{item.itemCount} items</Text>
                        </View>
                        {item.id === currentPlaylist && <View style={styles.playState} />}
                      </View>
                    </TouchableNativeFeedback>
                  </View>
                );
              }}
            />
          )}
        </View>
      </View>
      {!isOffline && <TogglePlayer />}
    </>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', minHeight: '100%', alignItems: 'center', justifyContent: 'flex-start' },
  content: { width: '100%', padding: 20, flex: 1 },
  playlistItem: { flex: 1, overflow: 'hidden', borderRadius: 20, minHeight: 80 },
  playlistItemInside: { flex: 1, padding: 20, flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 15 },
  text: { color: '#FFF', fontFamily: 'MPLUS-Regular', fontSize: 14 },
  playState: { width: 8, height: 8, backgroundColor: '#FFFFFF', borderRadius: 4 },
});
