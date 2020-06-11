import React from 'react'
import { View, ScrollView } from 'react-native'
import { Layout } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'
import { ScreenProps, useNavigation } from '@berty-tech/berty-navigation'
import { Settings, Chat } from '@berty-tech/hooks'

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
						name: 'List events',
						icon: 'list-outline',
						color: color.dark.grey,
						style: _styles.buttonRow,
						disabled: true,
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
	const toggleTracing = Settings.useToggleTracing()
	const settings = Settings.useSettings()
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

const DiscordShareButton: React.FC = () => {
	const devShareInstanceBertyID = Chat.useDevShareInstanceBertyID()
	const [{ color }] = useStyles()
	return (
		<ButtonSetting
			name='Share ID on discord'
			icon='activity-outline'
			iconSize={30}
			iconColor={color.dark.grey}
			onPress={devShareInstanceBertyID}
		/>
	)
}

const BodyDevTools: React.FC<{}> = () => {
	const _styles = useStylesDevTools()
	const [{ padding, flex, margin, color, text }] = useStyles()
	const { navigate } = useNavigation()
	const sendToAll = Chat.useMessageSendToAll()
	return (
		<View style={[padding.medium, flex.tiny, margin.bottom.small]}>
			<TracingButton />
			<DiscordShareButton />
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
					navigate.main.list()
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
						name: 'Generate fake datas',
						icon: 'book-outline',
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
