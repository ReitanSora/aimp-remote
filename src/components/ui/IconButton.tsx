import { Theme } from '@/theme';
import React from 'react';
import { Pressable, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

interface IconButtonProps {
    onPress: () => void;
    rippleColor?: string;
    containerStyle?: ViewStyle;
    insideStyle?: StyleProp<ViewStyle>;
    IconSet?: React.ElementType;
    iconName?: string;
    iconSize?: number;
    iconColor?: string;
    InsideElement?: React.ReactNode;
}

export default function IconButton({
    onPress,
    rippleColor = Theme.colors.ripple,
    containerStyle,
    insideStyle,
    IconSet,
    iconName,
    iconSize,
    iconColor,
    InsideElement,
}: IconButtonProps) {
    return (
        <View style={[styles.buttonNormalContainer, containerStyle]}>
            <Pressable
                onPress={onPress}
                android_ripple={{ color: rippleColor, borderless: false, foreground: true }}
                style={{ flex: 1 }}>
                <View style={[styles.buttonInside, insideStyle]}>
                    {IconSet && (
                        <IconSet
                            name={iconName}
                            size={iconSize || 24}
                            color={iconColor || 'white'}
                        />
                    )}
                    {InsideElement}
                </View>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    buttonNormalContainer: {
        width: 48,
        height: 48,
        // backgroundColor: 'rgba(255, 255, 255, 0.1)',

        overflow: 'hidden',

        borderRadius: 48,
        // borderWidth: 1,
        // borderColor: Theme.colors.gray,

        // filter: [{ blur: 1 }],
        // elevation: 4,
        // shadowColor: '#363636',
    },
    buttonInside: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});
