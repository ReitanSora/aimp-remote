import { StaticHeader } from '@/components/ui/Header';
import IconButton from '@/components/ui/IconButton';
import { Theme } from '@/theme';
import { Feather, Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSettings } from '../../context/appContext';

interface OptionInsideElementProps {
    optionTitle: string;
    optionDescription: string;
}

function OptionInsideElement({ optionTitle, optionDescription }: OptionInsideElementProps) {
    return (
        <View style={styles.optionInsideContainer}>
            <View style={styles.optionInsideTextContainer}>
                <Text style={[styles.text, { color: Theme.colors.white, fontSize: Theme.fontSize.subtitle, fontFamily: Theme.fontFamily.bold }]}>
                    {optionTitle}
                </Text>
                <Text style={[styles.text]}>{optionDescription}</Text>
            </View>
            <Ionicons
                name='chevron-forward'
                size={24}
                color={Theme.colors.lightGray}
            />
        </View>
    );
}

export default function Settings() {
    const router = useRouter();
    const insets = useSafeAreaInsets();

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <StaticHeader
                hasLeftAction={false}
                hasFilter={false}
                title='Settings'
            />
            <View style={styles.content}>
                <View style={styles.imageContainer}>
                    <Image
                        cachePolicy={'memory'}
                        transition={200}
                        source={require('../../../assets/splash/splash-icon-dark.png')}
                        style={{ width: '100%', height: '100%' }}
                        contentFit='cover'
                    />
                </View>
                <View style={styles.introContainer}>
                    <Text style={[styles.text, { color: Theme.colors.accent, fontFamily: Theme.fontFamily.bold, fontSize: Theme.fontSize.title }]}>
                        Fluke
                    </Text>
                    <Text
                        style={[
                            styles.text,
                            { color: Theme.colors.lightGray, fontFamily: Theme.fontFamily.bold, fontSize: Theme.fontSize.paragraph },
                        ]}>
                        AIMP Remote Controller
                    </Text>
                    <Text style={[styles.text]}>By Stiven Pilca</Text>
                </View>
                <View style={styles.optionsContainer}>
                    <IconButton
                        onPress={() => router.navigate('/(settings)/preferences')}
                        IconSet={Feather}
                        iconName='sliders'
                        containerStyle={{ width: '100%', height: 80, borderRadius: 0 }}
                        insideStyle={{ paddingHorizontal: 20, alignItems: 'center', justifyContent: 'flex-start', gap: 20 }}
                        InsideElement={
                            <OptionInsideElement
                                optionTitle='Preferences'
                                optionDescription='Server Management'
                            />
                        }
                    />
                    <IconButton
                        onPress={() => router.navigate('/(settings)/about')}
                        IconSet={Ionicons}
                        iconName='information-circle-outline'
                        containerStyle={{ width: '100%', height: 80, borderRadius: 0 }}
                        insideStyle={{ paddingHorizontal: 20, alignItems: 'center', justifyContent: 'flex-start', gap: 20 }}
                        InsideElement={
                            <OptionInsideElement
                                optionTitle='About'
                                optionDescription='App Information'
                            />
                        }
                    />
                </View>
            </View>
        </View>
    );
}

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
        paddingTop: 20,

        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 40,
    },
    imageContainer: {
        width: 200,
        height: 200,
    },
    introContainer: {
        alignItems: 'center',
        gap: 5,
    },
    text: {
        color: Theme.colors.lightGray,
        fontSize: Theme.fontSize.paragraph,
        fontFamily: Theme.fontFamily.regular,
    },
    optionsContainer: {
        width: '100%',
    },
    optionInsideContainer: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    optionInsideTextContainer: {
        gap: 5,
    },
});
