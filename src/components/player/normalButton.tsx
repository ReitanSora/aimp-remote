import React from "react";
import { StyleSheet, TouchableNativeFeedback, View, ViewStyle } from "react-native";

interface NormalButtonProps {
    onPress: () => void;
    rippleColor?: string;
    containerStyle?: ViewStyle;
    insideStyle?: ViewStyle;
    IconSet?: React.ElementType;
    iconName?: string;
    iconSize?: number;
    iconColor?: string;
    TextElement?: React.ReactNode;
}

export default function NormalButton({ onPress, rippleColor = 'rgba(139, 139, 139, 0.5)', containerStyle, insideStyle, IconSet, iconName, iconSize, iconColor, TextElement }: NormalButtonProps) {
    return (
        <View style={[styles.buttonNormalContainer, containerStyle]}>
            <TouchableNativeFeedback
                background={TouchableNativeFeedback.Ripple(rippleColor, false)}
                useForeground
                onPress={onPress}
            >
                <View style={[styles.buttonInside, insideStyle]}>
                    {IconSet &&
                        <IconSet
                            name={iconName}
                            size={iconSize || 24}
                            color={iconColor || 'white'}
                        />}
                        {TextElement}
                </View>
            </TouchableNativeFeedback>
        </View>
    )
}

const styles = StyleSheet.create({
    buttonNormalContainer: {
        width: 48,
        height: 48,

        overflow: 'hidden',

        borderRadius: 50,
    },
    buttonInside: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
})