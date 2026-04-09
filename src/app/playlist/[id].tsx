import PlaylistDetailsHeader from '@/components/playlist/playlistDetailsHeader';
import { PlaylistItem } from '@/components/playlist/playlistSongItem';
import TogglePlayer from '@/components/playlist/togglePlayer';
import { Drawer, DrawerBackground } from '@/components/ui/drawerNavigation';
import Header from '@/components/ui/header';
import { useSettings } from '@/context/appContext';
import { PlaylistInfoProps, PlaylistStatsProps } from '@/types/IPlaylistDetails';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Playlist() {
    const [searchbarVisible, setSearchbarVisible] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');
    const [playlistInfo, setPlaylistInfo] = useState<PlaylistInfoProps>();
    const [playlistStats, setPlaylistStats] = useState<PlaylistStatsProps>();
    const [playlistItems, setPlaylistItems] = useState<object[]>()
    const [currentPlaylist, setCurrentPlaylist] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const insets = useSafeAreaInsets();
    const transition = useSharedValue(0);
    const { id } = useLocalSearchParams();
    const { server } = useSettings();

    const filteredData = useMemo(() => {
        if (!playlistItems) return [];
        if (!searchValue.trim()) return playlistItems;

        return playlistItems.filter((song) => song.title?.toUpperCase().includes(searchValue.toUpperCase()));
    }, [searchValue, playlistItems])

    const handleShowDrawer = () => {
        transition.value = withTiming(transition.value ? 0 : 1, { duration: 500 });
    }

    const handlePlayItem = async (index: string) => {
        try {
            const response = await fetch(`http://${server.ip}:3553/playlist/play?id=${id}&index=${index}`);
            await response.json();
        } catch (error) {
            console.log('Error play item', error);
        }
    };

    const renderItem = useCallback(({ item }: object | any) => (
        <PlaylistItem
            item={item}
            onPress={() => handlePlayItem(item.index)}
        />
    ), []);

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

        const currentPlaylist = async () => {
            try {
                const response = await fetch(`http://${server.ip}:3553/playlist/current`);
                const data = await response.json();
                setCurrentPlaylist(data.id);
            } catch (error) {
                console.log('Error get playlist current', error);
            }
        };

        playlistInfo();
        playlistItems();
        currentPlaylist();
        setIsLoading(false);
    }, [id, server])

    return (
        <>
            {isLoading ?
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                    <ActivityIndicator size={'large'} color={'#8B8B8B'}></ActivityIndicator>
                </View>
                :
                <>
                    <Drawer transition={transition} currentPlaylist={currentPlaylist} />
                    <DrawerBackground transition={transition} />
                    <View style={[styles.container, { paddingTop: insets.top}]}>
                        <Header
                            searchBarVisible={searchbarVisible}
                            searchValue={searchValue}
                            setSearchBarVisible={setSearchbarVisible}
                            setSearchValue={setSearchValue}
                            LeftSideIconSet={Ionicons}
                            iconName='menu'
                            leftSideOnPress={() => handleShowDrawer()}
                            title={'a'}
                        />
                        <FlatList
                            data={filteredData}
                            keyExtractor={item => item.index.toString()}
                            style={{ width: '100%', }}
                            contentContainerStyle={{ paddingBottom: 80 + insets.bottom, gap: 10 }}
                            initialNumToRender={10}
                            maxToRenderPerBatch={10}
                            windowSize={5}
                            showsVerticalScrollIndicator={false}
                            ListHeaderComponent={
                                <PlaylistDetailsHeader
                                    playlistInfo={playlistInfo}
                                    playlistStats={playlistStats}
                                />
                            }
                            renderItem={renderItem}
                        />
                        <TogglePlayer />
                    </View>

                </>
            }
        </>
    )
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
        // backgroundColor: '#FFF',

        alignItems: 'center',
        justifyContent: 'flex-start',
    },
});