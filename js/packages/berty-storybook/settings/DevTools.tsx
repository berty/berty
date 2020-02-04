import React from 'react'
import { View, ScrollView } from 'react-native'
import { Layout } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'
import { ScreenProps, useNavigation } from '@berty-tech/berty-navigation'

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
					},
					{
						name: 'List events',
						icon: 'list-outline',
						color: color.dark.grey,
						style: _styles.buttonRow,
					},
					{
						name: 'Restart daemon',
						icon: 'repeat-outline',
						color: color.blue,
						style: _styles.lastButtonRow,
					},
				]}
				numberOfLines={2}
				style={[_styles.buttonRowMarginTop]}
				styleText={[text.bold]}
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
				toggled={true}
			/>
			<ButtonSetting
				name='local gRPC'
				icon='hard-drive-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				toggled={true}
			/>
			<ButtonSetting
				name='Console logs'
				icon='folder-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				actionIcon='arrow-ios-forward'
			/>
			<ButtonSetting
				name='Network'
				icon='activity-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				actionIcon='arrow-ios-forward'
			/>
			<ButtonSetting
				name='Notifications'
				icon='bell-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				actionIcon='arrow-ios-forward'
			/>
			<ButtonSettingRow
				state={[
					{
						name: 'Device infos',
						icon: 'smartphone-outline',
						color: color.dark.grey,
						style: _styles.buttonRow,
					},
					{
						name: 'Generate fake datas',
						icon: 'book-outline',
						color: color.dark.grey,
						style: _styles.buttonRow,
					},
					{
						name: 'Restart daemon',
						icon: 'repeat-outline',
						color: color.red,
						style: _styles.lastButtonRow,
					},
				]}
				numberOfLines={2}
				style={[_styles.buttonRowMarginTop]}
				styleText={[text.bold]}
			/>
		</View>
	)
}

export const DevTools: React.FC<ScreenProps.Settings.DevTools> = () => {
	const { goBack } = useNavigation()
	const [{ background, flex, color }] = useStyles()
	return (
		<Layout style={[background.white, flex.tiny]}>
			<ScrollView>
				<HeaderSettings title='Dev tools' bgColor={color.dark.grey} undo={goBack}>
					<HeaderDevTools />
				</HeaderSettings>
				<BodyDevTools />
			</ScrollView>
		</Layout>
	)
}
