import React, { useRef, useState, useEffect } from 'react'
import { AppState, View, ScrollView, Linking, Platform } from 'react-native'
import { Layout, Text } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import { withInAppNotification } from 'react-native-in-app-notification'

import { useStyles } from '@berty-tech/styles'
import { useMsgrContext, useThemeColor } from '@berty-tech/store/hooks'
import { accountService } from '@berty-tech/store/context'
import { ScreenProps } from '@berty-tech/navigation'
import beapi from '@berty-tech/api'

import { ButtonSetting } from '../shared-components/SettingsButtons'
import { showNeedRestartNotification } from '../helpers'
import { checkPermissions } from '@berty-tech/components/utils'
import { useNavigation } from '@react-navigation/native'

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

const BodyBluetooth: React.FC<BluetoothProps> = withInAppNotification(
	({ showNotification, bluetoothPermissions, setBluetoothPermissions }: any) => {
		const [{ flex, padding, margin }] = useStyles()
		const colors = useThemeColor()
		const ctx = useMsgrContext()
		const { t }: { t: any } = useTranslation()
		const { navigate } = useNavigation()

		const appState = useRef(AppState.currentState)

		useEffect(() => {
			const _handleAppStateChange = (nextAppState: any) => {
				if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
					checkPermissions('p2p', navigate, { isToNavigate: false })
						.then(result => {
							setBluetoothPermissions(result)
							toActivate(result)
							toActivate = () => {}
						})
						.catch(err => {
							console.log('The Bluetooth permission cannot be retrieved:', err)
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
				await ctx.setNetworkConfig(newConfig)
			}

			switch (bluetoothPermissions) {
				case 'granted':
					await updateValue(bluetoothPermissions)
					showNeedRestartNotification(showNotification, ctx, t)
					break
				case 'denied':
				case 'limited':
				case 'unavailable':
					console.log("case: not 'blocked'")
					// permissions can be requested
					await checkPermissions('p2p', navigate, {
						isToNavigate: true,
					})
					showNeedRestartNotification(showNotification, ctx, t)
					break
				case 'blocked':
					await checkPermissions('p2p', navigate, {
						isToNavigate: true,
					})
					await Linking.openSettings()
					showNeedRestartNotification(showNotification, ctx, t)
					break
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
	const { selectedAccount, setNetworkConfig } = useMsgrContext()
	const [{ padding, text }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const { t }: any = useTranslation()
	const { navigate } = useNavigation()

	// get Bluetooth permissions state
	React.useEffect(() => {
		console.log('useEffect called')

		checkPermissions('p2p', navigate, { isToNavigate: false })
			.then(result => {
				if (result && bluetoothPermissions !== result) {
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
		<Layout style={{ flex: 1, backgroundColor: colors['main-background'] }}>
			<ScrollView bounces={false}>
				<View style={[padding.medium, { backgroundColor: colors['background-header'] }]}>
					<Text
						style={[
							text.align.center,
							padding.horizontal.big,
							padding.top.small,
							{ fontSize: 10 * scaleSize, color: colors['reverted-main-text'] },
						]}
					>
						{t('settings.bluetooth.desc')}
					</Text>
				</View>
				{bluetoothPermissions !== undefined && (
					<BodyBluetooth
						bluetoothPermissions={bluetoothPermissions}
						setBluetoothPermissions={setBluetoothPermissions}
					/>
				)}
			</ScrollView>
		</Layout>
	)
}
