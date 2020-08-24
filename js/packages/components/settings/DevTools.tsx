import React from 'react'
import { View, ScrollView, Vibration } from 'react-native'
import { Layout } from 'react-native-ui-kitten'
import { useSelector } from 'react-redux'
import { useStyles } from '@berty-tech/styles'
import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import * as middleware from '@berty-tech/grpc-bridge/middleware'
import { messenger as messengerpb } from '@berty-tech/api/index.js'
import { bridge as rpcBridge } from '@berty-tech/grpc-bridge/rpc'
import { Service, EOF } from '@berty-tech/grpc-bridge'
import GoBridge from '@berty-tech/go-bridge'

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
						name: 'Generate fake datas',
						icon: 'book-outline',
						color: color.dark.grey,
						style: _styles.buttonRow,
						onPress: () => {
							navigate.settings.fakeDatas()
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

const TracingButton: React.FC = () => {
	//const toggleTracing = Settings.useToggleTracing()
	const settings = null /*Settings.useSettings()*/
	if (!settings || settings.nodeConfig.type === 'external') {
		return null
	}
	return (
		<ButtonSetting
			name='Tracing'
			icon='activity-outline'
			iconSize={30}
			iconColor='grey'
			actionToggle={toggleTracing}
			varToggle={settings.nodeConfig.opts.tracing}
			toggled
		/>
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
	//const devShareInstanceBertyID = Messenger.useDevShareInstanceBertyID()
	const { goBack } = useNavigation()
	const [{ color }] = useStyles()
	return (
		<ButtonSetting
			name='Share ID on discord'
			icon='activity-outline'
			iconSize={30}
			iconColor={color.dark.grey}
			disabled
			onPress={() => {
				/*devShareInstanceBertyID()
				Vibration.vibrate(500)
				goBack()*/
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

const DumpContactStore: React.FC = () => {
	const text =
		'' /*useSelector((state: messenger.contact.GlobalState) =>
		JSON.stringify(state.messenger.contact, null, 2),
	)*/
	return <DumpButton name='Dump contact store' text={text} />
}

const DumpConversationStore: React.FC = () => {
	const conversationStoreText =
		'' /*useSelector((state: messenger.conversation.GlobalState) =>
		JSON.stringify(state.messenger.conversation, null, 2),
	)*/
	return <DumpButton name='Dump conversation store' text={conversationStoreText} />
}

const DumpGroupsStore: React.FC = () => {
	const conversationStoreText =
		'' /*useSelector((state: groups.GlobalState) =>
		JSON.stringify(state.groups, null, 2),
	)*/
	return <DumpButton name='Dump groups store' text={conversationStoreText} />
}

const BodyDevTools: React.FC<{}> = () => {
	const _styles = useStylesDevTools()
	const [{ padding, flex, margin, color, text }] = useStyles()
	const { navigate } = useNavigation()
	const sendToAll = () => {} /*Messenger.useMessageSendToAll()*/
	return (
		<View style={[padding.medium, flex.tiny, margin.bottom.small]}>
			<ButtonSetting
				name='System info'
				icon='info-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				onPress={navigate.settings.systemInfo}
			/>
			<TracingButton />
			<DiscordShareButton />
			<NativeCallButton />
			<DumpContactStore />
			<DumpConversationStore />
			<DumpGroupsStore />
			<ButtonSetting
				name={'Stop node'}
				icon='activity-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				onPress={() => GoBridge.stopProtocol()}
			/>
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
				name='Network'
				icon='activity-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				actionIcon='arrow-ios-forward'
				onPress={navigate.settings.network}
			/>
			<ButtonSetting
				name='Notifications'
				icon='bell-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				actionIcon='arrow-ios-forward'
				disabled
			/>
			<ButtonSetting
				name='Send messages to all contacts'
				icon='paper-plane-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				onPress={() => {
					sendToAll()
					Vibration.vibrate(500)
				}}
			/>
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
			<ScrollView bounces={false} contentContainerStyle={padding.bottom.scale(90)}>
				<HeaderSettings title='Dev tools' bgColor={color.dark.grey} undo={goBack}>
					<HeaderDevTools />
				</HeaderSettings>
				<BodyDevTools />
			</ScrollView>
		</Layout>
	)
}
