import React, { useRef, useState, useEffect } from 'react'
import { Alert, AppState, View, ScrollView, Linking, Platform } from 'react-native'
import { Layout } from '@ui-kitten/components'
import { Translation, useTranslation } from 'react-i18next'
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions'
import { withInAppNotification } from 'react-native-in-app-notification'

import { useStyles } from '@berty-tech/styles'
import { useMsgrContext, useThemeColor } from '@berty-tech/store/hooks'
import { accountService } from '@berty-tech/store/context'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import beapi from '@berty-tech/api'

import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting } from '../shared-components/SettingsButtons'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import { showNeedRestartNotification } from '../helpers'

//
// Bluetooth
//

enum EnumChangedKey {
	BluetoothLE,
	AndroidNearby,
	AppleMultipeerConnectivity,
}

// Types
type BluetoothProps = {
	bluetoothPermissions: 'unavailable' | 'blocked' | 'denied' | 'granted' | 'limited'
	setBluetoothPermissions: React.Dispatch<
		React.SetStateAction<'unavailable' | 'blocked' | 'denied' | 'granted' | 'limited' | undefined>
	>
}

let toActivate: (
	permission: 'unavailable' | 'blocked' | 'denied' | 'granted' | 'limited' | undefined,
) => void = _permission => {}

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
	new Promise(resolve => {
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

const BodyBluetooth: React.FC<BluetoothProps> = withInAppNotification(
	({ showNotification, bluetoothPermissions, setBluetoothPermissions }: any) => {
		const [{ flex, padding, margin }] = useStyles()
		const colors = useThemeColor()
		const ctx = useMsgrContext()
		const { t }: { t: any } = useTranslation()

		const appState = useRef(AppState.currentState)

		useEffect(() => {
			const _handleAppStateChange = (nextAppState: any) => {
				if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
					checkBluetoothPermission()
						.then(result => {
							setBluetoothPermissions(result)
							toActivate(result)
							toActivate = () => {}
						})
						.catch(err => {
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

		const actionToggle: (
			changedKey: EnumChangedKey,
			currentValue: beapi.account.NetworkConfig.Flag,
		) => void = async (
			changedKey: EnumChangedKey,
			currentValue: beapi.account.NetworkConfig.Flag,
		) => {
			const updateValue = async (bluetoothPermissions: BluetoothProps['bluetoothPermissions']) => {
				let newValue = beapi.account.NetworkConfig.Flag.Disabled

				if (
					bluetoothPermissions === 'granted' &&
					currentValue === beapi.account.NetworkConfig.Flag.Disabled
				) {
					newValue = beapi.account.NetworkConfig.Flag.Enabled
				}

				let newConfig = ctx.networkConfig

				switch (changedKey) {
					case EnumChangedKey.BluetoothLE:
						newConfig = { ...ctx.networkConfig, bluetoothLe: newValue }
						break

					case EnumChangedKey.AndroidNearby:
						newConfig = { ...ctx.networkConfig, androidNearby: newValue }
						break

					case EnumChangedKey.AppleMultipeerConnectivity:
						newConfig = { ...ctx.networkConfig, appleMultipeerConnectivity: newValue }
						break

					default:
						console.warn("couldn't map new value's key")
						return
				}

				await accountService.networkConfigSet({
					accountId: ctx.selectedAccount,
					config: newConfig,
				})
				ctx.setNetworkConfig(newConfig)
			}

			switch (bluetoothPermissions) {
				case 'granted':
					await updateValue(bluetoothPermissions)
					break

				case 'denied':
				case 'limited':
				case 'unavailable':
					console.log("case: not 'blocked'")
					// permissions can be requested
					permissionExplanation(t, () => {
						requestBluetoothPermission().then(async permission => {
							setBluetoothPermissions(permission)
							await updateValue(permission)
						})
					})
					break

				case 'blocked':
					permissionExplanation(t, () => {
						toActivate = async permission => {
							if (!permission) {
								return
							}

							await updateValue(permission)
						}
						Linking.openSettings()
					})
					break
			}

			showNeedRestartNotification(showNotification, ctx, t)
		}

		return (
			<View style={[flex.tiny, padding.medium, margin.bottom.medium]}>
				<ButtonSetting
					name={t('settings.bluetooth.activate-button')}
					icon='bluetooth-outline'
					iconSize={30}
					iconColor={colors['background-header']}
					toggled
					varToggle={ctx.networkConfig.bluetoothLe === beapi.account.NetworkConfig.Flag.Enabled}
					actionToggle={() =>
						actionToggle(
							EnumChangedKey.BluetoothLE,
							ctx.networkConfig.bluetoothLe || beapi.account.NetworkConfig.Flag.Disabled,
						)
					}
				/>
				{Platform.OS === 'ios' && (
					<ButtonSetting
						name={t('settings.mc.activate-button')}
						icon='wifi-outline'
						iconSize={30}
						iconColor={colors['background-header']}
						toggled
						varToggle={
							ctx.networkConfig.appleMultipeerConnectivity ===
							beapi.account.NetworkConfig.Flag.Enabled
						}
						actionToggle={() => {
							actionToggle(
								EnumChangedKey.AppleMultipeerConnectivity,
								ctx.networkConfig.appleMultipeerConnectivity ||
									beapi.account.NetworkConfig.Flag.Disabled,
							)
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
						varToggle={ctx.networkConfig.androidNearby === beapi.account.NetworkConfig.Flag.Enabled}
						actionToggle={() => {
							actionToggle(
								EnumChangedKey.AndroidNearby,
								ctx.networkConfig.androidNearby || beapi.account.NetworkConfig.Flag.Disabled,
							)
						}}
					/>
				)}
			</View>
		)
	},
)

export const Bluetooth: React.FC<ScreenProps.Settings.Bluetooth> = () => {
	const [bluetoothPermissions, setBluetoothPermissions] = useState<
		'unavailable' | 'blocked' | 'denied' | 'granted' | 'limited' | undefined
	>()
	const { goBack } = useNavigation()
	const { selectedAccount, setNetworkConfig } = useMsgrContext()
	const colors = useThemeColor()

	// get Bluetooth permissions state
	React.useEffect(() => {
		console.log('useEffect called')

		checkBluetoothPermission()
			.then(result => {
				if (bluetoothPermissions !== result) {
					console.log('useEffect: permissions changed')
					setBluetoothPermissions(result)
				}
			})
			.catch(err => {
				console.log('The Bluetooth permission cannot be retrieved:', err)
			})
	}, []) // eslint-disable-line react-hooks/exhaustive-deps

	// disable drivers if permissions are not granted
	React.useEffect(() => {
		const disableDrivers = async () => {
			if (bluetoothPermissions !== 'granted' && bluetoothPermissions !== undefined) {
				console.log('in useEffect: permissions not granted')
				const currentConfig = await accountService.networkConfigGet({
					accountId: selectedAccount,
				})

				let newConfig = {
					...currentConfig.currentConfig,
					bluetoothLe: beapi.account.NetworkConfig.Flag.Disabled,
					appleMultipeerConnectivity: beapi.account.NetworkConfig.Flag.Disabled,
					androidNearby: beapi.account.NetworkConfig.Flag.Disabled,
				}

				await accountService.networkConfigSet({
					accountId: selectedAccount,
					config: newConfig,
				})
				setNetworkConfig(newConfig)
			}
		}

		disableDrivers().catch(e => console.warn('error while disabling drivers', e))
	}, [bluetoothPermissions, setNetworkConfig, selectedAccount])

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
