import { useSettings } from '@/context/appContext';
import { Theme } from '@/theme';
import { PlaylistDetailsHeader } from '@/types/playlists';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurTargetView, BlurView } from 'expo-blur';
import { Image, ImageBackground } from 'expo-image';
import React, { useRef } from 'react';
import { ScrollView, StyleSheet, Text, View, ViewStyle } from 'react-native';

interface PlaylistHeaderProps extends PlaylistDetailsHeader {
    setHeaderHeight?: (value: number) => void;
    headerStyle?: ViewStyle;
}

export default function PlaylistHeader({ playlistInfo, playlistStats, setHeaderHeight = () => {}, headerStyle }: PlaylistHeaderProps) {
    const { actualServer } = useSettings();
    const targetRef = useRef<View | null>(null);

    function formatTime(totalSeconds: number): string {
        if (totalSeconds <= 0) return '0 segundos';

        const hours: number = Math.floor(totalSeconds / 3600);
        const minutes: number = Math.floor((totalSeconds % 3600) / 60);
        const seconds: number = Math.floor(totalSeconds % 60);

        const parts: string[] = [];

        if (hours > 0) {
            parts.push(`${hours} ${hours === 1 ? 'hour' : 'hours'}`);
        }

        if (minutes > 0) {
            parts.push(`${minutes} ${minutes === 1 ? 'min' : 'mins'}`);
        }

        if (seconds > 0 && hours === 0) {
            parts.push(`${seconds} ${'s'}`);
        }

        return parts.join(' ');
    }

    function formatBytes(bytes: number, decimals: number = 2): string {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        const value = parseFloat((bytes / Math.pow(k, i)).toFixed(dm));

        return `${value} ${sizes[i]}`;
    }

    const fixedDuration = formatTime(playlistInfo?.duration);
    const fixedSize = formatBytes(playlistStats?.total_size_bytes);

    return (
        <View
            style={[styles.playlistInfo, headerStyle]}
            onLayout={(e) => setHeaderHeight(e.nativeEvent.layout.height)}>
            <BlurTargetView
                ref={targetRef}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: 600 }}>
                <ImageBackground
                    style={{ flex: 1 }}
                    source={{ uri: `http://${actualServer.ip}:3553/playlist/cover?id=${playlistInfo.id}` }}
                    transition={250}
                    cachePolicy={'memory'}
                />
            </BlurTargetView>
            <BlurView
                intensity={400}
                tint='systemMaterialDark'
                blurTarget={targetRef}
                blurMethod='dimezisBlurViewSdk31Plus'
                style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, height: 600 }}
            />
            <View style={styles.imageContainer}>
                <Image
                    source={{ uri: `http://${actualServer.ip}:3553/playlist/cover?id=${playlistInfo.id}` }}
                    style={{ width: '100%', height: '100%' }}
                    contentFit='contain'
                    transition={250}
                    cachePolicy={'memory'}
                />
            </View>
            <View
                style={[
                    styles.gradientBox,
                    {
                        experimental_backgroundImage: `linear-gradient(0deg, ${Theme.colors.background} 15%, transparent)`,
                    },
                ]}
            />
            <Text style={[styles.infoText, { color: '#FFF', fontSize: Theme.fontSize.title, fontFamily: Theme.fontFamily.condensed }]}>
                {playlistInfo?.name}
            </Text>
            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}>
                <View style={styles.info}>
                    <View style={styles.infoPill}>
                        <Ionicons
                            name='musical-notes-outline'
                            size={24}
                            color='#C6C6C6'
                        />
                        <Text style={styles.infoText}>{playlistInfo?.item_count}</Text>
                    </View>
                    <View style={styles.infoPill}>
                        <Ionicons
                            name='time-outline'
                            size={24}
                            color='#C6C6C6'
                        />
                        <Text style={styles.infoText}>{fixedDuration}</Text>
                    </View>
                    <View style={styles.infoPill}>
                        <Ionicons
                            name='play-outline'
                            size={24}
                            color='#C6C6C6'
                        />
                        <Text style={styles.infoText}>{playlistStats?.total_play_count} times</Text>
                    </View>
                    <View style={styles.infoPill}>
                        <Ionicons
                            name='person-circle-outline'
                            size={24}
                            color='#C6C6C6'
                        />
                        <Text style={styles.infoText}>{playlistStats?.artist_count}</Text>
                    </View>
                    <View style={styles.infoPill}>
                        <Ionicons
                            name='albums-outline'
                            size={24}
                            color='#C6C6C6'
                        />
                        <Text style={styles.infoText}>{playlistStats?.album_count}</Text>
                    </View>
                    <View style={styles.infoPill}>
                        <MaterialCommunityIcons
                            name='music-box-outline'
                            size={24}
                            color='#C6C6C6'
                        />
                        <Text style={styles.infoText}>{playlistStats?.genres.length} Genres</Text>
                    </View>
                </View>
            </ScrollView>
            <View style={styles.stats}>
                <View style={[styles.infoPill, { backgroundColor: 'transparent', elevation: 0 }]}>
                    <Ionicons
                        name='folder-open-outline'
                        size={24}
                        color='#C6C6C6'
                    />
                    <Text style={styles.infoText}>{fixedSize}</Text>
                </View>
                <View style={styles.statSeparator} />
                <View style={[styles.infoPill, { backgroundColor: 'transparent', elevation: 0 }]}>
                    <Text style={styles.infoText}>{playlistStats?.avg_bitrate.toFixed(2)} kbps</Text>
                </View>
                <View style={styles.statSeparator} />
                <View style={[styles.infoPill, { backgroundColor: 'transparent', elevation: 0 }]}>
                    <Ionicons
                        name='star-outline'
                        size={24}
                        color='#C6C6C6'
                    />
                    <Text style={styles.infoText}>{playlistStats?.avg_rating.toFixed(2)} avg</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    playlistInfo: {
        position: 'relative',

        width: '100%',
        height: 600,
        padding: 20,

        alignItems: 'center',
        justifyContent: 'flex-end',
        gap: 20,
    },
    imageContainer: {
        width: 300,
        height: 300,

        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',

        borderRadius: 20,
        boxShadow: '0px 0px 15px 5px rgba(0, 0, 0, 0.2)',
    },
    gradientBox: {
        position: 'absolute',
        left: 0,
        right: 0,
        bottom: 0,

        height: 250,
    },
    info: {
        // backgroundColor: '#FFF',

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    infoPill: {
        backgroundColor: Theme.colors.lightBlack,
        paddingHorizontal: 10,
        paddingVertical: 5,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,

        borderRadius: 20,

        boxShadow: '0px 0px 10px 0px rgba(0, 0, 0, 0.1)',
    },
    infoText: {
        color: '#C6C6C6',
        fontFamily: 'MPLUS-Regular',
        fontSize: 10,
    },
    stats: {
        width: '100%',
        // backgroundColor: '#fff',

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 5,
    },
    statSeparator: {
        width: 5,
        height: 5,
        backgroundColor: '#8B8B8B',
        borderRadius: 5,
    },
});
