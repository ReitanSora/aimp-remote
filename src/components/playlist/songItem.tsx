import { Theme } from '@/theme';
import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import IconButton from '../ui/IconButton';
import { PlaylistItem } from '@/types/playlists';

interface SongItemProps {
    item: PlaylistItem;
    onPress: () => void;
}

export const SongItem = memo(
    function PlaylistItem({ item, onPress }: SongItemProps) {
        return (
            <>
                <IconButton
                    onPress={onPress}
                    containerStyle={{ width: '100%', height: 80, borderRadius: 0 }}
                    insideStyle={{ paddingHorizontal: 20, gap: 20, justifyContent: 'flex-start' }}
                    InsideElement={
                        <View style={styles.playlistItem}>
                            <View style={styles.leftSide}>
                                <Text style={styles.playlistText}>{Number(item.index) + 1}</Text>
                                <View style={{ flex: 1 }}>
                                    <Text
                                        style={[styles.playlistText, { fontFamily: Theme.fontFamily.medium }]}
                                        numberOfLines={1}
                                        ellipsizeMode='tail'>
                                        {item.title}
                                    </Text>
                                    <Text
                                        style={[styles.playlistText, { color: Theme.colors.gray, fontSize: Theme.fontSize.paragraph }]}
                                        numberOfLines={1}
                                        ellipsizeMode='tail'>
                                        {item.artist}
                                    </Text>
                                </View>
                            </View>
                            <Text style={styles.playlistText}>{new Date(item.duration * 1000).toISOString().slice(14, 19)}</Text>
                        </View>
                    }
                />
                <View style={styles.separator} />
            </>
        );
    },
    (prevProps, nextProps) => {
        return prevProps.item.index === nextProps.item.index;
    },
);

const styles = StyleSheet.create({
    playlistItem: {
        width: '100%',

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 40,
    },
    leftSide: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    playlistText: {
        color: '#FFF',
        fontFamily: 'MPLUS-Regular',
        fontSize: Theme.fontSize.subtitle,
    },
    separator: {
        width: '100%',
        height: 1,
        backgroundColor: '#252525',
    },
});
