import { useSettings } from '@/context/appContext';
import { Colors } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeInDown, FadeInUp } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function ConnectScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [mode, setMode] = useState<'manual' | 'qr'>('manual');
  const [ipInput, setIpInput] = useState('');
  const { setServer, theme, appColor } = useSettings();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const currentColors = Colors[theme];

  const handleConnect = (ip: string) => {
    if (!ip) return;
    setServer({ ip, name: 'AIMP Server' });
    router.replace('/');
  };

  const handleBarcodeScanned = ({ data }: { data: string }) => {
    // assume the QR code contains the IP directly or a JSON with IP
    try {
      const ip = data.includes('{') ? JSON.parse(data).ip : data;
      handleConnect(ip);
    } catch {
      handleConnect(data);
    }
  };

  if (!permission) return <View style={{ flex: 1, backgroundColor: currentColors.background }} />;

  return (
    <View style={[styles.container, { backgroundColor: currentColors.background, paddingTop: insets.top }]}>
      <Animated.View entering={FadeInDown.duration(800)} style={styles.header}>
        <Ionicons name="musical-notes" size={60} color={appColor} />
        <Text style={[styles.title, { color: currentColors.text }]}>Connect to AIMP</Text>
        <Text style={[styles.subtitle, { color: currentColors.textSecondary }]}>Scan QR or enter IP manually</Text>
      </Animated.View>

      <Animated.View entering={FadeInUp.duration(800).delay(300)} style={styles.content}>
        {mode === 'qr' ? (
          permission.granted ? (
            <View style={styles.cameraContainer}>
              <CameraView style={styles.camera} barcodeScannerSettings={{ barcodeTypes: ['qr'] }} onBarcodeScanned={handleBarcodeScanned} />
              <View style={[styles.overlay, { borderColor: appColor }]} />
            </View>
          ) : (
            <TouchableOpacity style={[styles.btn, { backgroundColor: appColor }]} onPress={requestPermission}>
              <Text style={styles.btnText}>Grant Camera Permission</Text>
            </TouchableOpacity>
          )
        ) : (
          <View style={styles.inputContainer}>
            <TextInput
              style={[
                styles.input,
                {
                  backgroundColor: currentColors.surface,
                  color: currentColors.text,
                  borderColor: currentColors.border,
                },
              ]}
              placeholder="Enter IP Address (e.g. 192.168.1.5)"
              placeholderTextColor={currentColors.textSecondary}
              value={ipInput}
              onChangeText={setIpInput}
              keyboardType="numeric"
            />
            <TouchableOpacity style={[styles.btn, { backgroundColor: appColor }]} onPress={() => handleConnect(ipInput)}>
              <Text style={styles.btnText}>Connect</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={styles.toggleContainer}>
          <TouchableOpacity style={[styles.toggleBtn, mode === 'manual' && { backgroundColor: currentColors.surface }]} onPress={() => setMode('manual')}>
            <Ionicons name="keypad" size={20} color={mode === 'manual' ? appColor : currentColors.textSecondary} />
            <Text
              style={[
                styles.toggleText,
                {
                  color: mode === 'manual' ? currentColors.text : currentColors.textSecondary,
                },
              ]}
            >
              Manual IP
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.toggleBtn, mode === 'qr' && { backgroundColor: currentColors.surface }]} onPress={() => setMode('qr')}>
            <Ionicons name="qr-code" size={20} color={mode === 'qr' ? appColor : currentColors.textSecondary} />
            <Text
              style={[
                styles.toggleText,
                {
                  color: mode === 'qr' ? currentColors.text : currentColors.textSecondary,
                },
              ]}
            >
              Scan QR
            </Text>
          </TouchableOpacity>
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center' },
  header: { alignItems: 'center', marginBottom: 40 },
  title: { fontSize: 28, fontFamily: 'MPLUS-ExtraBold', marginTop: 10 },
  subtitle: { fontSize: 14, fontFamily: 'MPLUS-Regular', marginTop: 5 },
  content: { flex: 1, alignItems: 'center' },
  inputContainer: { width: '100%', gap: 15 },
  input: {
    width: '100%',
    height: 55,
    borderRadius: 12,
    paddingHorizontal: 20,
    borderWidth: 1,
    fontFamily: 'MPLUS-Regular',
  },
  btn: {
    width: '100%',
    height: 55,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  btnText: { color: '#FFF', fontSize: 16, fontFamily: 'MPLUS-Bold' },
  cameraContainer: {
    width: 250,
    height: 250,
    borderRadius: 20,
    overflow: 'hidden',
    position: 'relative',
  },
  camera: { flex: 1 },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderWidth: 3,
    borderRadius: 20,
    backgroundColor: 'transparent',
  },
  toggleContainer: {
    flexDirection: 'row',
    marginTop: 40,
    backgroundColor: 'rgba(0,0,0,0.1)',
    borderRadius: 15,
    padding: 5,
  },
  toggleBtn: {
    flexDirection: 'row',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    alignItems: 'center',
    gap: 8,
  },
  toggleText: { fontFamily: 'MPLUS-Bold' },
});
