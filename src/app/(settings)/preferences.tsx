import { StaticHeader } from '@/components/ui/Header';
import IconButton from '@/components/ui/IconButton';
import { useSettings } from '@/context/appContext';
import { Theme } from '@/theme';
import { checkServer, isValidIPv4 } from '@/utils/validation';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { ComponentProps, useEffect, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, Text, TextInput, ToastAndroid, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

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

const tempServers = [
    { ip: '192.168.1.1', name: 'PC1' },
    { ip: '192.168.1.2', name: 'PC2' },
    { ip: '192.168.1.3', name: 'PC3' },
    { ip: '192.168.1.4', name: 'PC4' },
    { ip: '192.168.1.5', name: 'PC5' },
];

function InputElement({ IconSet, iconName, keyboardType, placeholder, inputProps, setValue, value }: InputElementProps) {
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

export default function Preferences() {
    const [serverIp, setServerIp] = useState<string>('');
    const [serverName, setServerName] = useState<string>('');
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const params = useLocalSearchParams<{ ip: string }>();
    const { actualServer, setActualServer, serverList, setServerList } = useSettings();

    const showToast = (message: string) => {
        ToastAndroid.show(message, ToastAndroid.SHORT);
    };

    const handleBack = () => {
        router.dismissTo('/(settings)');
    };

    const handleSave = async () => {
        if (!serverIp || !serverName) {
            showToast('Please complete IP address and server name');
            return;
        }
        if (!isValidIPv4(serverIp)) {
            showToast('Incorrect IP address');
            return;
        }

        const isDuplicate = serverList.some((server) => server.ip === serverIp || server.name.toLowerCase() === serverName.toLowerCase());

        if (isDuplicate) {
            showToast('A server with this IP or name already exists');
            return;
        }

        showToast('Checking server connection...');

        const isServerOnline = await checkServer(serverIp);

        if (!isServerOnline) {
            showToast('Could not reach the server at this IP');
            return;
        }

        setActualServer({ ip: serverIp, name: serverName });
        setServerList((prevList) => {
            const currentList = Array.isArray(prevList) ? prevList : [];
            return [...currentList, { ip: serverIp, name: serverName }];
        });
        setServerIp('');
        setServerName('');
        showToast('Server verified and added successfully!');
    };

    useEffect(() => {
        const onBackPress = () => {
            router.dismissTo('/(settings)');
            return true;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => subscription.remove();
    }, [router]);

    useEffect(() => {
        if (params.ip) {
            setServerIp(params.ip);
            showToast('Successfully scanned, IP address filled in');
        }
    }, [params.ip]);

    return (
        <View style={[styles.container, { paddingTop: insets.top, paddingBottom: insets.bottom }]}>
            <StaticHeader
                hasFilter={false}
                title='Preferences'
                onLeftActionPress={handleBack}
            />
            <ScrollView>
                <View style={styles.content}>
                    <View style={{ paddingHorizontal: 20 }}>
                        <Text style={[styles.text, styles.subtitle]}>Server Management</Text>
                    </View>
                    <View style={styles.section}>
                        <Text style={[styles.text, styles.subtitle]}>Add New Server</Text>
                        <View style={styles.inputsWrapper}>
                            <InputElement
                                IconSet={MaterialCommunityIcons}
                                iconName='server'
                                inputProps={{ maxLength: 15 }}
                                keyboardType='decimal-pad'
                                placeholder='192.168.X.X'
                                setValue={setServerIp}
                                value={serverIp}
                            />
                            <View style={{ width: '100%', height: 1, backgroundColor: Theme.colors.lightGray }}></View>
                            <InputElement
                                IconSet={MaterialCommunityIcons}
                                iconName='tag-text'
                                inputProps={{ maxLength: 20, autoCapitalize: 'words' }}
                                keyboardType='default'
                                placeholder='Server Name'
                                setValue={(newText) => setServerName(newText)}
                                value={serverName}
                            />
                        </View>
                        <View style={styles.sectionButtons}>
                            <IconButton
                                onPress={() => router.navigate('/(settings)/scan')}
                                IconSet={Ionicons}
                                iconName='qr-code'
                                containerStyle={{
                                    width: 'auto',
                                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                    borderWidth: 1,
                                    borderColor: Theme.colors.gray,
                                }}
                                insideStyle={{ paddingHorizontal: 20, gap: 10 }}
                                InsideElement={<Text style={[styles.text, styles.subtitle]}>Scan QR Code</Text>}
                            />
                            <IconButton
                                onPress={handleSave}
                                rippleColor={`${Theme.colors.accent}1A`}
                                IconSet={Ionicons}
                                iconName='save'
                                containerStyle={{
                                    width: 'auto',
                                    backgroundColor: `${Theme.colors.accent}33`,
                                    borderWidth: 1,
                                    borderColor: Theme.colors.accent,
                                }}
                                insideStyle={{ paddingHorizontal: 20, gap: 10 }}
                                InsideElement={<Text style={[styles.text, styles.subtitle]}>Save</Text>}
                            />
                        </View>
                    </View>
                    <View style={styles.section}>
                        <Text style={[styles.text, styles.subtitle]}>Added Servers</Text>
                        <View style={{ width: '100%', flexDirection: 'column' }}>
                            {serverList.map((item, index) => (
                                <IconButton
                                    onPress={() => {}}
                                    containerStyle={{ width: '100%', height: 'auto', borderRadius: 0 }}
                                    key={`${index}-saved-server`}
                                    InsideElement={
                                        <View style={styles.serverElementContainer}>
                                            <Text style={[styles.text, styles.subtitle]}>{index + 1}</Text>
                                            <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between' }}>
                                                <View style={styles.serverInformation}>
                                                    <Text style={[styles.text, styles.subtitle]}>{item.name}</Text>
                                                    <Text style={[styles.text, { color: Theme.colors.gray }]}>{item.ip}</Text>
                                                </View>
                                                {item.ip === actualServer.ip && (
                                                    <View style={[styles.serverStatus, { backgroundColor: `#23a55a33` }]}>
                                                        <Text style={[styles.text, { color: '#23a55a' }]}>Online</Text>
                                                    </View>
                                                )}
                                            </View>
                                        </View>
                                    }
                                />
                            ))}
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
        paddingBottom: 0,

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
    tinyText: {
        fontFamily: Theme.fontFamily.thin,
        fontSize: Theme.fontSize.tiny,
    },
    section: {
        width: '100%',
        backgroundColor: Theme.colors.lightBlack,
        padding: 20,

        flexDirection: 'column',
        gap: 20,

        borderRadius: 20,
    },
    inputsWrapper: {
        borderWidth: 1,
        borderColor: Theme.colors.lightGray,
        borderRadius: 10,
    },
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

        fontFamily: Theme.fontFamily.medium,
        color: Theme.colors.white,

        textAlignVertical: 'center',
    },
    sectionButtons: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    serverElementContainer: {
        width: '100%',
        padding: 10,
        paddingHorizontal: 20,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 20,
    },
    serverInformation: {
        gap: 5,
    },
    serverStatus: {
        height: 40,
        backgroundColor: Theme.colors.darkGray,
        paddingHorizontal: 20,

        alignItems: 'center',
        justifyContent: 'center',

        borderRadius: 20,
    },
});
