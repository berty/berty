import React, { useCallback, useEffect, useRef, useState } from 'react'
import { Alert, ScrollView, StatusBar, Vibration, View } from 'react-native'
import { Layout } from '@ui-kitten/components'
import { Translation, useTranslation } from 'react-i18next'
import { Player } from '@react-native-community/audio-toolkit'
import { useNavigation as useNativeNavigation } from '@react-navigation/native'
import Long from 'long'
import AsyncStorage from '@react-native-community/async-storage'
import crashlytics from '@react-native-firebase/crashlytics'
import { withInAppNotification } from 'react-native-in-app-notification'

import {
	accountService,
	defaultPersistentOptions,
	GlobalPersistentOptionsKeys,
	MessengerActions,
	PersistentOptionsKeys,
} from '@berty-tech/store/context'
import { useStyles } from '@berty-tech/styles'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import * as middleware from '@berty-tech/grpc-bridge/middleware'
import beapi from '@berty-tech/api'
import { bridge as rpcBridge } from '@berty-tech/grpc-bridge/rpc'
import { Service } from '@berty-tech/grpc-bridge'
import GoBridge from '@berty-tech/go-bridge'
import messengerMethodsHooks from '@berty-tech/store/methods'
import { useAccount, useMsgrContext, useThemeColor } from '@berty-tech/store/hooks'

import { HeaderSettings } from '../shared-components/Header'
import {
	ButtonSetting,
	ButtonSettingItem,
	ButtonSettingRow,
	StringOptionInput,
} from '../shared-components/SettingsButtons'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import { showNeedRestartNotification } from '../helpers'
import { DropDownPicker } from '../shared-components/DropDownPicker'

//
// DevTools
//

// Styles
const useStylesDevTools = () => {
	const [{ margin, height }] = useStyles()
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
	const [{ text }] = useStyles()
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
							navigate.settings.fakeData()
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
				styleText={[text.bold.medium]}
			/>
		</View>
	)
}

const NativeCallButton: React.FC = () => {
	// create middleware(s) if needed
	const messengerMiddlewares = middleware.chain(
		__DEV__ ? middleware.logger.create('MESSENGER') : null, // eslint-disable-line
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
	const account: any = useAccount()
	const { call, done, error } = messengerMethodsHooks.useDevShareInstanceBertyID()
	const { t } = useTranslation()
	const colors = useThemeColor()

	React.useEffect(() => {
		if (done) {
			Vibration.vibrate(500)
			if (error) {
				navigate.settings.devText({
					text: error.toString(),
				})
			} else {
				goBack()
			}
		}
	}, [done, error, goBack, navigate.settings])

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
			onPress={() => navigate.settings.devText({ text })}
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
	const ctx = useMsgrContext()
	const text = JSON.stringify(ctx.contacts, null, 2)
	const { t } = useTranslation()
	return <DumpButton name={t('settings.devtools.dump-contacts-button')} text={text} />
}

const DumpConversations: React.FC = () => {
	const ctx = useMsgrContext()
	const text = JSON.stringify(ctx.conversations, null, 2)
	const { t } = useTranslation()
	return <DumpButton name={t('settings.devtools.dump-conversations-button')} text={text} />
}

const DumpInteractions: React.FC = () => {
	const ctx = useMsgrContext()
	const text = JSON.stringify(ctx.interactions, null, 2)
	const { t } = useTranslation()
	return <DumpButton name={t('settings.devtools.dump-interactions-button')} text={text} />
}

const SendToAll: React.FC = () => {
	const [disabled, setDisabled] = useState(false)
	const { t } = useTranslation()
	const [name, setName] = useState<any>(t('settings.devtools.send-to-all-button.title'))
	const ctx = useMsgrContext()
	const colors = useThemeColor()
	const convs: any[] = Object.values(ctx.conversations).filter(
		(conv: any) => conv.type === beapi.messenger.Conversation.Type.ContactType && !conv.fake,
	)
	const body = `${t('settings.devtools.send-to-all-button.test')}${new Date(
		Date.now(),
	).toLocaleString()}`
	const buf = beapi.messenger.AppMessage.UserMessage.encode({ body }).finish()
	const handleSendToAll = React.useCallback(async () => {
		setDisabled(true)
		setName(t('settings.devtools.send-to-all-button.sending'))
		for (const conv of convs) {
			try {
				await ctx.client?.interact({
					conversationPublicKey: conv.publicKey,
					type: beapi.messenger.AppMessage.Type.TypeUserMessage,
					payload: buf,
				})
			} catch (e) {
				console.warn(e)
			}
		}
		setDisabled(false)
		setName(`${t('settings.devtools.send-to-all-button.tried', { length: convs.length })}`)
		setTimeout(() => setName(t('settings.devtools.send-to-all-button.title')), 1000)
	}, [buf, convs, ctx.client, t])
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
	const ctx = useMsgrContext()
	const text = JSON.stringify(ctx.members, null, 2)
	const { t } = useTranslation()
	return <DumpButton name={t('settings.devtools.dump-members-button')} text={text} />
}

const PlaySound: React.FC = () => {
	const { playSound } = useMsgrContext()
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
	const [{ padding, flex, margin, text }] = useStyles()
	const { navigate } = useNavigation()
	const navigation = useNativeNavigation()
	const ctx = useMsgrContext()
	const { t } = useTranslation()
	const tyberHosts = useRef<{ [key: string]: string[] }>({})
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [rerender, setRerender] = useState(0)
	const colors = useThemeColor()

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

	useEffect(() => {
		let subStream: any = null

		ctx.client?.tyberHostSearch({}).then(async stream => {
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
	}, [addTyberHost, ctx.client])

	const torOptions =
		t('settings.devtools.tor-button', {
			option: '',
		})?.length &&
		t('settings.devtools.tor-disabled-option')?.length &&
		t('settings.devtools.tor-optional-option')?.length &&
		t('settings.devtools.tor-required-option')?.length
			? [
					{
						label: t('settings.devtools.tor-button', {
							option: t('settings.devtools.tor-disabled-option'),
						}),
						value: String(beapi.account.NetworkConfig.TorFlag.TorDisabled),
					},
					{
						label: t('settings.devtools.tor-button', {
							option: t('settings.devtools.tor-optional-option'),
						}),
						value: String(beapi.account.NetworkConfig.TorFlag.TorOptional),
					},
					{
						label: t('settings.devtools.tor-button', {
							option: t('settings.devtools.tor-required-option'),
						}),
						value: String(beapi.account.NetworkConfig.TorFlag.TorRequired),
					},
			  ]
			: []

	return (
		<View style={[padding.medium, flex.tiny, margin.bottom.small]}>
			<ButtonSetting
				name={t('settings.devtools.theme-editor')}
				icon='color-palette-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				onPress={() => navigate.settings.themeEditor()}
			/>
			<ButtonSetting
				name={t('settings.devtools.system-info-button')}
				icon='info-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				onPress={() => navigate.settings.systemInfo()}
			/>
			<ButtonSetting
				name={t('settings.devtools.simulate-button')}
				icon='alert-triangle-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				onPress={() =>
					ctx.dispatch({
						type: MessengerActions.SetStreamError,
						payload: { error: t('settings.devtools.simulate-button') },
					})
				}
			/>
			<ButtonSetting
				name={t('settings.devtools.simulate-js-error-button')}
				icon='alert-octagon'
				iconPack='feather'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				onPress={() => {
					throw {}
				}}
			/>
			<ButtonSetting
				name={t('settings.devtools.debug-button')}
				icon='monitor-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				toggled
				varToggle={ctx?.persistentOptions.debug.enable}
				actionToggle={async () => {
					await ctx.setPersistentOption({
						type: PersistentOptionsKeys.Debug,
						payload: {
							enable: !ctx.persistentOptions?.debug.enable,
						},
					})
				}}
			/>
			<DropDownPicker
				items={torOptions}
				defaultValue={
					torOptions?.length && ctx.networkConfig.tor
						? String(ctx.networkConfig.tor)
						: String(beapi.account.NetworkConfig.TorFlag.TorDisabled)
				}
				onChangeItem={async (item: any) => {
					let newValue = beapi.account.NetworkConfig.TorFlag.TorDisabled

					try {
						newValue = parseInt(item.value, 10)
					} catch (e) {
						console.warn('unable to cast new value')
						return
					}

					const newConfig = {
						...ctx.networkConfig,
						tor: newValue,
					}

					await accountService.networkConfigSet({
						accountId: ctx.selectedAccount,
						config: newConfig,
					})

					ctx.setNetworkConfig(newConfig)
					showNeedRestartNotification(showNotification, ctx, t)
				}}
			/>
			<StringOptionInput
				name={t('settings.devtools.log-button.name')}
				bulletPointValue={t('settings.devtools.log-button.bullet-point')}
				getOptionValue={() => ctx.persistentOptions.log.format}
				setOptionValue={val => {
					ctx.setPersistentOption({
						type: PersistentOptionsKeys.Log,
						payload: { format: val },
					})
					showNeedRestartNotification(showNotification, ctx, t)
				}}
			/>
			<StringOptionInput
				name={t('settings.devtools.log-filters-button.name')}
				bulletPointValue={t('settings.devtools.log-filters-button.bullet-point')}
				getOptionValue={() => ctx.persistentOptions.logFilters.format}
				setOptionValue={val => {
					ctx.setPersistentOption({
						type: PersistentOptionsKeys.LogFilters,
						payload: { format: val },
					})
					showNeedRestartNotification(showNotification, ctx, t)
				}}
			/>
			<StringOptionInput
				name={t('settings.devtools.tyber-host-button.name')}
				bulletPointValue={t('settings.devtools.tyber-host-button.bullet-point')}
				getOptionValue={async () =>
					(await AsyncStorage.getItem(GlobalPersistentOptionsKeys.TyberHost)) ||
					defaultPersistentOptions().tyberHost.address
				}
				setOptionValue={val => {
					AsyncStorage.setItem(GlobalPersistentOptionsKeys.TyberHost, val)
					showNeedRestartNotification(showNotification, ctx, t)
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
							await ctx.client?.tyberHostAttach({
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
			{!ctx.embedded && ctx.daemonAddress !== 'http://localhost:1338' && (
				<ButtonSetting
					name='Switch to 1338 node'
					icon='folder-outline'
					iconSize={30}
					iconColor={colors['alt-secondary-background-header']}
					actionIcon='arrow-ios-forward'
					onPress={() => {
						ctx.dispatch({
							type: MessengerActions.SetDaemonAddress,
							payload: { value: 'http://localhost:1338' },
						})
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
				onPress={() => navigate.settings.ipfsWebUI()}
			/>
			<SendToAll />
			<PlaySound />
			<ButtonSetting
				name={t('debug.inspector.show-button')}
				icon='umbrella-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				actionIcon='arrow-ios-forward'
				onPress={() => ctx.setDebugMode(true)}
			/>
			<ButtonSetting
				name={t('settings.devtools.trigger-crashlytics-button')}
				icon='umbrella-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				actionIcon='arrow-ios-forward'
				onPress={() => crashlytics().crash()}
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
				styleText={[text.bold.medium]}
			/>
		</View>
	)
})

export const DevTools: React.FC<ScreenProps.Settings.DevTools> = () => {
	const { goBack } = useNavigation()
	const colors = useThemeColor()

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<Layout style={{ backgroundColor: colors['main-background'], flex: 1 }}>
					<StatusBar
						backgroundColor={colors['alt-secondary-background-header']}
						barStyle='light-content'
					/>
					<SwipeNavRecognizer>
						<ScrollView bounces={false}>
							<HeaderSettings
								title={t('settings.devtools.title')}
								bgColor={colors['alt-secondary-background-header']}
								undo={goBack}
							>
								<HeaderDevTools />
							</HeaderSettings>
							<BodyDevTools />
						</ScrollView>
					</SwipeNavRecognizer>
				</Layout>
			)}
		</Translation>
	)
}
