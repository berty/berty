import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Layout } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'
import { ScreenProps, useNavigation } from '@berty-tech/berty-navigation'
import { Chat } from '@berty-tech/hooks'

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

const BodyDevTools: React.FC<{}> = () => {
	const _styles = useStylesDevTools()
	const [{ padding, flex, margin, color, text }] = useStyles()
	return (
		<View style={[padding.medium, flex.tiny, margin.bottom.small]}>
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
				disabled
			/>
			<ButtonSetting
				name='Notifications'
				icon='bell-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				actionIcon='arrow-ios-forward'
				disabled
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
			<ScrollView contentContainerStyle={padding.bottom.scale(90)}>
				<HeaderSettings title='Dev tools' bgColor={color.dark.grey} undo={goBack}>
					<HeaderDevTools />
				</HeaderSettings>
				<BodyDevTools />
			</ScrollView>
		</Layout>
	)
}
