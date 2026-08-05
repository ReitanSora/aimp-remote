import IconButton from '@/components/ui/IconButton';
import { useSettings } from '@/context/AppContext';
import { Theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function Success() {
    const insets = useSafeAreaInsets();
    const {setIsOnboarded} = useSettings();

    const handleCompleteOnboarding = () => {
        setIsOnboarded(true);
    }

    return (
        <View style={styles.container}>
            <View style={[styles.content, { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 20 }]}>
                <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', gap: 40 }}>
                    <Text style={[styles.title, { paddingTop: 20 }]}>Connection established!</Text>
                    <Text style={styles.text}>The bridge with AIMP is active and ready to receive commands.</Text>
                </View>
                <IconButton
                    onPress={handleCompleteOnboarding}
                    containerStyle={{ width: '100%' }}
                    IconSet={Ionicons}
                    iconName='checkmark-circle'
                    iconColor='transparent'
                    rippleColor={`${Theme.colors.gray}80`}
                    insideStyle={{ backgroundColor: Theme.colors.accent, gap: 20 }}
                    InsideElement={<Text style={[styles.subtitle, { color: 'transparent' }]}>Start remote control</Text>}
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
        padding: 20,

        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 20,
    },
    text: {
        fontFamily: Theme.fontFamily.regular,
        fontSize: Theme.fontSize.paragraph,
        color: Theme.colors.white,
        textAlign: 'center',
    },
    subtitle: {
        fontFamily: Theme.fontFamily.bold,
        fontSize: Theme.fontSize.subtitle,
        color: Theme.colors.white,
    },
    title: {
        fontFamily: Theme.fontFamily.condensed,
        fontSize: 36,
        color: Theme.colors.white,
        textAlign: 'center',
    },
});
