import { Ionicons } from '@expo/vector-icons'
import React from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import NormalButton from '../player/normalButton'

interface SearchBarProps {
    hasSearchBar?: boolean;
    searchBarVisible?: boolean;
    searchValue?: string;
    setSearchBarVisible?: (value: boolean) => void;
    setSearchValue?: (value: string) => void;
    leftSideOnPress: () => void;
    LeftSideIconSet: React.ElementType;
    iconName: string;
    iconSize?: number;
    iconColor?: string;
    title?: string;
}

export default function Header({ hasSearchBar = true, searchBarVisible, searchValue, setSearchBarVisible, setSearchValue, leftSideOnPress, LeftSideIconSet, iconName, iconSize, iconColor, title }: SearchBarProps) {
    const transition = useSharedValue(0);

    const animatedSearchbar = useAnimatedStyle(() => {
        return {
            opacity: transition.value,
            transform: [
                { scale: withTiming(transition.value === 0 ? 0.9 : 1) },
            ],
            zIndex: transition.value > 0 ? 0 : -1,
        };
    });

    const animatedNormalHeader = useAnimatedStyle(() => {
        return {
            opacity: 1 - transition.value,
            transform: [{ scale: 1 - (transition.value * 0.1) }],
            zIndex: transition.value < 1 ? 0 : -1,
        };
    });

    const handleShowSearchbar = () => {
        setSearchBarVisible(true);
        transition.value = withTiming(1, { duration: 300 });
    };

    const handleCloseSearchbar = () => {
        setSearchValue('');
        setSearchBarVisible(false);
        transition.value = withTiming(0, { duration: 300 });
    };

    return (
        <View style={styles.header}>
            {hasSearchBar ?
                <>
                    <Animated.View
                        pointerEvents={searchBarVisible ? 'none' : 'auto'}
                        style={[styles.normalWrapper, animatedNormalHeader]}
                    >
                        <NormalButton
                            rippleColor='rgba(139, 139, 139, 0.5)'
                            onPress={() => leftSideOnPress()}
                            IconSet={LeftSideIconSet}
                            iconName={iconName}
                            iconSize={iconSize}
                            iconColor={iconColor}
                        />
                        <NormalButton
                            rippleColor='rgba(139, 139, 139, 0.5)'
                            onPress={() => handleShowSearchbar()}
                            IconSet={Ionicons}
                            iconName='search'
                        />
                    </Animated.View>
                    <Animated.View
                        pointerEvents={searchBarVisible ? 'auto' : 'none'}
                        style={[styles.searchbarWrapper, animatedSearchbar]}
                    >
                        <View style={{ width: 48, height: 48, alignItems: 'center', justifyContent: 'center' }}>
                            <Ionicons name="search" size={24} color="white" />
                        </View>
                        <TextInput
                            style={styles.input}
                            placeholder='Search'
                            placeholderTextColor={'#8B8B8B'}
                            cursorColor={'#8B8B8B'}
                            selectionColor={'#8B8B8B'}
                            selectionHandleColor={'#8B8B8B'}
                            value={searchValue}
                            onChangeText={newText => setSearchValue(newText)}
                        />
                        <NormalButton
                            rippleColor='transparent'
                            onPress={() => handleCloseSearchbar()}
                            IconSet={Ionicons}
                            iconName='close'
                        />
                    </Animated.View>
                </> :
                <View
                    style={[styles.normalWrapper, {alignItems: 'center', justifyContent: 'flex-start', gap: 20,}]}
                >
                    <NormalButton
                        rippleColor='rgba(139, 139, 139, 0.5)'
                        onPress={() => leftSideOnPress()}
                        IconSet={LeftSideIconSet}
                        iconName={iconName}
                        iconSize={iconSize}
                        iconColor={iconColor}
                    />
                    <Text style={styles.title}>{title}</Text>
                </View>}
        </View>
    )
}

const styles = StyleSheet.create({
    header: {
        position: 'relative',

        width: '100%',
        height: 60,
        paddingHorizontal: 20,
        // backgroundColor: '#c6c6c6',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },
    normalWrapper: {
        position: 'absolute',

        width: '100%',
        height: 50,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    searchbarWrapper: {
        position: 'absolute',

        width: '100%',
        height: 40,
        backgroundColor: '#363636',
        paddingHorizontal: 20,
        // paddingVertical: 5,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',

        borderRadius: 20,
    },
    input: {
        // backgroundColor: '#C6C6C6',
        height: 50,
        marginLeft: 10,

        flex: 1,

        color: '#FFF',
        fontFamily: 'MPLUS-Regular',
        fontSize: 14,
    },
    title: {
        color: '#FFF',
        fontFamily: 'MPLUS-Bold',
        fontSize: 24,
    },
});