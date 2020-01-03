import React from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { colors, styles } from '@berty-tech/styles'
import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'
import { useNavigation, ScreenProps } from '@berty-tech/berty-navigation'
//
// Help
//

// Styles
const _helpStyles = StyleSheet.create({
	headerButtonText: {
		paddingLeft: 33,
		color: 'rgba(43,46,77,0.8)',
		fontSize: 10,
		marginLeft: 6,
	},
	rowButtons: {
		paddingTop: 4,
	},
	firstRowButton: {
		marginRight: 10,
	},
	secondRowButton: {
		marginLeft: 10,
	},
})

const HeaderHelp: React.FC<{}> = () => (
	<View>
		<ButtonSetting
			name='Security & Privacy'
			icon='shield-outline'
			iconSize={30}
			iconColor={colors.red}
			actionIcon='arrow-ios-forward'
		>
			<Text style={[styles.textBold, _helpStyles.headerButtonText]}>
				Keep your data safe & your life private
			</Text>
		</ButtonSetting>
	</View>
)

const BodyHelp: React.FC<{}> = () => (
	<View style={[styles.padding]}>
		<ButtonSetting
			name='Account & Berty ID'
			icon='person-outline'
			iconSize={30}
			iconColor={colors.red}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Contacts & Requests'
			icon='person-add-outline'
			iconSize={30}
			iconColor={colors.red}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Messages'
			icon='paper-plane-outline'
			iconSize={30}
			iconColor={colors.red}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Groups'
			icon='people-outline'
			iconSize={30}
			iconColor={colors.red}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Settings'
			icon='settings-2-outline'
			iconSize={30}
			iconColor={colors.red}
			actionIcon='arrow-ios-forward'
		/>
		<View style={[_helpStyles.rowButtons]}>
			<ButtonSettingRow
				state={[
					{
						name: 'Ask a question',
						icon: 'question-mark-circle-outline',
						color: colors.red,
						style: _helpStyles.firstRowButton,
					},
					{
						name: 'Report a bug',
						icon: 'bulb-outline',
						color: colors.red,
						style: _helpStyles.secondRowButton,
					},
				]}
			/>
		</View>
	</View>
)

export const Help: React.FC<ScreenProps.Settings.Help> = () => {
	const { goBack } = useNavigation()
	return (
		<Layout style={[styles.bgWhite, styles.flex]}>
			<ScrollView>
				<HeaderSettings title='Help' bgColor={colors.red} undo={goBack}>
					<HeaderHelp />
				</HeaderSettings>
				<BodyHelp />
			</ScrollView>
		</Layout>
	)
}
