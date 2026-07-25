import Header from '@/components/playlist/header';
import { SongItem } from '@/components/playlist/songItem';
import SearchHeader from '@/components/ui/Header';
import { useSettings } from '@/context/appContext';
import { Theme } from '@/theme';
import { PlaylistInfo, PlaylistItem, PlaylistStats } from '@/types/playlists';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from 'react-native';
import { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const DEFAULT_PLAYLIST = {
    info: {
        duration: 0,
        id: 'DEFAULT_PLAYLIST',
        is_read_only: '',
        item_count: 0,
        name: 'UNKNOWN PLAYLIST',
        playing_index: 0,
    },
    stats: {
        album_count: 0,
        artist_count: 0,
        artists: [],
        avg_bitrate: 0,
        avg_rating: 0,
        genres: [],
        total_play_count: 0,
        total_size_bytes: 0,
        tracks_never_played: 0,
        tracks_with_rating: 0,
    },
};

export default function Playlist() {
    const [searchbarVisible, setSearchbarVisible] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');
    const [playlistInfo, setPlaylistInfo] = useState<PlaylistInfo>(DEFAULT_PLAYLIST.info);
    const [playlistStats, setPlaylistStats] = useState<PlaylistStats>(DEFAULT_PLAYLIST.stats);
    const [playlistItems, setPlaylistItems] = useState<Array<PlaylistItem>>();
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [headerHeight, setHeaderHeight] = useState<number>(0);
    const insets = useSafeAreaInsets();
    const transition = useSharedValue(0);
    const isHeaderVisible = useSharedValue(1);
    const { id } = useLocalSearchParams();
    const { actualServer: server } = useSettings();
    const router = useRouter();
    const isHeaderVisibleRef = useRef(true);

    const textStyle = useAnimatedStyle(() => {
        return {
            opacity: isHeaderVisible.value === 0 ? withTiming(1, { duration: 200 }) : withTiming(0, { duration: 200 }),
        };
    });

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;

        if (offsetY >= headerHeight && isHeaderVisibleRef.current) {
            isHeaderVisibleRef.current = false;
            isHeaderVisible.set(0);
        } else if (offsetY < headerHeight && !isHeaderVisibleRef.current) {
            isHeaderVisibleRef.current = true;
            isHeaderVisible.set(1);
        }
    };

    const filteredData = useMemo(() => {
        if (!playlistItems) return [];
        if (!searchValue.trim()) return playlistItems;

        return playlistItems.filter(
            (song) => song.title?.toUpperCase().includes(searchValue.toUpperCase()) || song.artist?.toUpperCase().includes(searchValue.toUpperCase()),
        );
    }, [searchValue, playlistItems]);

    const handlePlayItem = async (index: string) => {
        try {
            const response = await fetch(`http://${server.ip}:3553/playlist/play?id=${id}&index=${index}`);
            await response.json();
        } catch (error) {
            console.log('Error play item', error);
        }
    };

    const renderItem = useCallback(
        ({ item }: object | any) => (
            <SongItem
                item={item}
                onPress={() => handlePlayItem(item.index)}
            />
        ),
        [],
    );

    useEffect(() => {
        const playlistInfo = async () => {
            try {
                const infoResponse = await fetch(`http://${server.ip}:3553/playlist/info?id=${id}`);
                const infoData = await infoResponse.json();
                setPlaylistInfo(infoData);

                const statsResponse = await fetch(`http://${server.ip}:3553/playlist/stats?id=${id}`);
                const statsData = await statsResponse.json();
                setPlaylistStats(statsData);
            } catch (error) {
                console.log('Error get playlist info', error);
            }
        };

        const playlistItems = async () => {
            try {
                const response = await fetch(`http://${server.ip}:3553/playlist/items?id=${id}`);
                const data = await response.json();
                setPlaylistItems(data);
            } catch (error) {
                console.log('Error get playlist items', error);
            }
        };

        playlistInfo();
        playlistItems();
        setIsLoading(false);
    }, [id, server]);

    return (
        <>
            {isLoading ? (
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator
                        size={'large'}
                        color={'#8B8B8B'}
                    />
                </View>
            ) : (
                <>
                    <KeyboardAvoidingView
                        behavior='height'
                        style={[styles.container]}>
                        <SearchHeader
                            searchBarVisible={searchbarVisible}
                            searchValue={searchValue}
                            setSearchBarVisible={setSearchbarVisible}
                            setSearchValue={setSearchValue}
                            hasLeftAction={true}
                            onLeftActionPress={() => router.back()}
                            headerStyle={{ backgroundColor: Theme.colors.accent, paddingTop: insets.top, height: 60 + insets.top }}
                            title={playlistInfo.name}
                            titleStyle={textStyle}
                        />
                        <FlatList
                            data={filteredData}
                            keyExtractor={(item) => item.index.toString()}
                            style={{ width: '100%' }}
                            contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
                            initialNumToRender={10}
                            maxToRenderPerBatch={10}
                            windowSize={5}
                            showsVerticalScrollIndicator={false}
                            onScroll={handleScroll}
                            onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
                            overScrollMode='never'
                            removeClippedSubviews={true}
                            ListHeaderComponent={
                                <Header
                                    playlistInfo={playlistInfo}
                                    playlistStats={playlistStats}
                                    setHeaderHeight={setHeaderHeight}
                                />
                            }
                            renderItem={renderItem}
                        />
                    </KeyboardAvoidingView>
                </>
            )}
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
        // backgroundColor: '#FFF',

        alignItems: 'center',
        justifyContent: 'flex-start',
    },
});
