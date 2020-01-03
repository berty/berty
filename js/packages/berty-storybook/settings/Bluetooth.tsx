import React, { useState } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Layout, Text, Icon } from 'react-native-ui-kitten'
import { colors, styles } from '@berty-tech/styles'
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
const _bluetoothStyles = StyleSheet.create({
	headerInfosTitleText: {
		paddingLeft: 10,
	},
	headerInfosText: {
		fontSize: 11,
	},
	headerInfosButtonText: {
		fontSize: 15,
	},
	bodyNotAuthorize: {
		opacity: 0.3,
	},
})

const HeaderBluetooth: React.FC<BluetoothProps> = ({ isBluetooth }) => (
	<View>
		{!isBluetooth && (
			<HeaderInfoSettings>
				<TouchableOpacity style={[styles.end]}>
					<Icon name='close-outline' width={20} height={20} fill={colors.lightBlue} />
				</TouchableOpacity>
				<View style={[styles.center, styles.row, styles.flex, styles.alignVertical]}>
					<Icon name='alert-circle' width={25} height={25} fill={colors.red} />
					<Text
						category='h6'
						style={[styles.textWhite, styles.textBold, _bluetoothStyles.headerInfosTitleText]}
					>
						Authorize bluetooth
					</Text>
				</View>
				<View style={[styles.center, styles.marginTop, styles.marginLeft, styles.marginRight]}>
					<Text
						style={[
							styles.textBold,
							styles.textCenter,
							styles.textWhite,
							styles.center,
							_bluetoothStyles.headerInfosText,
						]}
					>
						To use this feature you need to authorize the Berty app to use Bluetooth on your phone
					</Text>
				</View>
				<TouchableOpacity
					style={[
						styles.bgBlue,
						styles.borderRadius,
						styles.marginTop,
						styles.marginLeft,
						styles.marginRight,
					]}
				>
					<View
						style={[
							styles.marginTop,
							styles.marginBottom,
							styles.row,
							styles.spaceCenter,
							styles.alignItems,
						]}
					>
						<Icon name='bluetooth-outline' width={20} height={20} fill={colors.white} />
						<Text
							style={[
								styles.textBold,
								styles.textWhite,
								styles.littlePaddingLeft,
								_bluetoothStyles.headerInfosButtonText,
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

const BodyBluetooth: React.FC<BluetoothProps> = ({ isBluetooth }) => (
	<View
		style={[
			styles.flex,
			styles.padding,
			styles.marginBottom,
			!isBluetooth ? _bluetoothStyles.bodyNotAuthorize : null,
		]}
	>
		<ButtonSetting
			name='Activate Bluetooth'
			icon='bluetooth-outline'
			iconSize={30}
			iconColor={colors.blue}
			toggled={true}
		/>
	</View>
)

export const Bluetooth: React.FC<ScreenProps.Settings.Bluetooth> = () => {
	const [isBluetooth, setIsBluetooth] = useState(false)
	const { goBack } = useNavigation()
	return (
		<Layout style={[styles.flex, styles.bgWhite]}>
			<ScrollView>
				<HeaderSettings
					title='Bluetooth'
					action={setIsBluetooth}
					actionValue={isBluetooth}
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
