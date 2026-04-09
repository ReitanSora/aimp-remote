import TogglePlayer from '@/components/playlist/togglePlayer';
import { Drawer, DrawerBackground } from '@/components/ui/drawerNavigation';
import Header from '@/components/ui/header';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, StyleSheet, Text, ToastAndroid, TouchableNativeFeedback, View } from 'react-native';
import { useSharedValue, withTiming } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../context/appContext';

export default function Home() {

    const [playlists, setPlaylists] = useState<object[]>();
    const [currentPlaylist, setCurrentPlaylist] = useState<string>('');
    const [searchbarVisible, setSearchbarVisible] = useState<boolean>(false);
    const [searchValue, setSearchValue] = useState<string>('');
    const transition = useSharedValue(0);
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { server, appColor } = useSettings();

    const showToast = (message: string) => {
        ToastAndroid.show(message, ToastAndroid.SHORT);
    };

    const formatData = (data: object[], columns: number) => {
        const numberOfFullRows = Math.floor(data.length / columns);
        let numberOfElementsLastRow = data.length - (numberOfFullRows * columns);

        while (numberOfElementsLastRow !== columns && numberOfElementsLastRow !== 0) {
            data.push({ empty: true });
            numberOfElementsLastRow++;
        }

        return data;
    };

    const filteredData = useMemo(() => {
        if (!playlists) return [];
        if (!searchValue.trim()) return playlists;

        return playlists.filter((playlist) => playlist.name?.toUpperCase().includes(searchValue.toUpperCase()));
    }, [searchValue, playlists])

    const handleShowDrawer = () => {
        transition.value = withTiming(transition.value ? 0 : 1, { duration: 500 });
    }

    useEffect(() => {
        const playlistInfo = async () => {
            try {
                const response = await fetch(`http://${server.ip}:3553/playlist`);
                const info = await response.json();

                setPlaylists(info);
            } catch (e) {
                // showToast('Error get playlist info');
                console.log(e)
            }
        };

        const currentPlaylist = async () => {
            try {
                const response = await fetch(`http://${server.ip}:3553/playlist/current`);
                const data = await response.json();
                setCurrentPlaylist(data.id);
            } catch (e) {
                // showToast('Error get current playlist');
                console.log(e)
            }
        };

        playlistInfo();
        currentPlaylist();
    }, [server])
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
                    iconName='menu'
                    leftSideOnPress={() => handleShowDrawer()}
                />
                <View style={styles.content}>
                    {playlists &&
                        <FlatList
                            data={formatData(filteredData, 2)}
                            keyExtractor={item => item.id}
                            numColumns={2}
                            ListHeaderComponent={() => {
                                return (
                                    <Text style={[styles.text, { fontFamily: 'MPLUS-Bold' }]}>Playlists</Text>
                                )
                            }}
                            columnWrapperStyle={{ gap: 20 }}
                            contentContainerStyle={{ width: '100%', gap: 20 }}
                            renderItem={({ item }) => {
                                if (item.empty) {
                                    return (<View style={[styles.playlistItem, { backgroundColor: 'transparent' }]} />)
                                }
                                return (
                                    <View key={item.id} style={[styles.playlistItem, { backgroundColor: appColor }]}>
                                        <TouchableNativeFeedback
                                            background={TouchableNativeFeedback.Ripple('rgba(139, 139, 139, 0.5)', false)}
                                            useForeground
                                            onPress={() => router.navigate({ pathname: '/playlist/[id]', params: { id: item.id } })}
                                        >
                                            <View style={[styles.playlistItemInside]}>
                                                <MaterialCommunityIcons name="folder-music-outline" size={24} color="white" />
                                                <View>
                                                    <Text style={[styles.text, { fontFamily: 'MPLUS-Bold' }]}>{item.name}</Text>
                                                    <Text style={[styles.text, { color: appColor === '#8B8B8B' ? '#FFF' : '#C6C6C6', fontSize: 10 }]}>{item.itemCount} items</Text>
                                                </View>
                                                {/* {item.id === currentPlaylist &&
                                                    <View style={styles.playState} />
                                                } */}
                                            </View>
                                        </TouchableNativeFeedback>
                                    </View>
                                )
                            }}
                        />}
                </View>
            </View>
            <TogglePlayer />
        </>
    )
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        minHeight: '100%',
        // backgroundColor: '#FFF',

        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    //Content Styles
    content: {
        width: '100%',
        padding: 20,
    },
    playlistItem: {
        flex: 1,
        overflow: 'hidden',

        borderRadius: 20,
    },
    playlistItemInside: {

        flex: 1,
        padding: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 20,

        borderRadius: 20,
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
    }
});