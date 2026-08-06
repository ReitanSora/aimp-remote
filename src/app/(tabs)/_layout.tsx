import TogglePlayer from '@/components/ui/TogglePlayer';
import { Theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import { Tabs, useSegments } from 'expo-router';
import { View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function TabsLayout() {
    const segment = useSegments();
    const insets = useSafeAreaInsets();
    const page = segment[segment.length - 1];
    const pagesToHideTabBar = ['player', 'songDetails', 'about', 'preferences', 'scan'];

    return (
        <View style={{ flex: 1, paddingBottom: insets.bottom }}>
            <Tabs
                screenOptions={{
                    tabBarStyle: {
                        display: pagesToHideTabBar.includes(page) ? 'none' : 'flex',

                        height: 70,
                        backgroundColor: Theme.colors.background,

                        alignItems: 'center',
                        justifyContent: 'center',

                        borderTopWidth: 1,
                        borderTopColor: Theme.colors.darkGray,
                        elevation: 0,
                    },
                    tabBarItemStyle: {
                        justifyContent: 'center',
                        alignItems: 'center',
                        width: '100%',
                        height: 70,
                    },
                    tabBarIconStyle: {
                        flex: 1,
                    },
                    tabBarVisibilityAnimationConfig: {
                        show: { animation: 'spring' },
                        hide: { animation: 'spring' },
                    },
                    tabBarActiveTintColor: Theme.colors.accent,
                    tabBarInactiveTintColor: Theme.colors.gray,
                    // tabBarHideOnKeyboard: true,
                    tabBarShowLabel: false,
                    headerShown: false,
                }}
                initialRouteName='(home)'>
                <Tabs.Screen
                    name='(home)'
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons
                                name={focused ? 'home' : 'home-outline'}
                                size={24}
                                color={color}
                            />
                        ),
                    }}
                />
                <Tabs.Screen
                    name='(settings)'
                    options={{
                        tabBarIcon: ({ color, focused }) => (
                            <Ionicons
                                name={focused ? 'settings' : 'settings-outline'}
                                size={24}
                                color={color}
                            />
                        ),
                    }}
                />
            </Tabs>
            {!pagesToHideTabBar.includes(page) ? (
                <View style={{ position: 'absolute', bottom: 80 }}>
                    <TogglePlayer />
                </View>
            ) : null}
        </View>
    );
}

// export default function HomeLayout() {
//     return (
//         <SettingsProvider>
//             <TabsLayout />
//         </SettingsProvider>
//     );
// }
