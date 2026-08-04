import IconButton from '@/components/ui/IconButton';
import { Theme } from '@/theme';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function OnboardingStart() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={styles.container}>
            <View style={[styles.content, { paddingBottom: insets.bottom + 10 }]}>
                <Text style={[styles.text, {paddingTop: insets.top + 15}]}>Welcome to Fluke: AIMP Remote Control</Text>
                <View style={{flex: 1, alignItems: 'center', justifyContent: 'center', gap: 40}}>
                    <View style={styles.imageContainer}>
                        <Image
                            source={require('../../../assets/splash/splash-icon-dark.png')}
                            style={{ width: '100%', height: '100%' }}
                            contentFit='cover'
                            transition={250}
                        />
                    </View>
                    <Text style={[styles.text, styles.title]}>Your music, under your control.</Text>
                </View>
                <IconButton
                    onPress={() => router.navigate('/onboarding/configuration')}
                    containerStyle={{ width: '100%', position: 'absolute', bottom: insets.bottom + 20 }}
                    rippleColor={`${Theme.colors.gray}80`}
                    insideStyle={{ backgroundColor: Theme.colors.accent }}
                    InsideElement={<Text style={styles.subtitle}>Get started</Text>}
                />
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

        alignItems: 'center',
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
        fontFamily: Theme.fontFamily.condensed,
        fontSize: 36,
        textAlign: 'center',
    },
    imageContainer: {
        width: 300,
        height: 300,

        alignItems: 'center',
        justifyContent: 'center',
    },
});
