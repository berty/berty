import React, { useState } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { useStyles } from '@berty-tech/styles'
import { HeaderInfoSettings, HeaderSettings } from '../shared-components/Header'
import { ButtonSetting } from '../shared-components/SettingsButtons'
import { ScreenProps, useNavigation } from '@berty-tech/berty-navigation'

//
// Bluetooth
//

// Types
type BluetoothProps = {
	isBluetooth: boolean
}

// Styles
const useStylesBluetooth = () => {
	const [{ padding, text }] = useStyles()
	return {
		headerInfosTitleText: padding.small,
		headerInfosText: text.size.scale(11),
		headerInfosButtonText: text.size.medium,
	}
}

const _bluetoothStyles = StyleSheet.create({
	bodyNotAuthorize: {
		opacity: 0.3,
	},
})

const HeaderBluetooth: React.FC<BluetoothProps> = ({ isBluetooth }) => {
	const _styles = useStylesBluetooth()
	const [{ row, color, flex, margin, text, background, border, padding }] = useStyles()

	return (
		<View>
			{!isBluetooth && (
				<HeaderInfoSettings>
					<TouchableOpacity style={[row.right]}>
						<Icon name='close-outline' width={20} height={20} fill={color.light.blue} />
					</TouchableOpacity>
					<View style={[row.center, flex.tiny, { alignItems: 'center', justifyContent: 'center' }]}>
						<Icon name='alert-circle' width={25} height={25} fill={color.red} />
						<Text
							category='h6'
							style={[text.color.white, text.bold.medium, _styles.headerInfosTitleText]}
						>
							Authorize bluetooth
						</Text>
					</View>
					<View style={[row.center, margin.top.medium, margin.horizontal.medium]}>
						<Text
							style={[
								text.bold.medium,
								text.align.center,
								text.color.white,
								row.center,
								_styles.headerInfosText,
							]}
						>
							To use this feature you need to authorize the Berty app to use Bluetooth on your phone
						</Text>
					</View>
					<TouchableOpacity
						style={[
							background.blue,
							border.radius.medium,
							margin.horizontal.medium,
							margin.top.medium,
						]}
					>
						<View
							style={[
								margin.vertical.medium,
								row.center,
								{ alignItems: 'center' },
								{ justifyContent: 'center' },
							]}
						>
							<Icon name='bluetooth-outline' width={20} height={20} fill={color.white} />
							<Text
								style={[
									text.bold.medium,
									text.color.white,
									padding.left.small,
									_styles.headerInfosButtonText,
								]}
							>
								Authorize Bluetooth
							</Text>
						</View>
					</TouchableOpacity>
				</HeaderInfoSettings>
			)}
		</View>
	)
}

const BodyBluetooth: React.FC<BluetoothProps> = ({ isBluetooth }) => {
	const [{ flex, padding, margin, color }] = useStyles()
	return (
		<View
			style={[
				flex.tiny,
				padding.medium,
				margin.bottom.medium,
				!isBluetooth ? _bluetoothStyles.bodyNotAuthorize : null,
			]}
		>
			<ButtonSetting
				name='Activate Bluetooth'
				icon='bluetooth-outline'
				iconSize={30}
				iconColor={color.blue}
				toggled
				disabled
			/>
		</View>
	)
}

export const Bluetooth: React.FC<ScreenProps.Settings.Bluetooth> = () => {
	const [isBluetooth, setIsBluetooth] = useState(true)
	const { goBack } = useNavigation()
	const [{ flex, background }] = useStyles()
	return (
		<Layout style={[flex.tiny, background.white]}>
			<ScrollView>
				<HeaderSettings
					title='Bluetooth'
					desc="Bluetooth allows you to use the Berty app when you don't have a network connection (wifi or data) by connecting
					your phone directly with peers nearby"
					undo={goBack}
				>
					<HeaderBluetooth isBluetooth={isBluetooth} />
				</HeaderSettings>
				<BodyBluetooth isBluetooth={isBluetooth} />
			</ScrollView>
		</Layout>
	)
}
