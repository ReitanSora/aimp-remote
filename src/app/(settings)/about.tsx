import { StaticHeader } from '@/components/ui/Header';
import IconButton from '@/components/ui/IconButton';
import { Theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import * as Application from 'expo-application';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { openBrowserAsync } from 'expo-web-browser';
import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function About() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    const handleBrowserAsync = async (url: string) => {
        await openBrowserAsync(url);
    };

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <StaticHeader
                hasFilter={false}
                onLeftActionPress={() => router.back()}
                title='About'
            />
            <ScrollView>
                <View style={styles.content}>
                    <View style={{ paddingHorizontal: 20 }}>
                        <Text style={[styles.text, styles.subtitle]}>Acknowledgments</Text>
                    </View>
                    <View style={styles.section}>
                        <View style={{ width: 250, height: 100, alignSelf: 'center' }}>
                            <Image
                                transition={200}
                                source={require('../../../assets/images/aimp_logo.svg')}
                                style={{ width: '100%', height: '100%' }}
                                contentFit='contain'
                            />
                        </View>
                        <Text style={styles.text}>
                            This app was born out of admiration for AIMP, undoubtedly one of the most iconic, lightweight, and powerful music players
                            for Windows.
                        </Text>
                        <Text style={styles.text}>
                            I would like to express my deep gratitude to Artem Izmaylov and the entire community behind AIMP for their incredible
                            dedication over the years and, especially, for maintaining an open ecosystem by providing their official SDK. Thanks to
                            their work, independent projects like this one can take the listening experience to new heights.
                        </Text>
                    </View>
                    <View style={{ paddingHorizontal: 20 }}>
                        <Text style={[styles.text, styles.subtitle]}>Support</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.text}>
                            If you encounter any issues, have feature requests, or simply want to leave feedback, feel free to
                            reach out. You can also view the source code, report bugs or star the project on GitHub.
                        </Text>
                        <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 20 }}>
                            <IconButton
                                onPress={() => handleBrowserAsync('https://github.com/ReitanSora/fluke-aimp-rc')}
                                IconSet={Ionicons}
                                iconName='logo-github'
                            />
                        </View>
                    </View>
                    <View style={styles.section}>
                        <Text style={[styles.text, { fontWeight: 'bold', alignSelf: 'center' }]}>{Application.applicationName}</Text>
                        <View style={{ width: '100%', flexDirection: 'row', gap: 10, justifyContent: 'center' }}>
                            <Text style={[styles.text]}>Version {Application.nativeApplicationVersion}</Text>
                            <Text style={[styles.text]}>(Build {Application.nativeBuildVersion})</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        width: '100%',
        height: '100%',
    },
    content: {
        padding: 20,

        alignItems: 'flex-start',
        justifyContent: 'flex-start',
        gap: 20,
    },
    text: {
        fontFamily: Theme.fontFamily.regular,
        fontSize: Theme.fontSize.paragraph,
        color: Theme.colors.white,
    },
    subtitle: {
        fontFamily: Theme.fontFamily.bold,
        fontSize: Theme.fontSize.subtitle,
    },
    section: {
        width: '100%',
        backgroundColor: Theme.colors.lightBlack,
        padding: 20,

        flexDirection: 'column',
        gap: 20,

        borderRadius: 20,
    },
});
