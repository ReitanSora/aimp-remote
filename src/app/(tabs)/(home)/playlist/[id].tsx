import PlaylistHeader from '@/components/playlist/PlaylistHeader';
import { SongItem } from '@/components/playlist/songItem';
import SearchHeader from '@/components/ui/Header';
import { useSettings } from '@/context/appContext';
import { Theme } from '@/theme';
import { PlaylistInfo, PlaylistItem, PlaylistStats } from '@/types/playlists';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, KeyboardAvoidingView, StyleSheet, View } from 'react-native';
import Animated, { useAnimatedScrollHandler, useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
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

    const insets = useSafeAreaInsets();
    const { id } = useLocalSearchParams();
    const { actualServer } = useSettings();
    const router = useRouter();
    const flatListRef = useRef<FlatList<PlaylistItem>>(null);

    const headerHeight = useSharedValue<number>(300);

    const isHeaderHidden = useSharedValue(0);

    const textStyle = useAnimatedStyle(() => ({
        opacity: withTiming(isHeaderHidden.value),
    }));

    const blurContainerStyle = useAnimatedStyle(() => ({
        opacity: withTiming(isHeaderHidden.value),
    }));

    const scrollHandler = useAnimatedScrollHandler({
        onScroll: (event) => {
            const offsetY = event.contentOffset.y;
            const targetHeight = headerHeight.value;

            if (offsetY >= targetHeight && isHeaderHidden.value !== 1) {
                isHeaderHidden.value = withTiming(1, { duration: 200 });
            } else if (offsetY < targetHeight && isHeaderHidden.value !== 0) {
                isHeaderHidden.value = withTiming(0, { duration: 200 });
            }
        },
    });

    const setHeaderHeight = useCallback((height: number) => {
        if (height > 0) {
            headerHeight.value = height;
        }
    }, []);

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
                await fetch(`http://${actualServer.ip}:3553/playlist/play?id=${id}&index=${index}`);
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
            flatListRef.current.scrollToOffset({ offset: headerHeight.value - 80, animated: true });
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
            <Animated.FlatList
                ref={flatListRef}
                data={filteredData}
                keyExtractor={(item) => `playlist-item-${item.index}`}
                style={{ width: '100%' }}
                contentContainerStyle={{ paddingBottom: 80 + insets.bottom }}
                initialNumToRender={15}
                maxToRenderPerBatch={15}
                windowSize={7}
                removeClippedSubviews={true}
                showsVerticalScrollIndicator={false}
                overScrollMode='never'
                onScroll={scrollHandler}
                scrollEventThrottle={16}
                ListHeaderComponent={
                    <PlaylistHeader
                        playlistInfo={playlistInfo}
                        playlistStats={playlistStats}
                        setHeaderHeight={setHeaderHeight}
                        headerStyle={{ paddingTop: insets.top + 60 }}
                    />
                }
                renderItem={renderItem}
            />
        </KeyboardAvoidingView>
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
