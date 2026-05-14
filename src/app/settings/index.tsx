import NormalButton from '@/components/player/normalButton';
import Header from '@/components/ui/header';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, View } from 'react-native';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import ColorPicker, { LuminanceSlider, Panel3, Preview } from 'reanimated-color-picker';
import { useSettings } from '../../context/appContext';
import { Colors } from '@/theme';

export default function Settings() {
  const { server, setServer, appColor, setAppColor, theme } = useSettings();
  const currentTheme = Colors[theme];
  const [serverIp, setServerIp] = useState<string>(server.ip);
  const [serverName, setServerName] = useState<string>(server.name);
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const onSelectColor = ({ hex }: { hex: string }) => {
    'worklet';
    // do something with the selected color.
    scheduleOnRN(setAppColor, hex);
  };

  const handleSaveSettings = () => {
    try {
      setServer({
        ip: serverIp,
        name: serverName,
      });
      Alert.alert('Success', 'Server settings saved successfully!');
    } catch {
      Alert.alert('Error', 'Error saving settings');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: currentTheme.background, paddingTop: insets.top, paddingBottom: insets.bottom }]}>
      <Header LeftSideIconSet={Ionicons} iconName="chevron-back" leftSideOnPress={() => router.back()} hasSearchBar={false} title="Settings" />
      <GestureHandlerRootView>
        <ScrollView style={{ flexGrow: 1 }}>
          <View style={styles.content}>
            <View style={styles.section}>
              <View style={styles.header}>
                <Ionicons name="wifi-outline" size={24} color={currentTheme.text} />
                <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Network</Text>
              </View>
              <View style={styles.sectionContent}>
                <View style={styles.sectionInputs}>
                  <Text style={[styles.sectionText, { color: currentTheme.textSecondary }]}>IP Address</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: currentTheme.surface }]}>
                    <TextInput
                      keyboardType="decimal-pad"
                      style={[styles.input, { color: currentTheme.text }]}
                      placeholder="Server IP"
                      placeholderTextColor={currentTheme.textSecondary}
                      value={serverIp}
                      onChangeText={setServerIp}
                    />
                  </View>
                  <Text style={[styles.sectionText, { color: currentTheme.textSecondary }]}>Name</Text>
                  <View style={[styles.inputWrapper, { backgroundColor: currentTheme.surface }]}>
                    <TextInput
                      keyboardType="default"
                      style={[styles.input, { color: currentTheme.text }]}
                      placeholder="Server Name"
                      placeholderTextColor={currentTheme.textSecondary}
                      value={serverName}
                      onChangeText={setServerName}
                    />
                  </View>
                </View>
                <NormalButton onPress={handleSaveSettings} IconSet={Ionicons} iconName="save-outline" iconColor={currentTheme.text} />
              </View>
            </View>
            <View style={[styles.separator, { backgroundColor: currentTheme.border }]} />
            <View style={styles.section}>
              <View style={styles.header}>
                <Ionicons name="color-fill-outline" size={24} color={currentTheme.text} />
                <Text style={[styles.sectionTitle, { color: currentTheme.text }]}>Details color</Text>
              </View>
              <ColorPicker style={styles.colorPicker} value={appColor} onComplete={onSelectColor}>
                <Panel3 boundedThumb={true} adaptSpectrum={true} thumbSize={40} />
                <LuminanceSlider boundedThumb={true} adaptSpectrum={true} thumbSize={40} sliderThickness={40} style={{ borderRadius: 20 }} />
                <Preview hideInitialColor={true} style={{ height: 40, borderRadius: 20 }} textStyle={[styles.sectionText, { color: currentTheme.text, textTransform: 'uppercase' }]} />
              </ColorPicker>
            </View>
          </View>
        </ScrollView>
      </GestureHandlerRootView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { width: '100%', flex: 1, alignItems: 'center', justifyContent: 'flex-start' },
  content: { width: '100%' },
  section: { width: '100%', padding: 20, alignItems: 'center', gap: 20 },
  header: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'flex-start', gap: 20 },
  sectionTitle: { fontFamily: 'MPLUS-Bold', fontSize: 14 },
  sectionContent: { width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 40 },
  sectionInputs: { width: '70%', flexDirection: 'column', gap: 5 },
  inputWrapper: { width: '100%', height: 40, paddingHorizontal: 20, marginBottom: 10, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', borderRadius: 20 },
  input: { flex: 1, height: 50, marginLeft: 10, fontFamily: 'MPLUS-Regular', fontSize: 14 },
  sectionText: { fontFamily: 'MPLUS-Regular', fontSize: 14 },
  separator: { width: '100%', height: 0.5 },
  colorPicker: { width: '100%', gap: 20 },
});
