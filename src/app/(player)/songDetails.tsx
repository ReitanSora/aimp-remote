import { SongInterface } from '@/types/ISongInformation';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Link, useLocalSearchParams } from 'expo-router';
import React from 'react';
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

export default function SongDetailsModal() {

    const { song } = useLocalSearchParams<{ song: string }>();

    const songInfo = song ? (JSON.parse(song) as SongInterface) : null;

    if (!songInfo) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator size={'large'} color={'#8B8B8B'}></ActivityIndicator>
            </View>
        )
    }

    return (
        <Animated.View
            style={styles.extraInfo}
            entering={FadeIn}
        >
            <Link dismissTo href={'/(player)'} asChild>
                <Pressable style={StyleSheet.absoluteFill}></Pressable>
            </Link>
            <Text style={[styles.extraInfoText, {alignSelf: 'flex-start', fontFamily: 'MPLUS-Bold',fontSize: 24}]}>Song details</Text>
            <View style={styles.extraInfoSong}>
                <View style={styles.extraInfoSection}>
                    <Text style={styles.extraInfoTitle}>Album</Text>
                    <Text style={styles.extraInfoText}>{songInfo.album}</Text>
                </View>
                <View style={styles.extraInfoSection}>
                    <Text style={styles.extraInfoTitle}>Genre</Text>
                    <Text style={styles.extraInfoText}>{songInfo.genre}</Text>
                </View>
                <View style={styles.extraInfoSection}>
                    <Text style={styles.extraInfoTitle}>Artist</Text>
                    <Text style={styles.extraInfoText}>{songInfo.artist}</Text>
                </View>
            </View>
            <View style={styles.extraInfoPlay}>
                <View style={styles.extraInfoPlaySection}>
                    <Text style={styles.extraInfoTitle}>Play Count</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Text style={[styles.extraInfoText, { fontSize: 24, fontFamily: 'MPLUS-Bold', }]}>{songInfo.play_count}</Text>
                        {/* <Icons.Ionicons name="stats-chart" size={24} color="white" /> */}
                    </View>
                </View>
                <View style={styles.extraInfoPlaySection}>
                    <Text style={styles.extraInfoTitle}>Rating</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                        <View style={{ flexDirection: 'row' }}>
                            {[...Array(songInfo.rating)].map((_, index) => (<MaterialCommunityIcons name="music-note-quarter" size={24} color="white" key={`rating-music-note-${index}`} />))}
                            {[...Array(5 - songInfo.rating)].map((_, index) => (<MaterialCommunityIcons name="music-note-half" size={24} color="#8B8B8B" key={`rating-music-note-${index}`} />))}
                        </View>
                    </View>
                </View>
            </View>
            <View style={[styles.extraInfoPlay]}>
                <View style={styles.extraInfoPlaySection}>
                    <Text style={styles.extraInfoTitle}>Bitrate (kbps)</Text>
                    <Text style={[styles.extraInfoText, { fontSize: 24, fontFamily: 'MPLUS-Bold', }]}>{songInfo.bitrate}</Text>
                </View>
                <View style={styles.extraInfoPlaySection}>
                    <Text style={styles.extraInfoTitle}>Sample Rate (Hz)</Text>
                    <Text style={[styles.extraInfoText, { fontSize: 24, fontFamily: 'MPLUS-Bold', }]}>{songInfo.sample_rate}</Text>
                </View>
            </View>
        </Animated.View>
    )
};

const styles = StyleSheet.create({
    extraInfo: {
        width: '100%',
        height: '100%',
        backgroundColor: 'rgba(12, 12, 12, 0.9)',
        paddingHorizontal: 20,

        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    extraInfoSection: {
        flexDirection: 'column-reverse',
        justifyContent: 'center',
        gap: 5,
    },
    extraInfoSong: {
        width: '100%',
        backgroundColor: '#252525',
        padding: 20,

        gap: 20,

        borderWidth: 0.5,
        borderColor: '#8B8B8B',
        borderRadius: 20,
    },
    extraInfoPlay: {
        width: '100%',

        flexDirection: 'row',
        gap: 20,
    },
    extraInfoPlaySection: {
        backgroundColor: '#252525',
        padding: 20,

        flex: 1,
        flexDirection: 'column-reverse',
        gap: 5,

        borderWidth: 0.5,
        borderColor: '#8B8B8B',
        borderRadius: 20,
    },
    extraInfoTitle: {
        color: '#8B8B8B',
        fontFamily: 'MPLUS-Regular',
        fontSize: 10,
    },
    extraInfoText: {
        color: '#FFF',
        fontFamily: 'MPLUS-Regular',
        fontSize: 14
    },
});