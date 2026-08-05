import { Theme } from '@/theme';
import { ComponentProps } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';

interface InputElementProps {
    IconSet: React.ElementType;
    iconName: string;
    keyboardType:
        | 'default'
        | 'number-pad'
        | 'decimal-pad'
        | 'numeric'
        | 'email-address'
        | 'phone-pad'
        | 'url'
        | 'ascii-capable'
        | 'numbers-and-punctuation'
        | 'name-phone-pad'
        | 'twitter'
        | 'web-search'
        | 'visible-password';
    placeholder: string;
    inputProps?: ComponentProps<typeof TextInput>;
    setValue: (value: string) => void;
    value: string;
}

export default function Input({ IconSet, iconName, keyboardType, placeholder, inputProps, setValue, value }: InputElementProps) {
    return (
        <View style={styles.inputContainer}>
            <View style={{ height: '100%', paddingHorizontal: 15, paddingVertical: 15 }}>
                <IconSet
                    name={iconName}
                    size={24}
                    color={Theme.colors.lightGray}
                />
            </View>
            <TextInput
                style={styles.input}
                keyboardType={keyboardType}
                placeholder={placeholder}
                placeholderTextColor={'#8B8B8B'}
                cursorColor={'#8B8B8B'}
                selectionColor={'#8B8B8B'}
                selectionHandleColor={'#8B8B8B'}
                autoCapitalize='none'
                autoCorrect={false}
                autoFocus={false}
                spellCheck={false}
                {...inputProps}
                value={value}
                onChangeText={(newText) => setValue(newText)}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    inputContainer: {
        width: '100%',

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        overflow: 'hidden',
    },
    input: {
        width: '100%',
        height: '100%',

        fontFamily: Theme.fontFamily.regular,
        color: Theme.colors.white,

        textAlignVertical: 'center',
    },
});
