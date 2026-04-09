import NormalButton from '@/components/player/normalButton';
import Header from '@/components/ui/header';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, ToastAndroid, View } from 'react-native';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
import ColorPicker, { LuminanceSlider, Panel3, Preview } from 'reanimated-color-picker';
import { useSettings } from '../../context/appContext';

export default function Settings() {
    const { server, setServer, appColor, setAppColor } = useSettings();

    const [serverIp, setServerIp] = useState<string>(server.ip);
    const [serverName, setServerName] = useState<string>(server.name);
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const showToast = (message: string) => {
        ToastAndroid.show(message, ToastAndroid.SHORT);
    };

    const onSelectColor = ({ hex }) => {
        'worklet';
        // do something with the selected color.
        scheduleOnRN(setAppColor, hex);
    };

    const handleSaveSettings = () => {
        try {
            setServer({
                ip: serverIp,
                name: serverName
            })
            showToast('Server saved!');
        } catch {
            showToast('Error saving settings');
        }
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <Header
                LeftSideIconSet={Ionicons}
                iconName='chevron-back'
                leftSideOnPress={() => router.back()}
                hasSearchBar={false}
                title='Settings'
            />
            <GestureHandlerRootView>
                <ScrollView style={{ flexGrow: 1 }}>

                    <View style={styles.content}>
                        <View style={styles.section}>
                            <View style={styles.header}>
                                <Ionicons name="wifi-outline" size={24} color='white' />
                                <Text style={styles.sectionTitle}>Network</Text>
                            </View>
                            <View style={styles.sectionContent}>
                                <View style={styles.sectionInputs}>
                                    <Text style={styles.sectionText}>IP Address</Text>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            keyboardType='decimal-pad'
                                            textContentType='telephoneNumber'
                                            style={styles.input}
                                            placeholder='Server IP'
                                            placeholderTextColor={'#8B8B8B'}
                                            cursorColor={'#8B8B8B'}
                                            selectionColor={'#8B8B8B'}
                                            selectionHandleColor={'#8B8B8B'}
                                            value={serverIp}
                                            onChangeText={newText => setServerIp(newText)}
                                        />
                                    </View>
                                    <Text style={styles.sectionText}>Name</Text>
                                    <View style={styles.inputWrapper}>
                                        <TextInput
                                            keyboardType='default'
                                            textContentType='name'
                                            style={styles.input}
                                            placeholder='Server Name'
                                            placeholderTextColor={'#8B8B8B'}
                                            cursorColor={'#8B8B8B'}
                                            selectionColor={'#8B8B8B'}
                                            selectionHandleColor={'#8B8B8B'}
                                            value={serverName}
                                            onChangeText={newText => setServerName(newText)}

                                        />
                                    </View>
                                </View>
                                <NormalButton
                                    onPress={() => handleSaveSettings()}
                                    IconSet={Ionicons}
                                    iconName='save-outline'
                                />
                            </View>
                        </View>
                        <View style={styles.separator} />
                        <View style={styles.section}>
                            <View style={styles.header}>
                                <Ionicons name="color-fill-outline" size={24} color="white" />
                                <Text style={styles.sectionTitle}>Details color</Text>
                            </View>
                            <ColorPicker style={styles.colorPicker} value={appColor} onComplete={onSelectColor}>
                                <Panel3 boundedThumb={true} adaptSpectrum={true} thumbSize={40} />
                                {/* <HSLSaturationSlider boundedThumb={true} adaptSpectrum={true} thumbSize={40} sliderThickness={40} style={{ borderRadius: 20 }} /> */}
                                <LuminanceSlider boundedThumb={true} adaptSpectrum={true} thumbSize={40} sliderThickness={40} style={{ borderRadius: 20 }} />
                                <Preview hideInitialColor={true} style={{ height: 40, borderRadius: 20 }} textStyle={[styles.sectionText, { textTransform: 'uppercase' }]} />
                                {/* <InputWidget
                                    defaultFormat='HEX'
                                    formats={['HEX', 'RGB']}
                                    inputProps={{
                                        placeholderTextColor: '#8B8B8B',
                                        cursorColor: '#8B8B8B',
                                        selectionColor: '#8B8B8B',
                                        selectionHandleColor: '#8B8B8B'
                                    }}
                                    inputStyle={[styles.input, { width: '100%', marginLeft: 0, borderWidth: 0 }]}
                                    containerStyle={[styles.inputWrapper, { height: 'auto', marginBottom: 0, justifyContent: 'center' }]} /> */}
                            </ColorPicker>
                        </View>
                    </View>
                </ScrollView>
            </GestureHandlerRootView>
        </View>
    )
};

const styles = StyleSheet.create({
    container: {
        width: '100%',
        flex: 1,
        // backgroundColor: '#FFF',

        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    content: {
        width: '100%',
    },
    section: {
        width: '100%',
        padding: 20,

        alignItems: 'center',
        gap: 20,
    },
    header: {
        width: '100%',

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 20,
    },
    sectionTitle: {
        color: '#FFF',
        fontFamily: 'MPLUS-Bold',
        fontSize: 14,
    },
    sectionContent: {
        width: '100%',
        // backgroundColor: '#FFF',

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 40
    },
    sectionInputs: {
        width: '70%',
        // backgroundColor: '#FFF',

        flexDirection: 'column',
        gap: 5,
    },
    inputWrapper: {
        width: '100%',
        height: 40,
        backgroundColor: '#363636',
        paddingHorizontal: 20,
        marginBottom: 10,
        // paddingVertical: 5,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        borderRadius: 20,
    },
    input: {
        // backgroundColor: '#C6C6C6',
        flex: 1,
        height: 50,
        marginLeft: 10,

        color: '#FFF',
        fontFamily: 'MPLUS-Regular',
        fontSize: 14,
    },
    sectionText: {
        color: '#FFF',
        fontFamily: 'MPLUS-Regular',
        fontSize: 14,
    },
    separator: {
        width: '100%',
        height: 0.5,
        backgroundColor: '#8B8B8B',
    },
    colorPicker: {
        width: '100%',

        gap: 20,
    },
});