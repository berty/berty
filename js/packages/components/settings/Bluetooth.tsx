import React, { useState } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet, Linking, Platform } from 'react-native'
import { Layout, Text, Icon } from '@ui-kitten/components'
import { Translation } from 'react-i18next'
import { useStyles } from '@berty-tech/styles'
import { useMsgrContext } from '@berty-tech/store/hooks'
import { HeaderInfoSettings, HeaderSettings } from '../shared-components/Header'
import { ButtonSetting } from '../shared-components/SettingsButtons'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import { PersistentOptionsKeys } from '@berty-tech/store/context'
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions'

//
// Bluetooth
//

// Types
type BluetoothProps = {
	isBluetooth: boolean
	setIsBluetooth: React.Dispatch<React.SetStateAction<boolean>>
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

const checkBluetoothPermission = async (): Promise<boolean> => {
	let permission =
		Platform.OS === 'ios'
			? PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL
			: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
	try {
		let result = await check(permission)
		switch (result) {
			case RESULTS.UNAVAILABLE:
				console.log('Bluetooth is not available (on this device / in this context)')
				break
			case RESULTS.DENIED:
				console.log('The Bluetooth permission has not been requested / is denied but requestable')
				break
			case RESULTS.LIMITED:
				console.log('The Bluetooth permission is limited: some actions are possible')
				break
			case RESULTS.GRANTED:
				console.log('The Bluetooth permission is granted')
				return true
			case RESULTS.BLOCKED:
				console.log('The Bluetooth permission is denied and not requestable anymore')
				break
		}
	} catch (error) {
		console.log('The Bluetooth permission check failed: ', error)
	}
	return false
}

export const requestBluetoothPermission = async (): Promise<boolean> => {
	let permission =
		Platform.OS === 'ios'
			? PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL
			: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
	try {
		let result = await request(permission)
		switch (result) {
			case RESULTS.UNAVAILABLE:
				console.log('Bluetooth is not available (on this device / in this context)')
				break
			case RESULTS.DENIED:
				console.log('The Bluetooth permission has not been requested / is denied but requestable')
				break
			case RESULTS.LIMITED:
				console.log('The Bluetooth permission is limited: some actions are possible')
				break
			case RESULTS.GRANTED:
				console.log('The Bluetooth permission is granted')
				return true
			case RESULTS.BLOCKED:
				console.log('The Bluetooth permission is denied and not requestable anymore')
				break
		}
	} catch (error) {
		console.log('The Bluetooth permission request failed: ', error)
	}
	return false
}

const HeaderBluetooth: React.FC<BluetoothProps> = ({ isBluetooth, setIsBluetooth }) => {
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
						onPress={() =>
							requestBluetoothPermission().then((hasPermission) => setIsBluetooth(hasPermission))
						}
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
					<TouchableOpacity
						style={[
							background.blue,
							border.radius.medium,
							margin.horizontal.medium,
							margin.top.medium,
						]}
						onPress={() => Linking.openSettings()}
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
								App settings
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
	const ctx = useMsgrContext()
	const [bleEnabled, setBleEnabled] = useState(ctx.persistentOptions?.ble.enable)
	const [mcEnabled, setMcEnabled] = useState(ctx.persistentOptions?.mc.enable)
	const [nearbyEnabled, setNearbyEnabled] = useState(ctx.persistentOptions?.nearby.enable)

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<View
					style={[
						flex.tiny,
						padding.medium,
						margin.bottom.medium,
						!isBluetooth ? _bluetoothStyles.bodyNotAuthorize : null,
					]}
				>
					<ButtonSetting
						name={t('settings.bluetooth.activate-button')}
						icon='bluetooth-outline'
						iconSize={30}
						iconColor={color.blue}
						toggled
						disabled={!isBluetooth ? true : false}
						varToggle={bleEnabled}
						actionToggle={async () => {
							setBleEnabled(!ctx.persistentOptions?.ble.enable)
							await ctx.setPersistentOption({
								type: PersistentOptionsKeys.BLE,
								payload: {
									enable: !ctx.persistentOptions?.ble.enable,
								},
							})
						}}
					/>

					<ButtonSetting
						name={t('settings.mc.activate-button')}
						icon='wifi-outline'
						iconSize={30}
						iconColor={color.blue}
						toggled
						disabled={Platform.OS === 'android' || !isBluetooth ? true : false}
						varToggle={Platform.OS === 'ios' && mcEnabled}
						actionToggle={async () => {
							setMcEnabled(!ctx.persistentOptions?.mc.enable)
							await ctx.setPersistentOption({
								type: PersistentOptionsKeys.MC,
								payload: {
									enable: !ctx.persistentOptions?.mc.enable,
								},
							})
						}}
					/>

					<ButtonSetting
						name={t('settings.nearby.activate-button')}
						icon='wifi-outline'
						iconSize={30}
						iconColor={color.blue}
						toggled
						disabled={Platform.OS === 'ios' || !isBluetooth ? true : false}
						varToggle={Platform.OS === 'android' && nearbyEnabled}
						actionToggle={async () => {
							setNearbyEnabled(!ctx.persistentOptions?.nearby.enable)
							await ctx.setPersistentOption({
								type: PersistentOptionsKeys.Nearby,
								payload: {
									enable: !ctx.persistentOptions?.nearby.enable,
								},
							})
						}}
					/>
				</View>
			)}
		</Translation>
	)
}

export const Bluetooth: React.FC<ScreenProps.Settings.Bluetooth> = () => {
	const [isBluetooth, setIsBluetooth] = useState(false)
	const { goBack } = useNavigation()
	const [{ flex, background }] = useStyles()
	const ctx = useMsgrContext()

	checkBluetoothPermission()
		.then((result) => {
			setIsBluetooth(result)
		})
		.catch((err) => {
			console.log('The Bluetooth permission cannot be retrieved:', err)
		})

	React.useEffect(() => {
		if (!isBluetooth) {
			ctx.setPersistentOption({
				type: PersistentOptionsKeys.BLE,
				payload: {
					enable: false,
				},
			})

			ctx.setPersistentOption({
				type: PersistentOptionsKeys.MC,
				payload: {
					enable: false,
				},
			})
		}
	}, [isBluetooth]) // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<Layout style={[flex.tiny, background.white]}>
					<SwipeNavRecognizer>
						<ScrollView bounces={false}>
							<HeaderSettings
								title={t('settings.bluetooth.title')}
								desc={t('settings.bluetooth.desc')}
								undo={goBack}
							>
								<HeaderBluetooth isBluetooth={isBluetooth} setIsBluetooth={setIsBluetooth} />
							</HeaderSettings>
							<BodyBluetooth isBluetooth={isBluetooth} setIsBluetooth={setIsBluetooth} />
						</ScrollView>
					</SwipeNavRecognizer>
				</Layout>
			)}
		</Translation>
	)
}
