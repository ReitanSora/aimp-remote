import { Theme } from '@/theme';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { StyleSheet, Text, TextInput, TextStyle, View, ViewStyle } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated';
import IconButton from './IconButton';

interface HeaderProps {
    searchBarVisible?: boolean;
    searchValue?: string;
    setSearchBarVisible?: (value: boolean) => void;
    setSearchValue?: (value: string) => void;
    hasLeftAction?: boolean;
    headerStyle?: ViewStyle;
    onLeftActionPress?: () => void;
    title?: string;
    titleStyle?: TextStyle;
}

interface NormalHeaderProps {
    children?: React.ReactNode;
    containerStyle?: ViewStyle;
    hasLeftAction?: boolean;
    hasFilter: boolean;
    title: string;
    titleStyle?: TextStyle;
    onLeftActionPress?: () => void;
    rightHeaderStyle?: ViewStyle;
    subtitle?: string;
}

export default function SearchHeader({
    hasLeftAction,
    headerStyle,
    onLeftActionPress = () => {},
    searchBarVisible,
    setSearchBarVisible = () => {},
    searchValue,
    setSearchValue = () => {},
    title,
    titleStyle,
}: HeaderProps) {
    const transition = useSharedValue(0);

    const animatedSearchbar = useAnimatedStyle(() => {
        return {
            opacity: transition.value,
            transform: [{ scale: withTiming(transition.value === 0 ? 0.9 : 1) }],
            zIndex: transition.value > 0 ? 0 : -1,
        };
    });

    const animatedTitle = useAnimatedStyle(() => {
        return {
            // opacity: 1 - transition.value,
            transform: [{ scale: 1 - transition.value * 0.1 }],
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
        <View style={[styles.header, headerStyle]}>
            <View style={styles.headerLeft}>
                {hasLeftAction && (
                    <IconButton
                        onPress={onLeftActionPress}
                        IconSet={Ionicons}
                        iconName='chevron-back'
                        iconColor={Theme.colors.white}
                    />
                )}
                {searchBarVisible ? (
                    <Animated.View style={[styles.searchbarWrapper, animatedSearchbar]}>
                        <Ionicons
                            name='search'
                            size={24}
                            color='white'
                        />
                        <TextInput
                            style={styles.input}
                            placeholder='Search'
                            placeholderTextColor={'#8B8B8B'}
                            cursorColor={'#8B8B8B'}
                            selectionColor={'#8B8B8B'}
                            selectionHandleColor={'#8B8B8B'}
                            autoCapitalize='none'
                            autoFocus={true}
                            autoCorrect={false}
                            spellCheck={false}
                            value={searchValue}
                            onChangeText={(newText) => setSearchValue(newText)}
                        />
                    </Animated.View>
                ) : (
                    <Animated.Text style={[styles.headerTitle, animatedTitle, titleStyle]}>{title}</Animated.Text>
                )}
            </View>
            <View style={styles.headerRight}>
                <Animated.View style={[styles.buttons]}>
                    {searchBarVisible ? (
                        <IconButton
                            onPress={() => handleCloseSearchbar()}
                            IconSet={Ionicons}
                            iconName='close'
                        />
                    ) : (
                        <IconButton
                            onPress={() => handleShowSearchbar()}
                            IconSet={Ionicons}
                            iconName='search'
                        />
                    )}
                </Animated.View>
            </View>
        </View>
    );
}

export function StaticHeader({
    children,
    containerStyle,
    hasFilter,
    hasLeftAction = true,
    onLeftActionPress = () => {},
    subtitle,
    title,
    titleStyle,
    rightHeaderStyle,
}: NormalHeaderProps) {
    return (
        <View style={[styles.header, containerStyle]}>
            <View style={[styles.headerLeft]}>
                {hasLeftAction && (
                    <IconButton
                        onPress={onLeftActionPress}
                        IconSet={Ionicons}
                        iconName='chevron-back'
                        iconColor={Theme.colors.lightGray}
                    />
                )}
                <View style={styles.headerText}>
                    {title && (
                        <Animated.Text
                            numberOfLines={1}
                            lineBreakMode='tail'
                            style={[styles.headerTitle, titleStyle]}>
                            {title}
                        </Animated.Text>
                    )}
                    {subtitle && (
                        <Text
                            numberOfLines={1}
                            lineBreakMode='tail'
                            style={styles.headerTextSubtitle}>
                            {subtitle}
                        </Text>
                    )}
                </View>
            </View>
            {hasFilter && (
                <View style={[styles.headerRight, { width: 48 }, rightHeaderStyle]}>
                    <View style={[styles.headerButtons]}>{children}</View>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    header: {
        width: '100%',
        height: 60,
        paddingHorizontal: 20,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    headerLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 10,
    },
    headerRight: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    headerTitle: {
        fontSize: Theme.fontSize.title,
        fontFamily: Theme.fontFamily.bold,
        color: Theme.colors.white,
    },
    headerText: {
        flex: 1,
        flexDirection: 'column',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    headerTextTitle: {
        fontSize: Theme.fontSize.title,
        fontWeight: 'bold',
        color: Theme.colors.lightGray,
    },
    headerTextSubtitle: {
        fontSize: Theme.fontSize.paragraph,
        color: Theme.colors.gray,
    },
    headerButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
    },
    searchbarWrapper: {
        flex: 1,
        height: 48,
        backgroundColor: Theme.colors.darkGray,
        paddingHorizontal: 20,

        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        gap: 10,

        borderRadius: 20,
    },
    buttons: {
        flexDirection: 'row',
    },
    input: {
        fontSize: Theme.fontSize.subtitle,
        fontFamily: 'MPLUS-Regular',

        color: Theme.colors.lightGray,
        flex: 1,
        height: '100%',

        textAlignVertical: 'center',
    },
    title: {
        color: '#FFF',
        fontFamily: 'MPLUS-Bold',
        fontSize: 24,
    },
});
