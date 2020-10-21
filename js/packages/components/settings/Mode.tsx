import React, { useState } from 'react'
import { View, ScrollView, Vibration } from 'react-native'
import { Layout, Text } from '@ui-kitten/components'
import { useStyles } from '@berty-tech/styles'
import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting, ButtonSettingItem } from '../shared-components/SettingsButtons'
import { useNavigation } from '@berty-tech/navigation'
import { useNavigation as useReactNavigation } from '@react-navigation/native'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'

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
		buttonListUnderStateText: [text.bold.small, text.size.tiny, margin.right.scale(60)],
		buttonSettingText: [text.bold.small, text.size.small, { color: 'rgba(43,46,77,0.8)' }], // TODO: Fix horizontal alignment
	}
}

const BodyMode: React.FC<BodyModeProps> = ({ isMode }) => {
	const _styles = useStylesMode()
	const [{ flex, padding, margin, color, text, column }, { scaleSize }] = useStyles()
	const navigation = useReactNavigation()

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
						column.item.right,
						_styles.buttonListUnderStateText,
						isMode ? text.color.blue : text.color.red,
						margin.bottom.small,
					]}
				>
					Easy to use - All the features
				</Text>
				<View style={[padding.right.small]}>
					<ButtonSettingItem
						value='Receive push notifications'
						// color='rgba(43,46,77,0.8)'
						icon={isMode ? 'checkmark-circle-2' : 'close-circle'}
						iconColor={isMode ? color.blue : color.red}
						disabled
						styleText={[text.color.grey]}
						styleContainer={[margin.bottom.tiny]}
					/>
					<ButtonSettingItem
						value='Receive contact requests'
						color='rgba(43,46,77,0.8)'
						icon={isMode ? 'checkmark-circle-2' : 'close-circle'}
						iconColor={isMode ? color.blue : color.red}
						disabled
						styleText={[text.color.grey]}
						styleContainer={[margin.bottom.tiny]}
					/>
					<ButtonSettingItem
						value='Local peer discovery (BLE & Multicast DNS)'
						color='rgba(43,46,77,0.8)'
						icon={isMode ? 'checkmark-circle-2' : 'close-circle'}
						iconColor={isMode ? color.blue : color.red}
						disabled
						styleText={[text.color.grey]}
						styleContainer={[margin.bottom.tiny]}
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
				icon='upload'
				iconColor={color.blue}
				iconSize={30}
				toggled
				disabled
			>
				<Text
					style={[
						_styles.buttonSettingText,
						text.color.grey,
						{ marginLeft: margin.left.big.marginLeft + 3 * scaleSize },
					]}
				>
					Local Peer discovery
				</Text>
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
				iconColor={'red'}
				actionIcon='arrow-ios-forward'
				onPress={() => {
					Vibration.vibrate([1000, 250, 1000])
					navigation.navigate('Modals', {
						screen: 'DeleteAccount',
					})
				}}
			/>
		</View>
	)
}

export const Mode: React.FC<{}> = () => {
	const [isMode] = useState(true)
	const { goBack } = useNavigation()
	const [{ flex, background, padding }] = useStyles()
	return (
		<Layout style={[flex.tiny, background.white]}>
			<SwipeNavRecognizer>
				<ScrollView bounces={false} contentContainerStyle={[padding.bottom.scale(90)]}>
					<HeaderSettings
						title='Settings'
						desc='Customize everything to get the app that fits your needs'
						undo={goBack}
					/>
					<BodyMode isMode={isMode} />
				</ScrollView>
			</SwipeNavRecognizer>
		</Layout>
	)
}
