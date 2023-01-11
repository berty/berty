import { Player } from '@react-native-community/audio-toolkit'
import { Layout } from '@ui-kitten/components'
import i18next from 'i18next'
import Long from 'long'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, Platform, ScrollView, StatusBar, Vibration, View } from 'react-native'
import { withInAppNotification } from 'react-native-in-app-notification'
import { useSelector } from 'react-redux'

import beapi from '@berty/api'
import {
	AccountsDropdown,
	DividerItem,
	ItemSection,
	MenuItem,
	MenuItemWithIcon,
} from '@berty/components'
import { DropDownPicker, Item } from '@berty/components/shared-components/DropDownPicker'
import {
	ButtonSetting,
	ButtonSettingItem,
	ButtonSettingRow,
	StringOptionInput,
} from '@berty/components/shared-components/SettingsButtons'
import { useStyles } from '@berty/contexts/styles'
import { createServiceClient } from '@berty/grpc-bridge'
import * as middleware from '@berty/grpc-bridge/middleware'
import { bridge as rpcBridge } from '@berty/grpc-bridge/rpc'
import {
	useAllConversations,
	useAllInteractions,
	useAppDispatch,
	useAppSelector,
	useContactsDict,
	useConversationsDict,
	useAccount,
	usePlaySound,
	useRestartAfterClosing,
	useThemeColor,
	useMessengerClient,
	bertyMethodsHooks,
	useCloseBridgeAfterClosing,
	useOnBoardingAfterClosing,
	useImportingAccountAfterClosing,
	useSwitchAccountAfterClosing,
} from '@berty/hooks'
import { languages } from '@berty/i18n/locale/languages'
import { GoBridge } from '@berty/native-modules/GoBridge'
import { ScreenFC, useNavigation } from '@berty/navigation'
import {
	PersistentOptionsKeys,
	selectPersistentOptions,
	setPersistentOption,
} from '@berty/redux/reducers/persistentOptions.reducer'
import {
	selectAccounts,
	selectSelectedAccount,
	setDebugMode,
	setStreamError,
} from '@berty/redux/reducers/ui.reducer'
import { importAccountFromDocumentPicker } from '@berty/utils/accounts'
import { storageGet, storageSet } from '@berty/utils/accounts/accountClient'
import { exportLogfile } from '@berty/utils/accounts/accountUtils'
import { pbDateToNum } from '@berty/utils/convert/time'
import { defaultGlobalPersistentOptions } from '@berty/utils/global-persistent-options/defaults'
import { GlobalPersistentOptionsKeys } from '@berty/utils/global-persistent-options/types'
import { showNeedRestartNotification } from '@berty/utils/notification/notif-in-app'

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

	const messengerClient = createServiceClient(
		beapi.messenger.MessengerService,
		rpcBridge,
		messengerMiddlewares,
	)
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
	const { call, done, error } = bertyMethodsHooks.useDevShareInstanceBertyID()
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
	const [name, setName] = useState(t('settings.devtools.send-to-all-button.title'))
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
	const client = useMessengerClient()
	const restart = useRestartAfterClosing()
	const restartBridge = useCloseBridgeAfterClosing()
	const selectedAccount = useAppSelector(selectSelectedAccount)
	const restartOnboarding = useOnBoardingAfterClosing()
	const [forceMock, setForceMock] = useState<boolean>(false)

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

	// effect to get async storage forceMock value
	useEffect(() => {
		const f = async () => {
			try {
				const finalForceMock =
					JSON.parse(await storageGet(GlobalPersistentOptionsKeys.ForceMock)) ||
					defaultGlobalPersistentOptions().forceMock
				setForceMock(finalForceMock)
			} catch (e) {
				console.warn('Failed to get forceMock value:', e)
			}
		}

		f().then()
	}, [])

	const handleForceMockToggle = useCallback(async () => {
		const updateForceMock = forceMock ? false : true
		await storageSet(GlobalPersistentOptionsKeys.ForceMock, JSON.stringify(updateForceMock))
		setForceMock(updateForceMock)
	}, [forceMock])

	const importingAccountAfterClosing = useImportingAccountAfterClosing()
	const [isHandlingPress, setIsHandlingPress] = React.useState(false)
	const accounts = useSelector(selectAccounts)
	const switchAccount = useSwitchAccountAfterClosing()
	const handlePress = React.useCallback(
		async (item: beapi.account.IAccountMetadata) => {
			if (isHandlingPress || !item.accountId) {
				return
			}
			setIsHandlingPress(true)
			if (selectedAccount !== item.accountId) {
				switchAccount(item.accountId)
			}
			return
		},
		[isHandlingPress, selectedAccount, switchAccount],
	)

	return (
		<View
			style={[flex.tiny, margin.bottom.small, { backgroundColor: colors['secondary-background'] }]}
		>
			<ItemSection>
				<AccountsDropdown
					placeholder={t('settings.accounts.accounts-button')}
					items={[...accounts].sort(
						(a, b) => pbDateToNum(a.creationDate) - pbDateToNum(b.creationDate),
					)}
					defaultValue={selectedAccount}
					onChangeItem={handlePress}
				/>
			</ItemSection>

			<ItemSection>
				<MenuItem onPress={restartOnboarding}>{t('settings.accounts.create-button')}</MenuItem>

				{Platform.OS !== 'web' && (
					<>
						<DividerItem />
						<MenuItem
							onPress={async () => {
								const filePath = await importAccountFromDocumentPicker()
								if (!filePath) {
									console.warn("imported file doesn't exist")
									return
								}
								importingAccountAfterClosing(filePath)
							}}
						>
							{t('settings.accounts.import-button')}
						</MenuItem>
					</>
				)}
			</ItemSection>

			<ItemSection>
				<DividerItem />
				<MenuItemWithIcon
					iconName='pricetags-outline'
					onPress={() => navigate('Settings.LinkedIdentities')}
				>
					{t('settings.home.linked-identities-button')}
				</MenuItemWithIcon>
			</ItemSection>

			<View style={[padding.horizontal.medium]}>
				<ButtonSetting
					name={t('settings.devtools.force-mock-button')}
					icon='folder-outline'
					iconSize={30}
					iconColor={colors['alt-secondary-background-header']}
					toggled
					varToggle={forceMock}
					actionToggle={handleForceMockToggle}
				/>
				<ButtonSetting
					icon='monitor-outline'
					iconColor={colors['alt-secondary-background-header']}
					name={t('settings.devtools.select-node.title')}
					onPress={() =>
						navigate('Account.SelectNode', {
							init: false,
							action: async (_external: boolean, _address: string, _port: string) => {
								showNeedRestartNotification(showNotification, restartBridge, t)
								return true
							},
						})
					}
				/>
				<ButtonSetting
					icon='eye-outline'
					iconColor={colors['alt-secondary-background-header']}
					name={t('settings.home.appearance-button')}
					onPress={() => navigate('Settings.Appearance')}
				/>
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
					onPress={() =>
						dispatch(setStreamError({ error: t('settings.devtools.simulate-button') }))
					}
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
									enable: !persistentOptions?.debug.enable,
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
					getOptionValue={async () =>
						(await storageGet(GlobalPersistentOptionsKeys.LogFilters)) ||
						defaultGlobalPersistentOptions().logFilters.format
					}
					setOptionValue={async val => {
						await storageSet(GlobalPersistentOptionsKeys.LogFilters, val)
						showNeedRestartNotification(showNotification, restart, t)
					}}
				/>
				<ButtonSetting
					name={t('settings.devtools.export-logs-button')}
					icon='file-text-outline'
					iconSize={30}
					iconColor={colors['alt-secondary-background-header']}
					onPress={async () => {
						console.log('remi: button')
						// await logfileList()
						await exportLogfile(selectedAccount)
					}}
				/>
				<StringOptionInput
					name={t('settings.devtools.tyber-host-button.name')}
					bulletPointValue={t('settings.devtools.tyber-host-button.bullet-point')}
					getOptionValue={async () =>
						(await storageGet(GlobalPersistentOptionsKeys.TyberHost)) ||
						defaultGlobalPersistentOptions().tyberHost.address
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
					defaultValue={i18next.language}
					onChangeItem={async (item: Item) => await i18next.changeLanguage(item.value)}
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
