import { memo } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import NormalButton from '../player/normalButton';
import { PlaylistItemType } from '@/types/IPlaylistDetails';
import { useSettings } from '@/context/appContext';
import { Colors } from '@/theme';
import { formatTimeHelper } from '@/utils/helpers';

interface PlaylistItems {
  item: PlaylistItemType;
  onPress: () => void;
}

export const PlaylistItem = memo(
  function PlaylistItem({ item, onPress }: PlaylistItems) {
    const { theme } = useSettings();
    const currentTheme = Colors[theme];

    const displayTitle = item.title || item.name || (item.filename ? item.filename.split('\\').pop()?.split('/').pop() : 'Unknown');

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
                    {displayTitle}
                  </Text>
                  <Text style={[styles.playlistText, { color: currentTheme.textSecondary, fontSize: 12 }]} numberOfLines={1} ellipsizeMode="tail">
                    {item.artist || 'Unknown Artist'}
                  </Text>
                </View>
              </View>
              <Text style={[styles.playlistText, { color: currentTheme.textSecondary }]}>{formatTimeHelper(item.duration * 1000)}</Text>
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
  playlistItem: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 40 },
  leftSide: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 20 },
  playlistText: { fontFamily: 'MPLUS-Regular', fontSize: 14 },
  separator: { width: '100%', height: 1, marginTop: 10 },
});
