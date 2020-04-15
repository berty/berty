import React, { useState } from 'react'
import { View, ScrollView, StyleSheet } from 'react-native'
import { Layout, Text } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting, ButtonSettingItem } from '../shared-components/SettingsButtons'
import { useNavigation } from '@berty-tech/berty-navigation'
import { Chat } from '@berty-tech/hooks'

//
// Mode
//

// Types
type BodyModeProps = {
	isMode: boolean
}

// Styles
const useStylesMode = () => {
	const [{ text, margin }] = useStyles()
	return {
		buttonListUnderStateText: [text.size.scale(8), margin.right.scale(60)],
	}
}
const _modeStyles = StyleSheet.create({
	buttonSettingText: {
		fontSize: 9,
		color: 'rgba(43,46,77,0.8)',
		marginLeft: 39,
	},
})

const BodyMode: React.FC<BodyModeProps> = ({ isMode }) => {
	const _styles = useStylesMode()
	const [{ flex, padding, margin, color, text, row }] = useStyles()
	const navigation = useNavigation()
	const account = Chat.useAccount()
	const deleteAccount = Chat.useAccountDelete()
	return (
		<View style={[flex.tiny, padding.medium, margin.bottom.medium]}>
			<ButtonSetting
				name='App mode'
				icon='options-outline'
				iconSize={30}
				iconColor={color.blue}
				actionIcon='arrow-ios-forward'
				state={{
					value: isMode ? 'Performance' : 'Privacy',
					color: color.white,
					bgColor: isMode ? color.blue : color.red,
					stateIcon: isMode ? 'flash-outline' : 'lock-outline',
					stateIconColor: color.white,
				}}
				disabled
			>
				<Text
					style={[
						text.bold.medium,
						row.item.bottom,
						_styles.buttonListUnderStateText,
						isMode ? text.color.blue : text.color.red,
					]}
				>
					Easy to use - All the features
				</Text>
				<View style={[padding.right.small]}>
					<ButtonSettingItem
						value='Receive push notifications'
						color='rgba(43,46,77,0.8)'
						icon={isMode ? 'checkmark-circle-2' : 'close-circle'}
						iconColor={isMode ? color.blue : color.red}
						disabled
					/>
					<ButtonSettingItem
						value='Receive contact requests'
						color='rgba(43,46,77,0.8)'
						icon={isMode ? 'checkmark-circle-2' : 'close-circle'}
						iconColor={isMode ? color.blue : color.red}
						disabled
					/>
					<ButtonSettingItem
						value='Local peer discovery (BLE & Multicast DNS)'
						color='rgba(43,46,77,0.8)'
						icon={isMode ? 'checkmark-circle-2' : 'close-circle'}
						iconColor={isMode ? color.blue : color.red}
						disabled
					/>
				</View>
			</ButtonSetting>
			<ButtonSetting
				name='Notifications'
				icon='bell-outline'
				iconColor={color.blue}
				iconSize={30}
				state={
					isMode
						? {
								value: 'Enabled',
								color: color.green,
								bgColor: color.light.green,
						  }
						: { value: 'Disabled', color: color.red, bgColor: color.light.red }
				}
				actionIcon='arrow-ios-forward'
				disabled
			/>
			<ButtonSetting
				name='Bluetooth'
				icon='bluetooth-outline'
				iconColor={color.blue}
				iconSize={30}
				state={
					isMode
						? {
								value: 'Enabled',
								color: color.green,
								bgColor: color.light.green,
						  }
						: {
								value: 'Disabled',
								color: color.red,
								bgColor: color.light.red,
						  }
				}
				actionIcon='arrow-ios-forward'
				disabled
			/>
			<ButtonSetting
				name='Receive contact requests'
				icon='person-done-outline'
				iconColor={color.blue}
				iconSize={30}
				toggled
				disabled
			/>
			<ButtonSetting
				name='Multicast DNS'
				icon='share-outline'
				iconColor={color.blue}
				iconSize={30}
				toggled
				disabled
			>
				<Text style={[text.bold.medium, _modeStyles.buttonSettingText]}>Local Peer discovery</Text>
			</ButtonSetting>
			<ButtonSetting
				name='Blocked contacts'
				icon='person-delete-outline'
				iconSize={30}
				iconColor={color.blue}
				state={{
					value: '3 blocked',
					color: color.blue,
					bgColor: color.light.blue,
				}}
				actionIcon='arrow-ios-forward'
				disabled
			/>
			<ButtonSetting
				name='Delete my account'
				icon='trash-2-outline'
				iconSize={30}
				iconColor={color.red}
				actionIcon='arrow-ios-forward'
				onPress={() => {
					account != null && deleteAccount({ id: account.id })
					navigation.navigate.onboarding.getStarted()
				}}
			/>
		</View>
	)
}

export const Mode: React.FC<{}> = () => {
	const [isMode, setIsMode] = useState(true)
	const { goBack } = useNavigation()
	const [{ flex, background, padding }] = useStyles()
	return (
		<Layout style={[flex.tiny, background.white]}>
			<ScrollView contentContainerStyle={[padding.bottom.scale(90)]}>
				<HeaderSettings
					title='Settings'
					desc='Customize everything to get the app that fits your needs'
					undo={goBack}
				/>
				<BodyMode isMode={isMode} />
			</ScrollView>
		</Layout>
	)
}
