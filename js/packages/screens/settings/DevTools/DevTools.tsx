import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, ScrollView, StatusBar, Vibration, View } from 'react-native'
import { Layout } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import Long from 'long'

import {
	GlobalPersistentOptionsKeys,
	storageGet,
	storageSet,
	useMessengerClient,
	useThemeColor,
} from '@berty/store'
import { useStyles } from '@berty/contexts/styles'
import { ScreenFC, useNavigation } from '@berty/navigation'
import * as middleware from '@berty/grpc-bridge/middleware'
import beapi from '@berty/api'
import { bridge as rpcBridge } from '@berty/grpc-bridge/rpc'
import { Service } from '@berty/grpc-bridge'
import GoBridge from '@berty/go-bridge'
import messengerMethodsHooks from '@berty/store/methods'
import { languages } from '@berty/i18n/locale/languages'
import i18n from '@berty/i18n'
import { setAccountLanguage } from '@berty/redux/reducers/accountSettings.reducer'
import {
	useAllConversations,
	useAllInteractions,
	useAppDispatch,
	useAppSelector,
	useContactsDict,
	useConversationsDict,
	useAccount,
	usePlaySound,
	useRestart,
} from '@berty/hooks'
import { Player } from '@react-native-community/audio-toolkit'

import {
	ButtonSetting,
	ButtonSettingItem,
	ButtonSettingRow,
	StringOptionInput,
} from '@berty/components/shared-components/SettingsButtons'
import { showNeedRestartNotification } from '@berty/components/helpers'
import { DropDownPicker, Item } from '@berty/components/shared-components/DropDownPicker'
import { useSelector } from 'react-redux'
import {
	selectDaemonAddress,
	selectEmbedded,
	setDaemonAddress,
	setDebugMode,
	setStreamError,
} from '@berty/redux/reducers/ui.reducer'
import { withInAppNotification } from 'react-native-in-app-notification'
import {
	defaultPersistentOptions,
	PersistentOptionsKeys,
	selectPersistentOptions,
	setPersistentOption,
} from '@berty/redux/reducers/persistentOptions.reducer'

//
// DevTools
//

// Styles
const useStylesDevTools = () => {
	const { margin, height } = useStyles()
	return {
		buttonRow: [margin.right.scale(20), height(90)],
		lastButtonRow: height(90),
		buttonRowMarginTop: margin.top.scale(20),
	}
}

const HeaderDevTools: React.FC<{}> = () => {
	const { navigate } = useNavigation()
	const { t } = useTranslation()
	const _styles = useStylesDevTools()
	const { text } = useStyles()
	const colors = useThemeColor()

	return (
		<View>
			<ButtonSettingRow
				state={[
					{
						name: t('settings.devtools.header-left-button'),
						icon: 'smartphone-outline',
						color: colors['alt-secondary-background-header'],
						style: _styles.buttonRow,
						disabled: true,
					},
					{
						name: t('settings.devtools.header-middle-button'),
						icon: 'book-outline',
						color: colors['alt-secondary-background-header'],
						style: _styles.buttonRow,
						onPress: () => {
							navigate('Settings.FakeData')
						},
					},
					{
						name: t('settings.devtools.header-right-button'),
						icon: 'repeat-outline',
						color: colors['background-header'],
						style: _styles.lastButtonRow,
						disabled: true,
					},
				]}
				style={[_styles.buttonRowMarginTop]}
				styleText={[text.bold]}
			/>
		</View>
	)
}

const NativeCallButton: React.FC = () => {
	// create middleware(s) if needed
	const messengerMiddlewares = middleware.chain(
		__DEV__ ? middleware.logger.create('MESSENGER') : null,
	)
	const colors = useThemeColor()

	const messengerClient = Service(beapi.messenger.MessengerService, rpcBridge, messengerMiddlewares)
	const { t } = useTranslation()
	let i = 0
	return (
		<ButtonSetting
			name={t('settings.devtools.native-bridge-button')}
			icon='activity-outline'
			iconSize={30}
			iconColor={colors['secondary-text']}
			onPress={() => {
				const n = i
				++i
				console.info(`start of the EchoTest stream #${n}`)
				messengerClient
					.echoTest({
						echo: `hello number #${n}`,
						delay: Long.fromNumber(1000),
					})
					.then(stream => {
						stream.onMessage(res => {
							if (res) {
								Vibration.vibrate(500)
							}
						})

						setTimeout(stream.stop, 10000)
						return stream.start()
					})
					.catch(err => {
						if (err?.EOF) {
							console.info(`end of the EchoTest stream #${n}`)
						} else if (err) {
							console.warn(err)
						}
					})
				++i
			}}
		/>
	)
}

const DiscordShareButton: React.FC = () => {
	const { navigate, goBack } = useNavigation()
	const account = useAccount()
	const { call, done, error } = messengerMethodsHooks.useDevShareInstanceBertyID()
	const { t } = useTranslation()
	const colors = useThemeColor()

	React.useEffect(() => {
		if (done) {
			Vibration.vibrate(500)
			if (error) {
				navigate('Settings.DevText', {
					text: error.toString(),
				})
			} else {
				goBack()
			}
		}
	}, [done, error, goBack, navigate])

	const createDiscordShareAlert = () =>
		Alert.alert(
			t('settings.devtools.share-button.alert-title'),
			t('settings.devtools.share-button.alert-message'),
			[
				{
					text: t('settings.devtools.share-button.alert-cancel-button'),
					style: 'cancel',
				},
				{
					text: t('settings.devtools.share-button.alert-accept-button'),
					onPress: () => {
						call({
							displayName: account.displayName,
						})
					},
					style: 'default',
				},
			],
			{ cancelable: true },
		)

	return (
		<ButtonSetting
			name={t('settings.devtools.share-button.title')}
			icon='activity-outline'
			iconSize={30}
			iconColor={colors['alt-secondary-background-header']}
			onPress={() => {
				createDiscordShareAlert()
			}}
		/>
	)
}

const DumpButton: React.FC<{ text: string; name: string }> = ({ text, name }) => {
	const { navigate } = useNavigation()
	const colors = useThemeColor()
	return (
		<ButtonSetting
			name={name}
			icon='activity-outline'
			iconSize={30}
			iconColor={colors['alt-secondary-background-header']}
			onPress={() => navigate('Settings.DevText', { text })}
		/>
	)
}

const DumpAccount: React.FC = () => {
	const acc = useAccount()
	const text = JSON.stringify(acc, null, 2)
	const { t } = useTranslation()
	return <DumpButton name={t('settings.devtools.dump-account-button')} text={text} />
}

const DumpContacts: React.FC = () => {
	const contacts = useContactsDict()
	const text = JSON.stringify(contacts, null, 2)
	const { t } = useTranslation()
	return <DumpButton name={t('settings.devtools.dump-contacts-button')} text={text} />
}

const DumpConversations: React.FC = () => {
	const conversations = useConversationsDict()
	const text = JSON.stringify(conversations, null, 2)
	const { t } = useTranslation()
	return <DumpButton name={t('settings.devtools.dump-conversations-button')} text={text} />
}

const DumpInteractions: React.FC = () => {
	const interactions = useAllInteractions()
	const text = JSON.stringify(interactions, null, 2)
	const { t } = useTranslation()
	return <DumpButton name={t('settings.devtools.dump-interactions-button')} text={text} />
}

const SendToAllContacts: React.FC = () => {
	const [disabled, setDisabled] = useState(false)
	const { t } = useTranslation()
	const [name, setName] = useState<any>(t('settings.devtools.send-to-all-button.title'))
	const client = useMessengerClient()
	const colors = useThemeColor()
	const conversations = useAllConversations()
	const filteredConvs = conversations.filter(
		conv => conv.type === beapi.messenger.Conversation.Type.ContactType && !(conv as any)?.fake,
	)
	const body = `${t('settings.devtools.send-to-all-button.test')}${new Date(
		Date.now(),
	).toLocaleString()}`
	const buf = beapi.messenger.AppMessage.UserMessage.encode({ body }).finish()
	const handleSendToAll = React.useCallback(async () => {
		setDisabled(true)
		setName(t('settings.devtools.send-to-all-button.sending'))
		for (const conv of filteredConvs) {
			try {
				await client?.interact({
					conversationPublicKey: conv.publicKey,
					type: beapi.messenger.AppMessage.Type.TypeUserMessage,
					payload: buf,
				})
			} catch (e) {
				console.warn(e)
			}
		}
		setDisabled(false)
		setName(`${t('settings.devtools.send-to-all-button.tried', { length: filteredConvs.length })}`)
		setTimeout(() => setName(t('settings.devtools.send-to-all-button.title')), 1000)
	}, [buf, filteredConvs, client, t])
	return (
		<ButtonSetting
			name={name}
			icon='paper-plane-outline'
			iconSize={30}
			iconColor={colors['alt-secondary-background-header']}
			disabled={disabled}
			onPress={() => {
				handleSendToAll()
				Vibration.vibrate(500)
			}}
		/>
	)
}

const DumpMembers: React.FC = () => {
	const members = useAppSelector(state => state.messenger.membersBuckets)
	const text = JSON.stringify(members, null, 2)
	const { t } = useTranslation()
	return <DumpButton name={t('settings.devtools.dump-members-button')} text={text} />
}

const PlaySound: React.FC = () => {
	const playSound = usePlaySound()
	const colors = useThemeColor()

	return (
		<>
			<ButtonSetting
				name={'Play sound'}
				icon='speaker-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				onPress={() => {
					new Player('Notif_Berty02.mp3', { mixWithOthers: true }).play()
				}}
			/>
			<ButtonSetting
				name={'Play preloaded sound'}
				icon='speaker-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				onPress={() => playSound('contactRequestSent')}
			/>
		</>
	)
}

const BodyDevTools: React.FC<{}> = withInAppNotification(({ showNotification }: any) => {
	const _styles = useStylesDevTools()
	const { padding, flex, margin, text } = useStyles()
	const { navigate } = useNavigation()
	const navigation = useNavigation()
	const { t } = useTranslation()
	const tyberHosts = useRef<{ [key: string]: string[] }>({})
	const [, setRerender] = useState(0)
	const colors = useThemeColor()
	const dispatch = useAppDispatch()
	const persistentOptions = useSelector(selectPersistentOptions)
	const embedded = useSelector(selectEmbedded)
	const client = useMessengerClient()
	const restart = useRestart()
	const daemonAddress = useSelector(selectDaemonAddress)

	const addTyberHost = useCallback(
		(host: string, addresses: string[]) => {
			if (tyberHosts.current[host]) {
				return
			}

			tyberHosts.current[host] = addresses
			setRerender(Date.now())
		},
		[tyberHosts, setRerender],
	)
	const items: any = Object.entries(languages).map(([key, attrs]) => ({
		label: attrs.localName,
		value: key,
	}))

	items.push({ label: 'Debug', value: 'cimode' })

	useEffect(() => {
		let subStream: any = null

		client?.tyberHostSearch({}).then(async stream => {
			stream.onMessage((msg, err) => {
				if (err) {
					return
				}

				if (!msg) {
					return
				}

				try {
					addTyberHost(msg?.hostname!, [...msg?.ipv4, ...msg?.ipv6])
				} catch (e) {
					console.warn(e)
				}
			})

			await stream.start()
			subStream = stream
		})

		return () => {
			if (subStream !== null) {
				subStream.stop()
			}
		}
	}, [addTyberHost, client])

	return (
		<View style={[padding.medium, flex.tiny, margin.bottom.small]}>
			<ButtonSetting
				name={t('settings.devtools.system-info-button')}
				icon='info-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				onPress={() => navigate('Settings.SystemInfo')}
			/>
			<ButtonSetting
				name={t('settings.devtools.simulate-button')}
				icon='alert-triangle-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				onPress={() => dispatch(setStreamError({ error: t('settings.devtools.simulate-button') }))}
			/>
			<ButtonSetting
				name={t('settings.devtools.simulate-js-error-button')}
				icon='alert-octagon'
				iconPack='feather'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				onPress={() => {
					throw new Error('test error')
				}}
			/>
			<ButtonSetting
				name={t('settings.devtools.debug-button')}
				icon='monitor-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				toggled
				varToggle={persistentOptions.debug.enable}
				actionToggle={() => {
					dispatch(
						setPersistentOption({
							type: PersistentOptionsKeys.Debug,
							payload: {
								enable: persistentOptions?.debug.enable,
							},
						}),
					)
				}}
			/>
			<StringOptionInput
				name={t('settings.devtools.log-button.name')}
				bulletPointValue={t('settings.devtools.log-button.bullet-point')}
				getOptionValue={() => persistentOptions.log.format}
				setOptionValue={val => {
					dispatch(
						setPersistentOption({
							type: PersistentOptionsKeys.Log,
							payload: { format: val },
						}),
					)
					showNeedRestartNotification(showNotification, restart, t)
				}}
			/>
			<StringOptionInput
				name={t('settings.devtools.log-filters-button.name')}
				bulletPointValue={t('settings.devtools.log-filters-button.bullet-point')}
				getOptionValue={() => persistentOptions.logFilters.format}
				setOptionValue={val => {
					dispatch(
						setPersistentOption({
							type: PersistentOptionsKeys.LogFilters,
							payload: { format: val },
						}),
					)
					showNeedRestartNotification(showNotification, restart, t)
				}}
			/>
			<StringOptionInput
				name={t('settings.devtools.tyber-host-button.name')}
				bulletPointValue={t('settings.devtools.tyber-host-button.bullet-point')}
				getOptionValue={async () =>
					(await storageGet(GlobalPersistentOptionsKeys.TyberHost)) ||
					defaultPersistentOptions().tyberHost.address
				}
				setOptionValue={async val => {
					await storageSet(GlobalPersistentOptionsKeys.TyberHost, val)
					showNeedRestartNotification(showNotification, restart, t)
				}}
			/>
			{Object.entries(tyberHosts.current).map(([hostname, ipAddresses]) => (
				<ButtonSetting
					key={hostname}
					name={t('settings.devtools.tyber-attach', { host: hostname })}
					icon='link-2-outline'
					iconSize={30}
					iconColor={colors['alt-secondary-background-header']}
					onPress={async () => {
						try {
							await client?.tyberHostAttach({
								addresses: ipAddresses,
							})
						} catch (e) {
							console.warn(e)
						}
					}}
				>
					<ButtonSettingItem
						value={ipAddresses.join('\n')}
						iconSize={15}
						disabled
						styleText={{ color: colors['secondary-text'] }}
						styleContainer={[margin.bottom.tiny]}
					/>
				</ButtonSetting>
			))}
			<ButtonSetting
				name={t('settings.devtools.add-dev-conversations-button')}
				icon='plus-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				onPress={() => navigation.navigate('Settings.AddDevConversations')}
			/>
			<DiscordShareButton />
			<NativeCallButton />
			<DumpAccount />
			<DumpContacts />
			<DumpConversations />
			<DumpInteractions />
			<DumpMembers />
			<ButtonSetting
				name={t('settings.devtools.stop-node-button')}
				icon='activity-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				onPress={() => GoBridge.closeBridge()}
			/>
			{!embedded && daemonAddress !== 'http://localhost:1338' && (
				<ButtonSetting
					name='Switch to 1338 node'
					icon='folder-outline'
					iconSize={30}
					iconColor={colors['alt-secondary-background-header']}
					actionIcon='arrow-ios-forward'
					onPress={() => {
						dispatch(setDaemonAddress({ value: 'http://localhost:1338' }))
					}}
				/>
			)}
			<ButtonSetting
				name={t('settings.devtools.local-grpc-button')}
				icon='hard-drive-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				toggled
				disabled
			/>
			<ButtonSetting
				name={t('settings.devtools.console-logs-button')}
				icon='folder-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				actionIcon='arrow-ios-forward'
				disabled
			/>
			<ButtonSetting
				name={t('settings.devtools.ipfs-webui-button')}
				icon='smartphone-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				actionIcon='arrow-ios-forward'
				onPress={() => navigate('Settings.IpfsWebUI')}
			/>
			<SendToAllContacts />
			<PlaySound />
			<DropDownPicker
				items={items}
				defaultValue={i18n.language}
				onChangeItem={(item: Item) => dispatch(setAccountLanguage(item.value))}
			/>
			<ButtonSetting
				name={t('debug.inspector.show-button')}
				icon='umbrella-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				actionIcon='arrow-ios-forward'
				onPress={() => dispatch(setDebugMode(true))}
			/>
			<ButtonSettingRow
				state={[
					{
						name: t('settings.devtools.footer-left-button'),
						icon: 'smartphone-outline',
						color: colors['alt-secondary-background-header'],
						style: _styles.buttonRow,
						disabled: true,
					},
					{
						name: t('settings.devtools.footer-middle-button'),
						icon: 'list-outline',
						color: colors['alt-secondary-background-header'],
						style: _styles.buttonRow,
						disabled: true,
					},
					{
						name: t('settings.devtools.footer-right-button'),
						icon: 'repeat-outline',
						color: colors['warning-asset'],
						style: _styles.lastButtonRow,
						disabled: true,
					},
				]}
				style={[_styles.buttonRowMarginTop]}
				styleText={[text.bold]}
			/>
		</View>
	)
})

export const DevTools: ScreenFC<'Settings.DevTools'> = () => {
	const colors = useThemeColor()
	const { padding } = useStyles()

	return (
		<Layout style={{ backgroundColor: colors['main-background'], flex: 1 }}>
			<StatusBar
				backgroundColor={colors['alt-secondary-background-header']}
				barStyle='light-content'
			/>
			<ScrollView bounces={false}>
				<View
					style={[padding.medium, { backgroundColor: colors['alt-secondary-background-header'] }]}
				>
					<HeaderDevTools />
				</View>
				<BodyDevTools />
			</ScrollView>
		</Layout>
	)
}
