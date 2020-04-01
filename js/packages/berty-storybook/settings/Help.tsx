import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Layout, Text } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'
import { useNavigation, ScreenProps } from '@berty-tech/berty-navigation'
//
// Help
//

// Styles
const useStylesHelp = () => {
	const [{ padding, margin }] = useStyles()
	return {
		rowButtons: padding.top.tiny,
		firstRowButton: margin.right.small,
		secondRowButton: margin.left.small,
	}
}
const _helpStyles = StyleSheet.create({
	headerButtonText: {
		paddingLeft: 28,
		color: 'rgba(43,46,77,0.8)',
		fontSize: 10,
		marginLeft: 6,
	},
})

const HeaderHelp: React.FC<{}> = () => {
	const [{ color, text }] = useStyles()
	return (
		<View>
			<ButtonSetting
				name='Security & Privacy'
				icon='shield-outline'
				iconSize={30}
				iconColor={color.red}
				actionIcon='arrow-ios-forward'
				disabled={true}
			>
				<Text style={[text.bold.medium, _helpStyles.headerButtonText]}>
					Keep your data safe & your life private
				</Text>
			</ButtonSetting>
		</View>
	)
}

const BodyHelp: React.FC<{}> = () => {
	const _styles = useStylesHelp()
	const [{ padding, color }] = useStyles()
	return (
		<View style={padding.medium}>
			<ButtonSetting
				name='Account & Berty ID'
				icon='person-outline'
				iconSize={30}
				iconColor={color.red}
				actionIcon='arrow-ios-forward'
				disabled={true}
			/>
			<ButtonSetting
				name='Contacts & Requests'
				icon='person-add-outline'
				iconSize={30}
				iconColor={color.red}
				actionIcon='arrow-ios-forward'
				disabled={true}
			/>
			<ButtonSetting
				name='Messages'
				icon='paper-plane-outline'
				iconSize={30}
				iconColor={color.red}
				actionIcon='arrow-ios-forward'
				disabled={true}
			/>
			<ButtonSetting
				name='Groups'
				icon='people-outline'
				iconSize={30}
				iconColor={color.red}
				actionIcon='arrow-ios-forward'
				disabled={true}
			/>
			<ButtonSetting
				name='Settings'
				icon='settings-2-outline'
				iconSize={30}
				iconColor={color.red}
				actionIcon='arrow-ios-forward'
				disabled={true}
			/>
			<View style={[_styles.rowButtons]}>
				<ButtonSettingRow
					state={[
						{
							name: 'Ask a question',
							icon: 'question-mark-circle-outline',
							color: color.red,
							style: _styles.firstRowButton,
							disabled: true,
						},
						{
							name: 'Report a bug',
							icon: 'bulb-outline',
							color: color.red,
							style: _styles.secondRowButton,
							disabled: true,
						},
					]}
				/>
			</View>
		</View>
	)
}

export const Help: React.FC<ScreenProps.Settings.Help> = () => {
	const { goBack } = useNavigation()
	const [{ background, flex, color, padding }] = useStyles()
	return (
		<Layout style={[background.white, flex.tiny]}>
			<ScrollView contentContainerStyle={[padding.bottom.scale(100)]}>
				<HeaderSettings title='Help' bgColor={color.red} undo={goBack}>
					<HeaderHelp />
				</HeaderSettings>
				<BodyHelp />
			</ScrollView>
		</Layout>
	)
}
