import { StaticHeader } from '@/components/ui/Header';
import IconButton from '@/components/ui/IconButton';
import { Theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { CameraView, useCameraPermissions } from 'expo-camera';
import { useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
const SQUARE_SIZE = 300;

export default function Scan() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const [permission, requestPermission] = useCameraPermissions();

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
            <View style={[styles.container, { alignItems: 'center', justifyContent: 'center', padding: 20, gap: 20 }]}>
                <Text style={[styles.subtitle, { fontFamily: Theme.fontFamily.medium }]}>
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
                    InsideElement={<Text style={styles.subtitle}>Grant Permission</Text>}
                />
            </View>
        );
    }

    const handleBarCodeScanned = ({ data }: { data: string }) => {
        router.dismissTo('/(settings)/preferences');
        router.replace({
            pathname: '/(settings)/preferences',
            params: { ip: data.split('ip=')[1] },
        });
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StaticHeader
                hasFilter={false}
                title='Scan QR Code'
                onLeftActionPress={() => router.back()}
            />
            <CameraView
                style={[styles.camera, { top: 60 + insets.top }]}
                facing={'back'}
                barcodeScannerSettings={{
                    barcodeTypes: ['qr'],
                }}
                onBarcodeScanned={handleBarCodeScanned}
            />
            <View style={[styles.content, { top: 60 + insets.top }]}>
                <View
                    style={[styles.transparentBoxRow]}
                    pointerEvents='none'
                />
                <View style={[styles.transparentBoxMiddle]}>
                    <View style={styles.transparentBoxSide}></View>
                    <View style={styles.scanWindow}>
                        <View style={[styles.corner, styles.topLeft]}></View>
                        <View style={[styles.corner, styles.topRight]}></View>
                        <View style={[styles.corner, styles.bottomLeft]}></View>
                        <View style={[styles.corner, styles.bottomRight]}></View>
                    </View>
                    <View style={styles.transparentBoxSide}></View>
                </View>
                <View
                    style={[styles.transparentBoxRow, {alignItems: 'center', justifyContent: 'center', padding: 20}]}
                    pointerEvents='none'
                >
                    <Text style={styles.subtitle}>On AIMP go to Plugins, then in the left menu select "Aimp Remote" to show the QR code</Text>
                </View>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    subtitle: {
        fontFamily: Theme.fontFamily.bold,
        fontSize: Theme.fontSize.subtitle,
        color: Theme.colors.white,
        textAlign: 'center'
    },
    content: {
        ...StyleSheet.absoluteFill,
        justifyContent: 'center',
        alignItems: 'center',
    },
    camera: {
        flex: 1,
        ...StyleSheet.absoluteFill,
    },
    transparentBoxRow: {
        flex: 1,
        width: '100%',
        backgroundColor: '#12121280',
    },
    transparentBoxMiddle: {
        flexDirection: 'row',
        height: SQUARE_SIZE,
    },
    transparentBoxSide: {
        flex: 1,
        backgroundColor: '#12121280',
    },
    scanWindow: {
        position: 'relative',

        width: SQUARE_SIZE,
        height: SQUARE_SIZE,
        backgroundColor: 'transparent',

        borderRadius: 20,
    },
    corner: {
        position: 'absolute',
        width: 50,
        height: 50,
        margin: 20,
        borderColor: '#FFF',
    },
    topLeft: { top: 0, left: 0, borderTopWidth: 5, borderLeftWidth: 5, borderTopLeftRadius: 12 },
    topRight: { top: 0, right: 0, borderTopWidth: 5, borderRightWidth: 5, borderTopRightRadius: 12 },
    bottomLeft: { bottom: 0, left: 0, borderBottomWidth: 5, borderLeftWidth: 5, borderBottomLeftRadius: 12 },
    bottomRight: { bottom: 0, right: 0, borderBottomWidth: 5, borderRightWidth: 5, borderBottomRightRadius: 12 },
});
