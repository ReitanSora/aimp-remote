import { Colors, ThemeType } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

interface OfflineScreenProps {
  theme: ThemeType;
  appColor: string;
  onRetry: () => void;
}

export default function OfflineScreen({ theme, appColor, onRetry }: OfflineScreenProps) {
  const currentTheme = Colors[theme];

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background }]}>
      <Animated.View entering={FadeInDown.duration(800)} style={styles.content}>
        <View style={styles.iconContainer}>
          <Ionicons name="desktop-outline" size={100} color={currentTheme.textSecondary} />
          <Ionicons name="close-circle" size={40} color={appColor} style={styles.errorIcon} />
        </View>
        <Text style={[styles.title, { color: currentTheme.text }]}>Connection Failed</Text>
        <Text style={[styles.subtitle, { color: currentTheme.textSecondary }]}>Did you forget to open AIMP on your PC?</Text>
        <Text style={[styles.hint, { color: currentTheme.border }]}>Make sure AIMP and the Web Control Plugin are running on your computer.</Text>
        <TouchableOpacity style={[styles.btn, { backgroundColor: appColor }]} onPress={onRetry}>
          <Ionicons name="refresh" size={20} color="#FFF" />
          <Text style={styles.btnText}>Retry Connection</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
    maxWidth: 400,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  errorIcon: {
    position: 'absolute',
    bottom: -5,
    right: -10,
    backgroundColor: '#fff',
    borderRadius: 20,
  },
  title: {
    fontSize: 26,
    fontFamily: 'MPLUS-ExtraBold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'MPLUS-Bold',
    textAlign: 'center',
    marginBottom: 10,
  },
  hint: {
    fontSize: 12,
    fontFamily: 'MPLUS-Regular',
    textAlign: 'center',
    marginBottom: 30,
  },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 30,
    elevation: 3,
  },
  btnText: {
    color: '#FFF',
    fontFamily: 'MPLUS-Bold',
    fontSize: 16,
  },
});
