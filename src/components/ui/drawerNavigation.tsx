import { Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import Animated, { SharedValue, useAnimatedStyle, withTiming } from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import NormalButton from "../player/normalButton";
import SVGComponent from "./aimpLogo";

interface DrawerProps {
    transition: SharedValue<number>;
    currentPlaylist?: string;
}

export function Drawer({ transition, currentPlaylist }: DrawerProps) {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const animatedDrawer = useAnimatedStyle(() => {
        return {
            opacity: withTiming(transition.value > 0 ? 1 : 0.2),
            transform: [{ translateX: withTiming(transition.value ? 0 : '-100%') },],
            zIndex: transition.value > 0 ? 4 : 1,
        }
    })

    const drawerStyles = StyleSheet.create({
        drawerContainer: {
            position: 'absolute',
            top: 0,
            left: 0,

            width: '80%',
            height: '100%',

            flexDirection: 'row',
            overflow: 'hidden',

            borderTopRightRadius: 20,
            borderBottomRightRadius: 20,
        },
        drawerWrapper: {
            position: 'relative',

            width: '100%',
            height: '100%',
            backgroundColor: '#252525',
            padding: 20,

        },
        header: {
            width: '100%',
            height: 200,
            // backgroundColor: '#C6C6C6',
            alignItems: 'center',
            justifyContent: 'center',
        },
        navigation: {
            flex: 1,
            // backgroundColor: '#C6C6C6',

            gap: 20,
        },
        footer: {
            position: 'absolute',
            left: 20,

            width: '100%',
            // backgroundColor: '#C6C6C6',
        },
        text: {
            color: '#FFF',
            fontFamily: 'MPLUS-Bold',
            fontSize: 14,
        },
    });

    return (
        <Animated.View style={[animatedDrawer, drawerStyles.drawerContainer]}>
            <View style={[drawerStyles.drawerWrapper, { paddingTop: insets.top }]}>
                <View style={drawerStyles.header}>
                    <SVGComponent width='100%' height={100} />
                    <Text style={[drawerStyles.text, { color: '#8B8B8B', fontFamily: 'MPLUS-Regular' }]}>For AIMP v5.40.2709</Text>
                    <Text style={[drawerStyles.text, { color: '#8B8B8B', fontFamily: 'MPLUS-Regular' }]}>App made by ReitanSora</Text>
                </View>
                <View style={drawerStyles.navigation}>
                    <NormalButton
                        rippleColor='rgba(139, 139, 139, 0.5)'
                        containerStyle={{ width: '100%', backgroundColor: '#363636' }}
                        insideStyle={{ paddingHorizontal: 20, gap: 20, justifyContent: 'flex-start' }}
                        IconSet={Ionicons}
                        iconName='home-outline'
                        TextElement={<Text style={drawerStyles.text}>Home</Text>}
                        onPress={() => {
                            transition.value = 0;
                            router.navigate('/');
                        }}
                    />
                    <NormalButton
                        rippleColor='rgba(139, 139, 139, 0.5)'
                        containerStyle={{ width: '100%', backgroundColor: '#363636' }}
                        insideStyle={{ paddingHorizontal: 20, gap: 20, justifyContent: 'flex-start' }}
                        IconSet={Ionicons}
                        iconName='play-circle-outline'
                        TextElement={<Text style={drawerStyles.text}>Now Playing</Text>}
                        onPress={() => {
                            transition.value = 0;
                            router.navigate('/(player)');
                        }}
                    />
                    <NormalButton
                        rippleColor='rgba(139, 139, 139, 0.5)'
                        containerStyle={{ width: '100%', backgroundColor: '#363636' }}
                        insideStyle={{ paddingHorizontal: 20, gap: 20, justifyContent: 'flex-start' }}
                        IconSet={MaterialCommunityIcons}
                        iconName='music-circle-outline'
                        TextElement={<Text style={drawerStyles.text}>Current Playlist</Text>}
                        onPress={() => {
                            transition.value = 0;
                            router.navigate(currentPlaylist ?
                                {
                                    pathname: '/playlist/[id]',
                                    params: { id: currentPlaylist }
                                }
                                :
                                {
                                    pathname: '/'
                                }
                            );
                        }}
                    />
                </View>
                <View style={[drawerStyles.footer, { bottom: 20 + insets.bottom }]}>
                    <NormalButton
                        rippleColor='rgba(139, 139, 139, 0.5)'
                        containerStyle={{ width: '100%', backgroundColor: '#363636' }}
                        insideStyle={{ paddingHorizontal: 20, gap: 20, justifyContent: 'flex-start' }}
                        IconSet={Ionicons}
                        iconName='settings-outline'
                        TextElement={<Text style={drawerStyles.text}>Settings</Text>}
                        onPress={() => {
                            transition.value = 0;
                            router.navigate({
                                pathname: "/settings",
                            });
                        }}
                    />
                </View>
            </View>

        </Animated.View>
    )
}

export function DrawerBackground({ transition }: DrawerProps) {
    const closeBackground = useAnimatedStyle(() => {
        return {
            opacity: withTiming(transition.value > 0 ? 0.8 : 0.2),
            zIndex: transition.value > 0 ? 1 : -1,
        }
    })

    const drawerBackgroundStyles = StyleSheet.create({
        background: {
            position: 'absolute',
            top: 0,
            left: 0,

            width: '100%',
            height: '100%',
            backgroundColor: '#000',
        }
    });

    return (
        <Animated.View style={[closeBackground, drawerBackgroundStyles.background]}>
            <TouchableWithoutFeedback onPress={() => transition.value = 0}>
                <View style={{ flex: 1, }}></View>
            </TouchableWithoutFeedback>
        </Animated.View>
    )
}