import NormalButton from '@/components/player/normalButton';
import Header from '@/components/ui/header';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, ToastAndroid, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { scheduleOnRN } from 'react-native-worklets';
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