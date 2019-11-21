import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Layout } from 'react-native-ui-kitten'
import { colors, styles } from '../styles'
import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'

//
// DevTools
//

// Styles
const _devToolsStyles = StyleSheet.create({
	buttonRow: {
		marginRight: 20,
		height: 90,
	},
	lastButtonRow: {
		height: 90,
	},
	buttonRowMarginTop: {
		marginTop: 20,
	},
})

const HeaderDevTools: React.FC<{}> = () => (
	<View>
		<ButtonSettingRow
			state={[
				{
					name: 'Device infos',
					icon: 'smartphone-outline',
					color: colors.darkGray,
					style: _devToolsStyles.buttonRow,
				},
				{
					name: 'List events',
					icon: 'list-outline',
					color: colors.darkGray,
					style: _devToolsStyles.buttonRow,
				},
				{
					name: 'Restart daemon',
					icon: 'repeat-outline',
					color: colors.blue,
					style: _devToolsStyles.lastButtonRow,
				},
			]}
			numberOfLines={2}
			style={[_devToolsStyles.buttonRowMarginTop]}
			styleText={[styles.textBold]}
		/>
	</View>
)

const BodyDevTools: React.FC<{}> = () => (
	<View style={[styles.padding, styles.flex, styles.littleMarginBottom]}>
		<ButtonSetting
			name='Bot mode'
			icon='briefcase-outline'
			iconSize={30}
			iconColor={colors.green}
			toggled={true}
		/>
		<ButtonSetting
			name='local gRPC'
			icon='hard-drive-outline'
			iconSize={30}
			iconColor={colors.darkGray}
			toggled={true}
		/>
		<ButtonSetting
			name='Console logs'
			icon='folder-outline'
			iconSize={30}
			iconColor={colors.darkGray}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Network'
			icon='activity-outline'
			iconSize={30}
			iconColor={colors.darkGray}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Notifications'
			icon='bell-outline'
			iconSize={30}
			iconColor={colors.darkGray}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSettingRow
			state={[
				{
					name: 'Device infos',
					icon: 'smartphone-outline',
					color: colors.darkGray,
					style: _devToolsStyles.buttonRow,
				},
				{
					name: 'Generate fake datas',
					icon: 'book-outline',
					color: colors.darkGray,
					style: _devToolsStyles.buttonRow,
				},
				{
					name: 'Restart daemon',
					icon: 'repeat-outline',
					color: colors.red,
					style: _devToolsStyles.lastButtonRow,
				},
			]}
			numberOfLines={2}
			style={[_devToolsStyles.buttonRowMarginTop]}
			styleText={[styles.textBold]}
		/>
	</View>
)

export const DevTools: React.FC<{}> = () => (
	<Layout style={[styles.bgWhite, styles.flex]}>
		<ScrollView>
			<HeaderSettings title='Dev tools' bgColor={colors.darkGray}>
				<HeaderDevTools />
			</HeaderSettings>
			<BodyDevTools />
		</ScrollView>
	</Layout>
)
