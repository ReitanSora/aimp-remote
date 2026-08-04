import PlaylistHeader from '@/components/playlist/PlaylistHeader';
import { SongItem } from '@/components/playlist/songItem';
import SearchHeader from '@/components/ui/Header';
import { useSettings } from '@/context/appContext';
import { Theme } from '@/theme';
import { PlaylistInfo, PlaylistItem, PlaylistStats } from '@/types/playlists';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, NativeScrollEvent, NativeSyntheticEvent, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
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
    const { id } = useLocalSearchParams();
    const { actualServer } = useSettings();
    const router = useRouter();
    const flatListRef = useRef<FlatList<PlaylistItem>>(null);
    const isHeaderVisibleRef = useRef(true);

    const isHeaderHidden = useSharedValue(0);

    const textStyle = useAnimatedStyle(() => ({
        opacity: withTiming(isHeaderHidden.value),
    }));

    const blurContainerStyle = useAnimatedStyle(() => ({
        opacity: withTiming(isHeaderHidden.value),
    }));

    const handleScroll = (event: NativeSyntheticEvent<NativeScrollEvent>) => {
        const offsetY = event.nativeEvent.contentOffset.y;

        if (offsetY >= headerHeight && isHeaderVisibleRef.current) {
            isHeaderVisibleRef.current = false;
            isHeaderHidden.set(1);
        } else if (offsetY < headerHeight && !isHeaderVisibleRef.current) {
            isHeaderVisibleRef.current = true;
            isHeaderHidden.set(0);
        }
    };

    const filteredData = useMemo(() => {
        if (!playlistItems) return [];
        if (!searchValue.trim()) return playlistItems;

        return playlistItems.filter(
            (song) => song.title?.toUpperCase().includes(searchValue.toUpperCase()) || song.artist?.toUpperCase().includes(searchValue.toUpperCase()),
        );
    }, [searchValue, playlistItems]);

    const handlePlayItem = useCallback(
        async (index: string) => {
            try {
                const response = await fetch(`http://${actualServer.ip}:3553/playlist/play?id=${id}&index=${index}`);
                await response.json();
            } catch (error) {
                console.log('Error play item', error);
            }
        },
        [actualServer.ip, id],
    );

    const renderItem = useCallback(
        ({ item }: { item: PlaylistItem }) => (
            <SongItem
                item={item}
                onPress={() => handlePlayItem(item.index)}
            />
        ),
        [handlePlayItem],
    );

    const listHeader = useMemo(
        () => (
            <PlaylistHeader
                playlistInfo={playlistInfo}
                playlistStats={playlistStats}
                setHeaderHeight={setHeaderHeight}
                headerStyle={{ paddingTop: insets.top + 60 }}
            />
        ),
        [playlistInfo, playlistStats],
    );

    useEffect(() => {
        let isMounted = true;
        setIsLoading(true);

        const fetchPlaylistData = async () => {
            try {
                const [infoResponse, statsResponse, itemsResponse] = await Promise.all([
                    fetch(`http://${actualServer.ip}:3553/playlist/info?id=${id}`),
                    fetch(`http://${actualServer.ip}:3553/playlist/stats?id=${id}`),
                    fetch(`http://${actualServer.ip}:3553/playlist/items?id=${id}`),
                ]);

                const [infoData, statsData, itemsData] = await Promise.all([infoResponse.json(), statsResponse.json(), itemsResponse.json()]);

                if (isMounted) {
                    setPlaylistInfo(infoData);
                    setPlaylistStats(statsData);
                    setPlaylistItems(itemsData);
                }
            } catch (error) {
                console.error('Error fetching playlist data:', error);
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchPlaylistData();
        return () => {
            isMounted = false;
        };
    }, [id, actualServer.ip]);

    useEffect(() => {
        if (searchValue.trim().length > 0 && flatListRef.current) {
            flatListRef.current.scrollToOffset({ offset: 500 + insets.top, animated: true });
        }
    }, [searchValue]);

    if (isLoading) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator
                    size='large'
                    color={Theme.colors.darkGray}
                />
            </View>
        );
    }

    return (
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
                    headerStyle={{ backgroundColor: 'transparent', position: 'absolute', top: insets.top, height: 60, zIndex: 2 }}
                    title={playlistInfo.name}
                    titleStyle={textStyle}
                />
                <Animated.View
                    style={[
                        blurContainerStyle,
                        {
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: Theme.colors.background,
                            height: 60 + insets.top,

                            borderBottomWidth: 1,
                            borderBottomColor: Theme.colors.darkGray,

                            elevation: 4,
                            zIndex: 1,
                        },
                    ]}
                    pointerEvents={'none'}
                />
                <FlatList
                    ref={flatListRef}
                    data={filteredData}
                    keyExtractor={(item) => item.index.toString()}
                    style={{ width: '100%' }}
                    contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
                    initialNumToRender={10}
                    maxToRenderPerBatch={10}
                    windowSize={5}
                    showsVerticalScrollIndicator={false}
                    onScroll={handleScroll}
                    overScrollMode='never'
                    removeClippedSubviews={true}
                    onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}
                    ListHeaderComponent={listHeader}
                    renderItem={renderItem}
                />
            </KeyboardAvoidingView>
        </>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,

        alignItems: 'center',
        justifyContent: 'flex-start',
    },
});
