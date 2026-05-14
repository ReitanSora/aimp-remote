import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import NormalButton from '../player/normalButton';
import { PlaylistItemType } from '@/types/IPlaylistDetails';
import { useSettings } from '@/context/appContext';
import { Colors } from '@/theme';

interface PlaylistItems {
  item: PlaylistItemType;
  onPress: () => void;
}

export const PlaylistItem = memo(
  function PlaylistItem({ item, onPress }: PlaylistItems) {
    const { theme } = useSettings();
    const currentTheme = Colors[theme];

    return (
      <>
        <NormalButton
          rippleColor="rgba(139, 139, 139, 0.5)"
          onPress={onPress}
          containerStyle={{ width: '100%', height: 60 }}
          insideStyle={{
            paddingHorizontal: 20,
            gap: 20,
            justifyContent: 'flex-start',
          }}
          TextElement={
            <View style={styles.playlistItem}>
              <View style={styles.leftSide}>
                <Text style={[styles.playlistText, { color: currentTheme.textSecondary }]}>{Number(item.index) + 1}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.playlistText, { fontFamily: 'MPLUS-Bold', color: currentTheme.text }]} numberOfLines={1} ellipsizeMode="tail">
                    {item.title}
                  </Text>
                  <Text style={[styles.playlistText, { color: currentTheme.textSecondary, fontSize: 12 }]} numberOfLines={1} ellipsizeMode="tail">
                    {item.artist}
                  </Text>
                </View>
              </View>
              <Text style={[styles.playlistText, { color: currentTheme.textSecondary }]}>{new Date(item.duration * 1000).toISOString().slice(14, 19)}</Text>
            </View>
          }
        />
        <View style={[styles.separator, { backgroundColor: currentTheme.border }]} />
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
    fontSize: 14,
  },
  separator: {
    width: '100%',
    height: 1,
    backgroundColor: '#252525',
    marginTop: 10,
  },
});
