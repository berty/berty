import React, { useRef, useState, useEffect } from 'react'
import { Alert, AppState, View, ScrollView, Linking, Platform } from 'react-native'
import { Layout } from '@ui-kitten/components'
import { Translation, useTranslation } from 'react-i18next'
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions'

import { useStyles } from '@berty-tech/styles'
import { useMsgrContext, useThemeColor } from '@berty-tech/store/hooks'
import { PersistentOptionsKeys } from '@berty-tech/store/context'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'

import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting } from '../shared-components/SettingsButtons'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'

//
// Bluetooth
//

// Types
type BluetoothProps = {
	bluetoothPermissions: 'unavailable' | 'blocked' | 'denied' | 'granted' | 'limited'
	setBluetoothPermissions: React.Dispatch<
		React.SetStateAction<'unavailable' | 'blocked' | 'denied' | 'granted' | 'limited' | undefined>
	>
}

let toActivate: (
	permission: 'unavailable' | 'blocked' | 'denied' | 'granted' | 'limited' | undefined,
) => void = (_permission) => {}

export const requestBluetoothPermission = async (): Promise<
	'unavailable' | 'blocked' | 'denied' | 'granted' | 'limited'
> => {
	let permission =
		Platform.OS === 'ios'
			? PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL
			: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
	try {
		let result = await request(permission)
		switch (result) {
			case RESULTS.UNAVAILABLE:
				console.log('Bluetooth is not available (on this device / in this context)')
				return 'unavailable'
			case RESULTS.DENIED:
				console.log('The Bluetooth permission has not been requested / is denied but requestable')
				return 'denied'
			case RESULTS.LIMITED:
				console.log('The Bluetooth permission is limited: some actions are possible')
				return 'limited'
			case RESULTS.GRANTED:
				console.log('The Bluetooth permission is granted')
				return 'granted'
			case RESULTS.BLOCKED:
				console.log('The Bluetooth permission is denied and not requestable anymore')
				return 'blocked'
		}
	} catch (error) {
		console.log('The Bluetooth permission request failed: ', error)
	}
	return 'unavailable'
}

export const checkBluetoothPermission = async (): Promise<
	'unavailable' | 'blocked' | 'denied' | 'granted' | 'limited'
> => {
	let permission =
		Platform.OS === 'ios'
			? PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL
			: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
	try {
		let result = await check(permission)
		switch (result) {
			case RESULTS.UNAVAILABLE:
				console.log('Bluetooth is not available (on this device / in this context)')
				return 'unavailable'
			case RESULTS.DENIED:
				console.log('The Bluetooth permission has not been requested / is denied but requestable')
				return 'denied'
			case RESULTS.LIMITED:
				console.log('The Bluetooth permission is limited: some actions are possible')
				return 'limited'
			case RESULTS.GRANTED:
				console.log('The Bluetooth permission is granted')
				return 'granted'
			case RESULTS.BLOCKED:
				console.log('The Bluetooth permission is denied and not requestable anymore')
				return 'blocked'
		}
	} catch (error) {
		console.log('The Bluetooth permission check failed: ', error)
	}
	return 'unavailable'
}

export const permissionExplanation: (t: any, callback: () => void) => void = async (t, callback) =>
	new Promise((resolve) => {
		Alert.alert(
			t('settings.bluetooth.permission-title'),
			Platform.OS === 'ios'
				? t('settings.bluetooth.ios-permission-description')
				: t('settings.bluetooth.android-permission-description'),
			[
				{
					text: t('settings.bluetooth.tag-negative'),
					style: 'cancel',
					onPress: () => {
						resolve()
					},
				},
				{
					text: t('settings.bluetooth.tag-positive'),
					onPress: async () => {
						await callback()
						resolve()
					},
				},
			],
		)
	})

const BodyBluetooth: React.FC<BluetoothProps> = ({
	bluetoothPermissions,
	setBluetoothPermissions,
}) => {
	const [{ flex, padding, margin }] = useStyles()
	const colors = useThemeColor()
	const ctx = useMsgrContext()
	const { t }: { t: any } = useTranslation()

	const appState = useRef(AppState.currentState)

	useEffect(() => {
		const _handleAppStateChange = (nextAppState: any) => {
			if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
				checkBluetoothPermission()
					.then((result) => {
						setBluetoothPermissions(result)
						toActivate(result)
						toActivate = () => {}
					})
					.catch((err) => {
						console.log('Check bluetooth permission error:', err)
					})
			}

			appState.current = nextAppState
		}

		AppState.addEventListener('change', _handleAppStateChange)

		return () => {
			AppState.removeEventListener('change', _handleAppStateChange)
		}
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	const actionToggle: (contextKey: any, contextValue: any) => void = async (
		contextKey,
		contextValue,
	) => {
		if (bluetoothPermissions === 'granted') {
			await ctx.setPersistentOption({
				type: contextKey,
				payload: {
					enable: !contextValue,
				},
			})
		} else if (bluetoothPermissions !== 'blocked') {
			// permissions can be requested
			permissionExplanation(t, () => {
				requestBluetoothPermission().then(async (permission) => {
					setBluetoothPermissions(permission)
					await ctx.setPersistentOption({
						type: contextKey,
						payload: {
							enable: permission === 'granted' && !contextValue,
						},
					})
				})
			})
		} else {
			// permissions cannot be requested and must be set manually by the user
			permissionExplanation(t, () => {
				toActivate = async (permission) => {
					await ctx.setPersistentOption({
						type: contextKey,
						payload: {
							enable: permission === 'granted' && !contextValue,
						},
					})
				}
				Linking.openSettings()
			})
		}
	}

	return (
		<View style={[flex.tiny, padding.medium, margin.bottom.medium]}>
			<ButtonSetting
				name={t('settings.bluetooth.activate-button')}
				icon='bluetooth-outline'
				iconSize={30}
				iconColor={colors['background-header']}
				toggled
				varToggle={ctx.persistentOptions?.ble.enable}
				actionToggle={() =>
					actionToggle(PersistentOptionsKeys.BLE, ctx.persistentOptions?.ble.enable)
				}
			/>
			{Platform.OS === 'ios' && (
				<ButtonSetting
					name={t('settings.mc.activate-button')}
					icon='wifi-outline'
					iconSize={30}
					iconColor={colors['background-header']}
					toggled
					varToggle={ctx.persistentOptions?.mc.enable}
					actionToggle={() => {
						actionToggle(PersistentOptionsKeys.MC, ctx.persistentOptions?.mc.enable)
					}}
				/>
			)}
			{Platform.OS === 'android' && (
				<ButtonSetting
					name={t('settings.nearby.activate-button')}
					icon='wifi-outline'
					iconSize={30}
					iconColor={colors['background-header']}
					toggled
					varToggle={ctx.persistentOptions?.nearby.enable}
					actionToggle={() => {
						actionToggle(PersistentOptionsKeys.Nearby, ctx.persistentOptions?.nearby.enable)
					}}
				/>
			)}
		</View>
	)
}

export const Bluetooth: React.FC<ScreenProps.Settings.Bluetooth> = () => {
	const [bluetoothPermissions, setBluetoothPermissions] = useState<
		'unavailable' | 'blocked' | 'denied' | 'granted' | 'limited' | undefined
	>()
	const { goBack } = useNavigation()
	const colors = useThemeColor()
	const ctx = useMsgrContext()

	// get Bluetooth permissions state
	React.useEffect(() => {
		console.log('useEffect called')

		checkBluetoothPermission()
			.then((result) => {
				if (bluetoothPermissions !== result) {
					console.log('useEffect: permissions changed')
					setBluetoothPermissions(result)
				}
			})
			.catch((err) => {
				console.log('The Bluetooth permission cannot be retrieved:', err)
			})
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	// disable drivers if permissions are not granted
	React.useEffect(() => {
		const disableDrivers = async () => {
			if (bluetoothPermissions !== 'granted' && bluetoothPermissions !== undefined) {
				console.log('in useEffect: permissions not granted')
				await ctx.setPersistentOption({
					type: PersistentOptionsKeys.BLE,
					payload: {
						enable: false,
					},
				})

				await ctx.setPersistentOption({
					type: PersistentOptionsKeys.MC,
					payload: {
						enable: false,
					},
				})

				await ctx.setPersistentOption({
					type: PersistentOptionsKeys.Nearby,
					payload: {
						enable: false,
					},
				})
			}
		}

		disableDrivers()
	}, [bluetoothPermissions]) // eslint-disable-line react-hooks/exhaustive-deps

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<Layout style={{ flex: 1, backgroundColor: colors['main-background'] }}>
					<SwipeNavRecognizer>
						<ScrollView bounces={false}>
							<HeaderSettings
								title={t('settings.bluetooth.title')}
								desc={t('settings.bluetooth.desc')}
								undo={goBack}
							/>
							{bluetoothPermissions !== undefined && (
								<BodyBluetooth
									bluetoothPermissions={bluetoothPermissions}
									setBluetoothPermissions={setBluetoothPermissions}
								/>
							)}
						</ScrollView>
					</SwipeNavRecognizer>
				</Layout>
			)}
		</Translation>
	)
}
