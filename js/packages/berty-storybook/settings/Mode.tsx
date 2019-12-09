import React, { useState } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Layout, Text } from 'react-native-ui-kitten'
import { colors, styles } from '@berty-tech/styles'
import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting, ButtonSettingItem } from '../shared-components/SettingsButtons'
import { useNavigation } from '@berty-tech/berty-navigation'

//
// Mode
//

// Types
type BodyModeProps = {
	isMode: boolean
}

// Styles
const _modeStyles = StyleSheet.create({
	buttonListUnderStateText: {
		fontSize: 8,
		marginRight: 60,
	},
	buttonSettingText: {
		fontSize: 9,
		color: 'rgba(43,46,77,0.8)',
		marginLeft: 39,
	},
})

const BodyMode: React.FC<BodyModeProps> = ({ isMode }) => (
	<View style={[styles.flex, styles.padding, styles.marginBottom]}>
		<ButtonSetting
			name='App mode'
			icon='options-outline'
			iconSize={30}
			iconColor={colors.blue}
			actionIcon='arrow-ios-forward'
			state={{
				value: isMode ? 'Performance' : 'Privacy',
				color: colors.white,
				bgColor: isMode ? colors.blue : colors.red,
				stateIcon: isMode ? 'flash-outline' : 'lock-outline',
				stateIconColor: colors.white,
			}}
		>
			<Text
				style={[
					styles.textBold,
					styles.end,
					_modeStyles.buttonListUnderStateText,
					isMode ? styles.textBlue : styles.textRed,
				]}
			>
				Easy to use - All the features
			</Text>
			<View style={[styles.littlePaddingRight]}>
				<ButtonSettingItem
					value='Receive push notifications'
					color='rgba(43,46,77,0.8)'
					icon={isMode ? 'checkmark-circle-2' : 'close-circle'}
					iconColor={isMode ? colors.blue : colors.red}
				/>
				<ButtonSettingItem
					value='Receive contact requests'
					color='rgba(43,46,77,0.8)'
					icon={isMode ? 'checkmark-circle-2' : 'close-circle'}
					iconColor={isMode ? colors.blue : colors.red}
				/>
				<ButtonSettingItem
					value='Local peer discovery (BLE & Multicast DNS)'
					color='rgba(43,46,77,0.8)'
					icon={isMode ? 'checkmark-circle-2' : 'close-circle'}
					iconColor={isMode ? colors.blue : colors.red}
				/>
			</View>
		</ButtonSetting>
		<ButtonSetting
			name='Notifications'
			icon='bell-outline'
			iconColor={colors.blue}
			iconSize={30}
			state={
				isMode
					? {
							value: 'Enabled',
							color: colors.green,
							bgColor: colors.lightGreen,
					  }
					: { value: 'Disabled', color: colors.red, bgColor: colors.lightRed }
			}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Bluetooth'
			icon='bluetooth-outline'
			iconColor={colors.blue}
			iconSize={30}
			state={
				isMode
					? {
							value: 'Enabled',
							color: colors.green,
							bgColor: colors.lightGreen,
					  }
					: {
							value: 'Disabled',
							color: colors.red,
							bgColor: colors.lightRed,
					  }
			}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Receive contact requests'
			icon='person-done-outline'
			iconColor={colors.blue}
			iconSize={30}
			toggled={true}
		/>
		<ButtonSetting
			name='Multicast DNS'
			icon='share-outline'
			iconColor={colors.blue}
			iconSize={30}
			toggled={true}
		>
			<Text style={[styles.textBold, _modeStyles.buttonSettingText]}>Local Peer discovery</Text>
		</ButtonSetting>
		<ButtonSetting
			name='Blocked contacts'
			icon='person-delete-outline'
			iconSize={30}
			iconColor={colors.blue}
			state={{
				value: '3 blocked',
				color: colors.blue,
				bgColor: colors.lightBlue,
			}}
			actionIcon='arrow-ios-forward'
		/>
		<ButtonSetting
			name='Delete my account'
			icon='trash-2-outline'
			iconSize={30}
			iconColor={colors.red}
			actionIcon='arrow-ios-forward'
		/>
	</View>
)

export const Mode: React.FC<{}> = () => {
	const [isMode, setIsMode] = useState(true)
	const { goBack } = useNavigation()
	return (
		<Layout style={[styles.flex, styles.bgWhite]}>
			<ScrollView>
				<HeaderSettings
					title='Settings'
					action={setIsMode}
					actionValue={isMode}
					desc='Customize everything to get the app that fits your needs'
					undo={goBack}
				/>
				<BodyMode isMode={isMode} />
			</ScrollView>
		</Layout>
	)
}
