import React from 'react'
import { ScrollView, View, Platform, TextInput, TouchableOpacity, Text } from 'react-native'
import { PERMISSIONS, RESULTS, check } from 'react-native-permissions'
import { withInAppNotification } from 'react-native-in-app-notification'
import { useTranslation } from 'react-i18next'
import { Icon } from '@ui-kitten/components'
import { useHeaderHeight } from '@react-navigation/elements'
import { useDispatch } from 'react-redux'

import beapi from '@berty-tech/api'
import rnutil from '@berty-tech/rnutil'
import { useStyles } from '@berty-tech/styles'
import { ScreenFC, useNavigation } from '@berty-tech/navigation'
import {
	accountService,
	handleNetworkConfigFront,
	NetworkConfigFront,
	useMessengerContext,
	useThemeColor,
} from '@berty-tech/store'

import { ButtonSettingV2, Section } from '../shared-components'
import { selectNetworkConfig, selectSelectedAccount } from '@berty-tech/redux/reducers/ui.reducer'
import { useSelector } from 'react-redux'
import { showNeedRestartNotification } from '../helpers'
import { IOSOnlyKeyboardAvoidingView } from '@berty-tech/rnutil/keyboardAvoiding'
import { Toggle } from '@berty-tech/components/shared-components/Toggle'
import { setNetworkConfig } from '@berty-tech/redux/reducers/networkConfig.reducer'

const Proximity: React.FC<{
	setNewConfig: (newConfig: NetworkConfigFront) => Promise<void>
}> = ({ setNewConfig }) => {
	const { navigate } = useNavigation()
	const networkConfig = useSelector(selectNetworkConfig)

	return (
		<Section>
			<ButtonSettingV2
				text='BLE'
				icon='bluetooth'
				toggle={{
					enable: true,
					value: networkConfig?.bluetoothLe === beapi.account.NetworkConfig.Flag.Enabled,
					action: async () => {
						const bluetoothLe =
							networkConfig?.bluetoothLe === beapi.account.NetworkConfig.Flag.Enabled
								? beapi.account.NetworkConfig.Flag.Disabled
								: beapi.account.NetworkConfig.Flag.Enabled
						const newConfig = {
							...networkConfig,
							bluetoothLe,
							appleMultipeerConnectivity:
								Platform.OS === 'ios' ? bluetoothLe : networkConfig.appleMultipeerConnectivity,
							androidNearby: Platform.OS === 'android' ? bluetoothLe : networkConfig.androidNearby,
						}
						const status = await check(
							Platform.OS === 'ios'
								? PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL
								: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
						)
						if (status === RESULTS.GRANTED) {
							setNewConfig(newConfig)
						} else {
							await rnutil.checkPermissions('p2p', {
								navigate,
								navigateToPermScreenOnProblem: true,
								onComplete: async () => setNewConfig(newConfig),
							})
						}
					},
				}}
			/>
			{Platform.OS === 'ios' && (
				<ButtonSettingV2
					text='MC'
					icon='wifi'
					toggle={{
						enable: true,
						value:
							networkConfig?.appleMultipeerConnectivity ===
							beapi.account.NetworkConfig.Flag.Enabled,
						action: async () => {
							const newConfig = {
								...networkConfig,
								appleMultipeerConnectivity:
									networkConfig?.appleMultipeerConnectivity ===
									beapi.account.NetworkConfig.Flag.Enabled
										? beapi.account.NetworkConfig.Flag.Disabled
										: beapi.account.NetworkConfig.Flag.Enabled,
							}
							const status = await check(
								Platform.OS === 'ios'
									? PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL
									: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
							)
							if (status === RESULTS.GRANTED) {
								setNewConfig(newConfig)
							} else {
								await rnutil.checkPermissions('p2p', {
									navigate,
									navigateToPermScreenOnProblem: true,
									onComplete: async () => setNewConfig(newConfig),
								})
							}
						},
					}}
				/>
			)}
			{Platform.OS === 'android' && (
				<ButtonSettingV2
					text='Nearby'
					icon='wifi'
					toggle={{
						enable: true,
						value: networkConfig?.androidNearby === beapi.account.NetworkConfig.Flag.Enabled,
						action: async () => {
							const newConfig = {
								...networkConfig,
								androidNearby:
									networkConfig?.androidNearby === beapi.account.NetworkConfig.Flag.Enabled
										? beapi.account.NetworkConfig.Flag.Disabled
										: beapi.account.NetworkConfig.Flag.Enabled,
							}
							const status = await check(
								Platform.OS === 'ios'
									? PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL
									: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
							)
							if (status === RESULTS.GRANTED) {
								setNewConfig(newConfig)
							} else {
								await rnutil.checkPermissions('p2p', {
									navigate,
									navigateToPermScreenOnProblem: true,
									onComplete: async () => setNewConfig(newConfig),
								})
							}
						},
					}}
				/>
			)}
			<ButtonSettingV2
				text='MDNS'
				icon='wifi'
				toggle={{
					enable: true,
					value: networkConfig?.mdns === beapi.account.NetworkConfig.Flag.Enabled,
					action: async () => {
						setNewConfig({
							...networkConfig,
							mdns:
								networkConfig?.mdns === beapi.account.NetworkConfig.Flag.Enabled
									? beapi.account.NetworkConfig.Flag.Disabled
									: beapi.account.NetworkConfig.Flag.Enabled,
						})
					},
				}}
				last
			/>
		</Section>
	)
}

const InputSetting: React.FC<{
	setNewConfig: (newConfig: NetworkConfigFront) => Promise<void>
	obj: string
}> = ({ setNewConfig, obj }) => {
	const [{ border, padding, margin }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const { t } = useTranslation()
	const [input, setInput] = React.useState<string>('')
	const networkConfig = useSelector(selectNetworkConfig)

	const heightButton = 55

	return (
		<View
			style={[
				padding.horizontal.medium,
				{
					flex: 1,
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
				},
			]}
		>
			<View
				style={[
					border.radius.medium,
					{
						height: heightButton * scaleSize,
						backgroundColor: colors['main-background'],
						flexDirection: 'row',
						alignItems: 'center',
					},
				]}
			>
				<Icon
					width={20 * scaleSize}
					height={20 * scaleSize}
					fill={colors['background-header']}
					name='server'
					pack='feather'
				/>

				{/* <View style={{ flex: 1 }}> */}
				<TextInput
					value={input}
					placeholderTextColor={`${colors['main-text']}50`}
					placeholder={t('onboarding.advanced-settings.third-part.second-button.placeholder')}
					style={[margin.left.small, { fontFamily: 'Open Sans', fontWeight: '600', padding: 0 }]}
					onChangeText={(text: string) => {
						setInput(text)
					}}
				/>
				{/* </View> */}
			</View>
			<TouchableOpacity
				onPress={() => {
					const item = { value: input, enable: true }
					const newArray = networkConfig?.rendezvous
					if (!newArray) {
						return
					}
					newArray.push(item)
					setNewConfig({
						...networkConfig,
						[obj]: newArray,
					})
				}}
			>
				<Icon
					name='plus-circle'
					width={23 * scaleSize}
					height={23 * scaleSize}
					pack='feather'
					fill={colors['background-header']}
				/>
			</TouchableOpacity>
		</View>
	)
}

const CustomItem: React.FC<{
	value: string
	toggle: boolean
	onToggleChange: () => void
}> = ({ value, toggle, onToggleChange }) => {
	const [{ margin, padding }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const heightButton = 55
	return (
		<>
			<View
				style={[
					padding.horizontal.medium,
					{
						flex: 1,
						flexDirection: 'row',
						alignItems: 'center',
						justifyContent: 'space-between',
					},
				]}
			>
				<View style={{ height: heightButton * scaleSize, marginLeft: 30 }}>
					<View
						style={[
							margin.left.small,
							{ height: heightButton, flexDirection: 'row', alignItems: 'center' },
						]}
					>
						<Text>{value}</Text>
					</View>
				</View>
				<Toggle status='primary' checked={toggle} onChange={onToggleChange} />
			</View>

			<View style={{ flex: 1, height: 1, backgroundColor: colors['secondary-background'] }} />
		</>
	)
}

export const Network2: React.FC = withInAppNotification(({ showNotification }: any) => {
	const [{}, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const ctx = useMessengerContext()
	const selectedAccount = useSelector(selectSelectedAccount)
	const { t } = useTranslation()
	const networkConfig = useSelector(selectNetworkConfig)
	const dispatch = useDispatch()

	console.log('Network::', networkConfig)
	const setNewConfig = React.useCallback(
		async (newConfig: NetworkConfigFront) => {
			dispatch(setNetworkConfig(newConfig))

			await accountService.networkConfigSet({
				accountId: selectedAccount,
				config: handleNetworkConfigFront(newConfig),
			})
			showNeedRestartNotification(showNotification, ctx, t)
		},
		[ctx, dispatch, selectedAccount, showNotification, t],
	)

	return (
		<View style={{ backgroundColor: colors['secondary-background'], flex: 1 }}>
			<ScrollView
				bounces={false}
				contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
				showsVerticalScrollIndicator={false}
			>
				<Section>
					<ButtonSettingV2
						text='Load voice memeo on cellular'
						icon='bluetooth'
						toggle={{ enable: true }}
						disabled
					/>
					<ButtonSettingV2
						text='Load medias on cellular'
						icon='bell'
						toggle={{ enable: true }}
						disabled
					/>
				</Section>
				<Proximity setNewConfig={setNewConfig} />
				<Section>
					<ButtonSettingV2
						text='DHT'
						icon='info'
						toggle={{
							enable: true,
							value: networkConfig?.dht === beapi.account.NetworkConfig.DHTFlag.DHTClient,
							action: async () => {
								setNewConfig({
									...networkConfig,
									dht:
										networkConfig?.dht === beapi.account.NetworkConfig.DHTFlag.DHTClient
											? beapi.account.NetworkConfig.DHTFlag.DHTDisabled
											: beapi.account.NetworkConfig.DHTFlag.DHTClient,
								})
							},
						}}
					/>
					<ButtonSettingV2 text='RDVP' icon='info' />
					{networkConfig.rendezvous?.map(item => {
						console.log('item', item)
						return (
							<CustomItem
								value={item.value === ':default:' ? 'Berty RDVP' : item.value}
								toggle={item.enable}
								onToggleChange={() => {
									const index = networkConfig.rendezvous?.findIndex(
										object => object.value === item.value,
									)
									if (!index) {
										return
									}
									let newRendezvous = networkConfig?.rendezvous
									if (!newRendezvous) {
										return
									}
									newRendezvous[index].enable = !newRendezvous[index].enable
									setNewConfig({
										...networkConfig,
										rendezvous: newRendezvous,
									})
								}}
							/>
						)
					})}
					<InputSetting setNewConfig={setNewConfig} obj='rendezvous' />
				</Section>
				<Section>
					<ButtonSettingV2 text='Bootstrap Node' icon='info' />
					<ButtonSettingV2 text='Relay' icon='info' />
					<ButtonSettingV2 text='Tor' icon='info' last disabled />
				</Section>
			</ScrollView>
		</View>
	)
})

export const Network: ScreenFC<'Settings.Network'> = () => {
	const headerHeight = useHeaderHeight()
	return (
		<IOSOnlyKeyboardAvoidingView
			behavior='padding'
			keyboardVerticalOffset={headerHeight}
			style={[{ flex: 1 }]}
		>
			<Network2 />
		</IOSOnlyKeyboardAvoidingView>
	)
}
