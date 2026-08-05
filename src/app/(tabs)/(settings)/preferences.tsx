import Input from '@/components/settings/Input';
import { StaticHeader } from '@/components/ui/Header';
import IconButton from '@/components/ui/IconButton';
import { useSettings } from '@/context/AppContext';
import { Theme } from '@/theme';
import { checkServer, isValidIPv4 } from '@/utils/validation';
import {
    Box,
    Column,
    Text as EUIText,
    FilledTonalButton,
    Host,
    ModalBottomSheet,
    ModalBottomSheetRef,
    Row,
    VerticalDivider,
} from '@expo/ui/jetpack-compose';
import { background, clip, fillMaxWidth, height, padding, Shapes, width } from '@expo/ui/jetpack-compose/modifiers';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { memo, useCallback, useEffect, useRef, useState } from 'react';
import { BackHandler, ScrollView, StyleSheet, Text, ToastAndroid, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface ServerListElementProps {
    index: number;
    item: { ip: string; name: string };
    actualServer: { ip: string; name: string };
    leftAction: (value: number) => void;
    rightAction: (value: number) => void;
}

const ServerListElement = memo(({ actualServer, index, item, leftAction, rightAction }: ServerListElementProps) => {
    const [visible, setVisible] = useState(false);
    const sheetRef = useRef<ModalBottomSheetRef>(null);
    const isCurrentServer = item.ip === actualServer.ip;

    return (
        <Host matchContents>
            <IconButton
                onPress={() => setVisible(true)}
                containerStyle={{ width: '100%', height: 'auto', borderRadius: 0 }}
                InsideElement={
                    <View style={styles.serverElementContainer}>
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                            <View style={{ gap: 2 }}>
                                <Text style={[styles.text, styles.subtitle]}>{item.name}</Text>
                                <Text style={[styles.text, { color: Theme.colors.gray }]}>{item.ip}</Text>
                            </View>
                            {isCurrentServer && (
                                <View style={[styles.serverStatus, { backgroundColor: `${Theme.colors.accent}33` }]}>
                                    <Text style={[styles.text, { color: Theme.colors.accent }]}>Connected</Text>
                                </View>
                            )}
                        </View>
                    </View>
                }
            />
            {visible && (
                <ModalBottomSheet
                    ref={sheetRef}
                    onDismissRequest={() => setVisible(false)}>
                    <ModalBottomSheet.DragHandle>
                        <Column
                            horizontalAlignment='center'
                            modifiers={[fillMaxWidth(), padding(0, 10, 0, 10)]}>
                            <Box modifiers={[width(60), height(5), clip(Shapes.Circle), background(Theme.colors.gray)]} />
                        </Column>
                    </ModalBottomSheet.DragHandle>
                    <Column
                        verticalArrangement={{ spacedBy: 10 }}
                        modifiers={[padding(20, 20, 20, 0), fillMaxWidth()]}>
                        <EUIText style={{ fontFamily: Theme.fontFamily.bold, fontSize: Theme.fontSize.subtitle }}>Manage server</EUIText>
                        <EUIText style={{ fontFamily: Theme.fontFamily.regular, fontSize: Theme.fontSize.paragraph }}>
                            What would you like to do with the next server? You can temporarily disconnect from it or remove it from your saved list.
                        </EUIText>
                        <Row
                            modifiers={[fillMaxWidth(), height(50), padding(0, 10, 0, 0)]}
                            horizontalArrangement={'spaceEvenly'}>
                            <EUIText style={{ fontFamily: Theme.fontFamily.regular, fontSize: Theme.fontSize.subtitle }}>{item.name}</EUIText>
                            <VerticalDivider
                                color={Theme.colors.darkGray}
                                thickness={2}
                                modifiers={[height(24)]}
                            />
                            <EUIText style={{ fontFamily: Theme.fontFamily.regular, fontSize: Theme.fontSize.subtitle }}>{item.ip}</EUIText>
                        </Row>
                    </Column>
                    <Column modifiers={[fillMaxWidth(), padding(0, 10, 0, 20)]}>
                        <Row
                            horizontalArrangement='spaceEvenly'
                            modifiers={[fillMaxWidth()]}>
                            <FilledTonalButton
                                modifiers={[height(48)]}
                                onClick={() => leftAction(index)}
                                colors={{ containerColor: Theme.colors.darkGray }}>
                                <EUIText
                                    style={{ fontFamily: Theme.fontFamily.bold, fontSize: Theme.fontSize.subtitle }}
                                    color={'#F54927'}>
                                    DELETE
                                </EUIText>
                            </FilledTonalButton>
                            <FilledTonalButton
                                modifiers={[height(48)]}
                                onClick={() => rightAction(index)}
                                colors={{ containerColor: Theme.colors.darkGray }}>
                                <EUIText
                                    style={{ fontFamily: Theme.fontFamily.bold, fontSize: Theme.fontSize.subtitle }}
                                    color={isCurrentServer ? Theme.colors.gray : Theme.colors.accent}>
                                    {isCurrentServer ? 'DISCONNECT' : 'CONNECT'}
                                </EUIText>
                            </FilledTonalButton>
                        </Row>
                    </Column>
                </ModalBottomSheet>
            )}
        </Host>
    );
});

export default function Preferences() {
    const [serverIp, setServerIp] = useState<string>('');
    const [serverName, setServerName] = useState<string>('');
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const params = useLocalSearchParams<{ ip: string }>();
    const { actualServer, setActualServer, serverList, setServerList } = useSettings();

    const showToast = useCallback((message: string) => {
        ToastAndroid.show(message, ToastAndroid.SHORT);
    }, []);

    const handleBack = useCallback(() => {
        router.dismissTo('/(tabs)/(settings)');
    }, [router]);

    const handleScan = useCallback(() => {
        router.navigate('/(tabs)/(settings)/scan');
    }, [router]);

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
        setServerList((prevList) => [...(Array.isArray(prevList) ? prevList : []), { ip: serverIp, name: serverName }]);
        setServerIp('');
        setServerName('');
        showToast('Server verified and added successfully!');
    };

    const handleDeleteSavedServer = useCallback(
        (ip: string) => {
            setServerList((prev) => prev.filter((item) => item.ip !== ip));
            if (ip === actualServer.ip) {
                setActualServer({ ip: '127.0.0.1', name: 'PC' });
            }
        },
        [actualServer.ip],
    );

    const handleToggleConnection = useCallback(
        (index: number) => {
            const selectedItem = serverList.at(index);

            if (!selectedItem) return;

            if (selectedItem?.ip === actualServer.ip) {
                setActualServer({ ip: '127.0.0.1', name: 'PC' });
            } else {
                setActualServer({ ip: selectedItem.ip, name: selectedItem.name });
            }
        },
        [actualServer.ip],
    );

    useEffect(() => {
        const onBackPress = () => {
            handleBack();
            return true;
        };

        const subscription = BackHandler.addEventListener('hardwareBackPress', onBackPress);

        return () => subscription.remove();
    }, [handleBack]);

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
                            <Input
                                IconSet={MaterialCommunityIcons}
                                iconName='server'
                                inputProps={{ maxLength: 15 }}
                                keyboardType='decimal-pad'
                                placeholder='192.168.X.X'
                                setValue={setServerIp}
                                value={serverIp}
                            />
                            <View style={{ width: '100%', height: 1, backgroundColor: Theme.colors.lightGray }}></View>
                            <Input
                                IconSet={MaterialCommunityIcons}
                                iconName='tag-text'
                                inputProps={{ maxLength: 20, autoCapitalize: 'words' }}
                                keyboardType='default'
                                placeholder='Server Name'
                                setValue={setServerName}
                                value={serverName}
                            />
                        </View>
                        <View style={styles.sectionButtons}>
                            <IconButton
                                onPress={handleScan}
                                IconSet={Ionicons}
                                iconName='qr-code'
                                containerStyle={{
                                    width: '100%',
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
                                    width: '100%',
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
                                <ServerListElement
                                    actualServer={actualServer}
                                    index={index}
                                    item={item}
                                    key={item.ip}
                                    leftAction={() => handleDeleteSavedServer(item.ip)}
                                    rightAction={() => handleToggleConnection(index)}
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
        fontFamily: Theme.fontFamily.regular,
        fontSize: Theme.fontSize.tiny,
    },
    inputsWrapper: {
        borderWidth: 1,
        borderColor: Theme.colors.lightGray,
        borderRadius: 10,
    },
    section: {
        width: '100%',
        backgroundColor: Theme.colors.lightBlack,
        padding: 20,

        flexDirection: 'column',
        gap: 20,

        borderRadius: 20,
    },
    sectionButtons: {
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 20,
    },
    serverElementContainer: {
        width: '100%',
        padding: 10,

        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        gap: 20,
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
