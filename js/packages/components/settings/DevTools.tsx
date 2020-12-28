import React, { useState } from 'react'
import { Alert, ScrollView, Vibration, View } from 'react-native'
import { DropDownPicker } from '@berty-tech/components/shared-components/DropDownPicker'
import { Layout } from '@ui-kitten/components'
import { Translation, useTranslation } from 'react-i18next'
import { useStyles } from '@berty-tech/styles'
import { useNavigation as useNativeNavigation } from '@react-navigation/native'
import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import * as middleware from '@berty-tech/grpc-bridge/middleware'
import beapi from '@berty-tech/api'
import { bridge as rpcBridge } from '@berty-tech/grpc-bridge/rpc'
import { EOF, Service } from '@berty-tech/grpc-bridge'
import GoBridge from '@berty-tech/go-bridge'
import messengerMethodsHooks from '@berty-tech/store/methods'
import { useAccount, useMsgrContext } from '@berty-tech/store/hooks'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import { Player } from '@react-native-community/audio-toolkit'
import { playSound } from '../sounds'
import { MessengerActions, PersistentOptionsKeys } from '@berty-tech/store/context'

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
	const [{ color, text }] = useStyles()

	return (
		<View>
			<ButtonSettingRow
				state={[
					{
						name: t('settings.devtools.header-left-button'),
						icon: 'smartphone-outline',
						color: color.dark.grey,
						style: _styles.buttonRow,
						disabled: true,
					},
					{
						name: t('settings.devtools.header-middle-button'),
						icon: 'book-outline',
						color: color.dark.grey,
						style: _styles.buttonRow,
						onPress: () => {
							navigate.settings.fakeData()
						},
					},
					{
						name: t('settings.devtools.header-right-button'),
						icon: 'repeat-outline',
						color: color.blue,
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

	const messengerClient: any = Service(
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
			iconColor='grey'
			onPress={() => {
				const n = i
				++i
				console.info(`start of the EchoTest stream #${n}`)
				messengerClient
					.echoTest({
						echo: `hello number #${n}`,
						delay: 1000,
					})
					.then((stream: any) => {
						stream.onMessage((res: any) => {
							if (res) {
								Vibration.vibrate(500)
							}
						})

						setTimeout(stream.stop, 10000)
						return stream.start()
					})
					.catch((err: Error) => {
						if (err === EOF) {
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
	const [{ color }] = useStyles()
	const { t } = useTranslation()

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
			iconColor={color.dark.grey}
			onPress={() => {
				createDiscordShareAlert()
			}}
		/>
	)
}

const DumpButton: React.FC<{ text: string; name: string }> = ({ text, name }) => {
	const { navigate } = useNavigation()
	const [{ color }] = useStyles()
	return (
		<ButtonSetting
			name={name}
			icon='activity-outline'
			iconSize={30}
			iconColor={color.dark.grey}
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
	const [{ color }] = useStyles()
	const [disabled, setDisabled] = useState(false)
	const { t } = useTranslation()
	const [name, setName] = useState<any>(t('settings.devtools.send-to-all-button.title'))
	const ctx = useMsgrContext()
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
			iconColor={color.dark.grey}
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
	const [{ color }] = useStyles()
	return (
		<>
			<ButtonSetting
				name={'Play sound'}
				icon='speaker-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				onPress={() => {
					new Player('Notif_Berty02.mp3', { mixWithOthers: true }).play()
				}}
			/>
			<ButtonSetting
				name={'Play preloaded sound'}
				icon='speaker-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				onPress={() => playSound('contactRequestSent')}
			/>
		</>
	)
}

const BodyDevTools: React.FC<{}> = () => {
	const _styles = useStylesDevTools()
	const [{ padding, flex, margin, color, text }] = useStyles()
	const { navigate } = useNavigation()
	const navigation = useNativeNavigation()
	const ctx = useMsgrContext()
	const { t } = useTranslation()

	const items =
		t('settings.devtools.tor-button')?.length &&
		t('settings.devtools.tor-disabled-option')?.length &&
		t('settings.devtools.tor-optional-option')?.length &&
		t('settings.devtools.tor-required-option')?.length
			? [
					{
						label: t('settings.devtools.tor-button', {
							option: t('settings.devtools.tor-disabled-option'),
						}),
						value: t('settings.devtools.tor-disabled-option'),
					},
					{
						label: t('settings.devtools.tor-button', {
							option: t('settings.devtools.tor-optional-option'),
						}),
						value: t('settings.devtools.tor-optional-option'),
					},
					{
						label: t('settings.devtools.tor-button', {
							option: t('settings.devtools.tor-required-option'),
						}),
						value: t('settings.devtools.tor-required-option'),
					},
			  ]
			: []

	return (
		<View style={[padding.medium, flex.tiny, margin.bottom.small]}>
			<ButtonSetting
				name={t('settings.devtools.system-info-button')}
				icon='info-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				onPress={() => navigate.settings.systemInfo()}
			/>
			<ButtonSetting
				name={t('settings.devtools.simulate-button')}
				icon='alert-triangle-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				onPress={() =>
					ctx.dispatch({
						type: MessengerActions.SetStreamError,
						payload: { error: t('settings.devtools.simulate-button') },
					})
				}
			/>
			<ButtonSetting
				name={t('settings.devtools.debug-button')}
				icon='monitor-outline'
				iconSize={30}
				iconColor={color.dark.grey}
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
				items={items}
				defaultValue={
					items?.length
						? ctx.persistentOptions?.tor.flag || t('settings.devtools.tor-disabled-option')
						: null
				}
				containerStyle={[{ marginTop: 22, height: 60 }]}
				onChangeItem={async (item: any) => {
					await ctx.setPersistentOption({
						type: PersistentOptionsKeys.Tor,
						payload: {
							flag: item.value,
						},
					})
				}}
			/>
			<ButtonSetting
				name={t('settings.devtools.add-dev-conversations-button')}
				icon='plus-outline'
				iconSize={30}
				iconColor={color.dark.grey}
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
				iconColor={color.dark.grey}
				onPress={() => GoBridge.closeBridge()}
			/>
			{!ctx.embedded && ctx.daemonAddress !== 'http://localhost:1338' && (
				<ButtonSetting
					name='Switch to 1338 node'
					icon='folder-outline'
					iconSize={30}
					iconColor={color.dark.grey}
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
				name={t('settings.devtools.bot-mode-button')}
				icon='briefcase-outline'
				iconSize={30}
				iconColor={color.green}
				toggled
				disabled
			/>
			<ButtonSetting
				name={t('settings.devtools.local-grpc-button')}
				icon='hard-drive-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				toggled
				disabled
			/>
			<ButtonSetting
				name={t('settings.devtools.console-logs-button')}
				icon='folder-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				actionIcon='arrow-ios-forward'
				disabled
			/>
			<ButtonSetting
				name={t('settings.devtools.ipfs-webui-button')}
				icon='smartphone-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				actionIcon='arrow-ios-forward'
				onPress={() => navigate.settings.ipfsWebUI()}
			/>
			<ButtonSetting
				name={t('settings.devtools.notifications-button')}
				icon='bell-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				actionIcon='arrow-ios-forward'
				disabled
			/>
			<SendToAll />
			<PlaySound />
			<ButtonSettingRow
				state={[
					{
						name: t('settings.devtools.footer-left-button'),
						icon: 'smartphone-outline',
						color: color.dark.grey,
						style: _styles.buttonRow,
						disabled: true,
					},
					{
						name: t('settings.devtools.footer-middle-button'),
						icon: 'list-outline',
						color: color.dark.grey,
						style: _styles.buttonRow,
						disabled: true,
					},
					{
						name: t('settings.devtools.footer-right-button'),
						icon: 'repeat-outline',
						color: color.red,
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

export const DevTools: React.FC<ScreenProps.Settings.DevTools> = () => {
	const { goBack } = useNavigation()
	const [{ background, flex, color, padding }] = useStyles()
	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<Layout style={[background.white, flex.tiny]}>
					<SwipeNavRecognizer>
						<ScrollView bounces={false} contentContainerStyle={padding.bottom.huge}>
							<HeaderSettings
								title={t('settings.devtools.title')}
								bgColor={color.dark.grey}
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
