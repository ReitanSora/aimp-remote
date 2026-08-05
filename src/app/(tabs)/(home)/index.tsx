import SearchHeader from '@/components/ui/Header';
import IconButton from '@/components/ui/IconButton';
import { useSettings } from '@/context/AppContext';
import { Theme } from '@/theme';
import { Playlists } from '@/types/playlists';
import { Image } from 'expo-image';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { FlatList, KeyboardAvoidingView, RefreshControl, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface PlaylistsWithImage extends Playlists {
    imageUrl: string;
}

interface PlaylistItemProps {
    actualServerIp: string;
    item: PlaylistsWithImage;
    onPress: (value: string) => void;
}

function PlaylistItem({ actualServerIp, item, onPress }: PlaylistItemProps) {
    const imageSource = useMemo(
        () => ({
            uri: `http://${actualServerIp}:3553/playlist/cover?id=${item.id}`,
        }),
        [actualServerIp, item.id],
    );

    return (
        <IconButton
            onPress={() => onPress(item.id)}
            containerStyle={{ flex: 1, height: 'auto', borderRadius: 20 }}
            insideStyle={{ backgroundColor: Theme.colors.lightBlack }}
            InsideElement={
                <View style={[styles.playlistItemInside]}>
                    <Image
                        source={imageSource}
                        style={{ width: '100%', height: 150, borderRadius: 10 }}
                        transition={200}
                        contentFit='cover'
                        cachePolicy={'disk'}
                        recyclingKey={item.id}
                    />
                    <View style={{ gap: 5 }}>
                        <Text style={[styles.text, { fontFamily: 'MPLUS-Bold', fontSize: Theme.fontSize.subtitle }]}>{item.name}</Text>
                        <Text style={[styles.text, { fontSize: Theme.fontSize.paragraph }]}>{item.itemCount} songs</Text>
                    </View>
                </View>
            }
        />
    );
}

export default function Home() {
    const [playlists, setPlaylists] = useState<Array<PlaylistsWithImage>>();
    const [searchbarVisible, setSearchbarVisible] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');
    const [refreshing, setRefreshing] = useState<boolean>(false);
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { actualServer } = useSettings();

    const showToast = (message: string) => {
        ToastAndroid.show(message, ToastAndroid.SHORT);
    };

    const filteredData = useMemo(() => {
        if (!playlists) return [];
        if (!searchValue.trim()) return playlists;

        return playlists.filter((playlist) => playlist.name.toUpperCase().includes(searchValue.toUpperCase()));
    }, [searchValue, playlists]);

    const getPlaylists = useCallback(async () => {
        try {
            if (actualServer.ip === '127.0.0.1') {
                setPlaylists([]);
                return;
            }

            const response = await fetch(`http://${actualServer.ip}:3553/playlist/list`);
            const info = await response.json();

            setPlaylists(info);
        } catch (e) {
            showToast('Error get playlists');
        }
    }, [actualServer]);

    const handlePress = useCallback((id: string) => {
        router.navigate({ pathname: '/(tabs)/(home)/playlist/[id]', params: { id: id } });
    }, []);

    const renderItem = useCallback(
        ({ item }: { item: PlaylistsWithImage }) => (
            <PlaylistItem
                item={item}
                actualServerIp={actualServer.ip}
                onPress={handlePress}
            />
        ),
        [actualServer, handlePress],
    );

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await getPlaylists();
        setRefreshing(false);
    }, [getPlaylists]);

    useFocusEffect(
        useCallback(() => {
            onRefresh();
        }, [onRefresh]),
    );

    return (
        <KeyboardAvoidingView
            behavior='height'
            style={[styles.container, { paddingTop: insets.top }]}>
            <SearchHeader
                searchBarVisible={searchbarVisible}
                searchValue={searchValue}
                setSearchBarVisible={setSearchbarVisible}
                setSearchValue={setSearchValue}
                title='Home'
            />
            {playlists && (
                <FlatList
                    data={filteredData}
                    keyExtractor={(item: Playlists) => item.id}
                    numColumns={2}
                    columnWrapperStyle={{ gap: 20 }}
                    contentContainerStyle={{ width: '100%', padding: 20, paddingBottom: insets.bottom + 90, gap: 20 }}
                    style={{ width: '100%' }}
                    ListEmptyComponent={
                        <View style={styles.emptyElementContainer}>
                            <Text style={[styles.text, { fontFamily: Theme.fontFamily.bold }]}>Connect to a server to show your playlists here</Text>
                        </View>
                    }
                    refreshControl={
                        <RefreshControl
                            refreshing={refreshing}
                            onRefresh={onRefresh}
                            colors={[Theme.colors.lightBlack]}
                            progressBackgroundColor={Theme.colors.accent}
                        />
                    }
                    renderItem={renderItem}
                />
            )}
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
        // backgroundColor: '#c6c6c6',

        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    //Empty Elementt Styles
    emptyElementContainer: {
        width: '100%',
        height: 100,
        backgroundColor: Theme.colors.lightBlack,

        alignItems: 'center',
        justifyContent: 'center',

        borderRadius: 20,
    },
    //Content Styles
    content: {
        width: '100%',
        padding: 20,
    },
    playlistItem: {
        flex: 1,
        height: 100,
        overflow: 'hidden',

        borderRadius: 20,
    },
    playlistItemInside: {
        flex: 1,
        padding: 10,
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
        gap: 10,
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
    },
});
