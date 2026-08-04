import Input from '@/components/settings/Input';
import IconButton from '@/components/ui/IconButton';
import { useSettings } from '@/context/appContext';
import { Theme } from '@/theme';
import { checkServer, isValidIPv4 } from '@/utils/validation';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ScanFrameProps {
    onBarCodeScanned: (value: string) => void;
}

function ScanFrame({ onBarCodeScanned }: ScanFrameProps) {
    const [permission, requestPermission] = useCameraPermissions();

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        onBarCodeScanned(data);
    };

    if (!permission) {
        return (
            <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <ActivityIndicator
                    color={Theme.colors.accent}
                    size={'large'}
                />
            </View>
        );
    }

    if (!permission.granted) {
        return (
            <View style={[{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 20, gap: 20 }]}>
                <Text style={[styles.text, { textAlign: 'center' }]}>
                    App needs camera access to scan QR codes, press the button to grant permission
                </Text>
                <IconButton
                    onPress={requestPermission}
                    rippleColor={`${Theme.colors.accent}1A`}
                    IconSet={Ionicons}
                    iconName='checkmark-circle'
                    containerStyle={{
                        width: 'auto',
                        backgroundColor: `${Theme.colors.accent}33`,
                        borderWidth: 1,
                        borderColor: Theme.colors.accent,
                    }}
                    insideStyle={{ paddingHorizontal: 20, gap: 10 }}
                    InsideElement={<Text style={[styles.subtitle, {color: Theme.colors.white}]}>Grant Permission</Text>}
                />
            </View>
        );
    }

    return (
        <CameraView
            style={[styles.camera]}
            facing={'back'}
            barcodeScannerSettings={{
                barcodeTypes: ['qr'],
            }}
            onBarcodeScanned={handleBarCodeScanned}
        />
    );
}

export default function Configuration() {
    const [serverIp, setServerIp] = useState<string>('');
    const [serverName, setServerName] = useState<string>('');
    const [scanVisible, setScanVisible] = useState<boolean>(false);
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { setActualServer, setServerList } = useSettings();

    const showToast = (message: string) => {
        ToastAndroid.show(message, ToastAndroid.SHORT);
    };

    const handleSave = async () => {
        if (!serverIp || !serverName) {
            showToast('Please complete IP address and server name');
            return;
        }
        if (!isValidIPv4(serverIp)) {
            showToast('Incorrect IP address');
            return;
        }

        showToast('Checking server connection...');

        const isServerOnline = await checkServer(serverIp);

        if (!isServerOnline) {
            showToast('Could not reach the server at this IP');
            return;
        }

        setActualServer({ ip: serverIp, name: serverName });
        setServerList((prevList) => {
            const currentList = Array.isArray(prevList) ? prevList : [];
            return [...currentList, { ip: serverIp, name: serverName }];
        });
        setServerIp('');
        setServerName('');
        showToast('Server verified and added successfully!');
        router.navigate('/onboarding/success')
    };

    const handleScan = (data: string) => {
        setServerIp(data.split('?ip=')[1])
        setScanVisible(!scanVisible)
        showToast('Successfully scanned, IP address filled in');
    };

    return (
        <View style={styles.container}>
            <View style={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
                <View style={{ gap: 40 }}>
                    <Text style={[styles.text, styles.title, { paddingTop: insets.top + 30 }]}>Connect to a valid server</Text>
                    <View style={styles.inputsWrapper}>
                        <Input
                            IconSet={MaterialCommunityIcons}
                            iconName='server'
                            inputProps={{ maxLength: 15 }}
                            keyboardType='decimal-pad'
                            placeholder='192.168.X.X'
                            setValue={setServerIp}
                            value={serverIp}
                        />
                        <View style={{ width: '100%', height: 1, backgroundColor: Theme.colors.lightGray }}></View>
                        <Input
                            IconSet={MaterialCommunityIcons}
                            iconName='tag-text'
                            inputProps={{ maxLength: 20, autoCapitalize: 'words' }}
                            keyboardType='default'
                            placeholder='Server Name'
                            setValue={(newText) => setServerName(newText)}
                            value={serverName}
                        />
                    </View>
                </View>
                {scanVisible && <ScanFrame onBarCodeScanned={(e) => handleScan(e)} />}
                <View style={[styles.buttonsContainer]}>
                    <IconButton
                        onPress={() => setScanVisible(!scanVisible)}
                        containerStyle={{ width: '100%' }}
                        rippleColor={`${Theme.colors.lightBlack}80`}
                        insideStyle={{ backgroundColor: Theme.colors.lightBlack }}
                        InsideElement={
                            <Text style={[styles.subtitle, { color: Theme.colors.accent }]}>{scanVisible ? 'Hide Camera' : 'Scan QR code'}</Text>
                        }
                    />
                    <IconButton
                        onPress={handleSave}
                        containerStyle={{ width: '100%' }}
                        rippleColor={`${Theme.colors.gray}80`}
                        insideStyle={{ backgroundColor: Theme.colors.accent }}
                        InsideElement={<Text style={styles.subtitle}>Connect</Text>}
                    />
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
    },
    content: {
        flex: 1,
        width: '100%',
        padding: 20,

        gap: 20,
        justifyContent: 'space-between',
    },
    text: {
        fontFamily: Theme.fontFamily.regular,
        fontSize: Theme.fontSize.paragraph,
        color: Theme.colors.white,
    },
    subtitle: {
        fontFamily: Theme.fontFamily.bold,
        fontSize: Theme.fontSize.subtitle,
        color: 'transparent',
    },
    title: {
        fontFamily: Theme.fontFamily.bold,
        fontSize: Theme.fontSize.title,
        textAlign: 'center',
    },
    inputsWrapper: {
        borderWidth: 1,
        borderColor: Theme.colors.lightGray,
        borderRadius: 10,
    },
    buttonsContainer: {
        gap: 20,
    },
    camera: {
        flex: 1,

        borderRadius: 20,
    },
});
