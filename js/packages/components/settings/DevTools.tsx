import React, { useState } from 'react'
import { View, ScrollView, Vibration, Alert } from 'react-native'
import { Layout } from '@ui-kitten/components'
import { useStyles } from '@berty-tech/styles'
import { useNavigation as useNativeNavigation } from '@react-navigation/native'
import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import * as middleware from '@berty-tech/grpc-bridge/middleware'
import { messenger as messengerpb } from '@berty-tech/api/index.js'
import { bridge as rpcBridge } from '@berty-tech/grpc-bridge/rpc'
import { Service, EOF } from '@berty-tech/grpc-bridge'
import GoBridge from '@berty-tech/go-bridge'
import messengerMethodsHooks from '@berty-tech/store/methods'
import { useAccount, useMsgrContext } from '@berty-tech/store/hooks'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import { Player } from '@react-native-community/audio-toolkit'
import { playSound } from '../sounds'
import { MessengerActions } from '@berty-tech/store/context'

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
	const _styles = useStylesDevTools()
	const [{ color, text }] = useStyles()

	return (
		<View>
			<ButtonSettingRow
				state={[
					{
						name: 'Device infos',
						icon: 'smartphone-outline',
						color: color.dark.grey,
						style: _styles.buttonRow,
						disabled: true,
					},
					{
						name: 'Generate fake data',
						icon: 'book-outline',
						color: color.dark.grey,
						style: _styles.buttonRow,
						onPress: () => {
							navigate.settings.fakeData()
						},
					},
					{
						name: 'Restart daemon',
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
		messengerpb.MessengerService,
		rpcBridge,
		messengerMiddlewares,
	)
	let i = 0
	return (
		<ButtonSetting
			name='Test Native Bridge'
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
	const { refresh, done, error } = messengerMethodsHooks.useDevShareInstanceBertyID()
	const [{ color }] = useStyles()

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
			'Do you want to share your QR code to "#dev-logs" on Berty Discord?',
			'This will allow other staff to scan your QR code or copy your contact link.',
			[
				{
					text: 'Nope',
					style: 'cancel',
				},
				{
					text: 'Yep 👍',
					onPress: () => {
						refresh({
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
			name='Share ID on discord'
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
	return <DumpButton name='Dump account' text={text} />
}

const DumpContacts: React.FC = () => {
	const ctx = useMsgrContext()
	const text = JSON.stringify(ctx.contacts, null, 2)
	return <DumpButton name='Dump contacts' text={text} />
}

const DumpConversations: React.FC = () => {
	const ctx = useMsgrContext()
	const text = JSON.stringify(ctx.conversations, null, 2)
	return <DumpButton name='Dump conversations' text={text} />
}

const DumpInteractions: React.FC = () => {
	const ctx = useMsgrContext()
	const text = JSON.stringify(ctx.interactions, null, 2)
	return <DumpButton name='Dump interactions' text={text} />
}

const SendToAll: React.FC = () => {
	const [{ color }] = useStyles()
	const [disabled, setDisabled] = useState(false)
	const [name, setName] = useState('Send message to all contacts')
	const ctx = useMsgrContext()
	const convs: any[] = Object.values(ctx.conversations).filter(
		(conv: any) => conv.type === messengerpb.Conversation.Type.ContactType && !conv.fake,
	)
	const body = `Test, ${new Date(Date.now()).toLocaleString()}`
	const buf: string = messengerpb.AppMessage.UserMessage.encode({ body }).finish()
	const handleSendToAll = React.useCallback(async () => {
		setDisabled(true)
		setName('Sending...')
		for (const conv of convs) {
			try {
				await ctx.client?.interact({
					conversationPublicKey: conv.publicKey,
					type: messengerpb.AppMessage.Type.TypeUserMessage,
					payload: buf,
				})
			} catch (e) {
				console.warn(e)
			}
		}
		setDisabled(false)
		setName(`✔ Tried sending to ${convs.length} contacts`)
		setTimeout(() => setName('Send message to all contacts'), 1000)
	}, [buf, convs, ctx.client])
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
	return <DumpButton name='Dump members' text={text} />
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

	return (
		<View style={[padding.medium, flex.tiny, margin.bottom.small]}>
			<ButtonSetting
				name='System info'
				icon='info-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				onPress={navigate.settings.systemInfo}
			/>
			<ButtonSetting
				name='Add bots'
				icon='info-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				onPress={() => navigation.navigate('Settings.AddContactList')}
			/>
			<DiscordShareButton />
			<NativeCallButton />
			<DumpAccount />
			<DumpContacts />
			<DumpConversations />
			<DumpInteractions />
			<DumpMembers />
			<ButtonSetting
				name={'Stop node'}
				icon='activity-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				onPress={() => GoBridge.closeBridge()}
			/>
			{!ctx.embedded && ctx.daemonAddress != 'http://localhost:1338' && (
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
				name='Bot mode'
				icon='briefcase-outline'
				iconSize={30}
				iconColor={color.green}
				toggled
				disabled
			/>
			<ButtonSetting
				name='local gRPC'
				icon='hard-drive-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				toggled
				disabled
			/>
			<ButtonSetting
				name='Console logs'
				icon='folder-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				actionIcon='arrow-ios-forward'
				disabled
			/>
			<ButtonSetting
				name='Ipfs WebUI'
				icon='smartphone-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				actionIcon='arrow-ios-forward'
				onPress={navigate.settings.ipfsWebUI}
			/>
			<ButtonSetting
				name='Notifications'
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
						name: 'Device infos',
						icon: 'smartphone-outline',
						color: color.dark.grey,
						style: _styles.buttonRow,
						disabled: true,
					},
					{
						name: 'List events',
						icon: 'list-outline',
						color: color.dark.grey,
						style: _styles.buttonRow,
						disabled: true,
					},
					{
						name: 'Restart daemon',
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
		<Layout style={[background.white, flex.tiny]}>
			<SwipeNavRecognizer>
				<ScrollView bounces={false} contentContainerStyle={padding.bottom.huge}>
					<HeaderSettings title='Dev tools' bgColor={color.dark.grey} undo={goBack}>
						<HeaderDevTools />
					</HeaderSettings>
					<BodyDevTools />
				</ScrollView>
			</SwipeNavRecognizer>
		</Layout>
	)
}
