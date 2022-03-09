import React from 'react'
import { ScrollView, View, Platform } from 'react-native'
import { useTranslation } from 'react-i18next'
import { useHeaderHeight } from '@react-navigation/elements'
import { withInAppNotification } from 'react-native-in-app-notification'

import beapi from '@berty-tech/api'
import { useStyles } from '@berty-tech/styles'
import { ScreenFC, useNavigation } from '@berty-tech/navigation'
import { accountService, useMessengerContext, useThemeColor } from '@berty-tech/store'

import { ButtonSettingV2, Section } from '../shared-components'
import { selectSelectedAccount } from '@berty-tech/redux/reducers/ui.reducer'
import { useDispatch, useSelector } from 'react-redux'
import { IOSOnlyKeyboardAvoidingView } from '@berty-tech/rnutil/keyboardAvoiding'
import { checkBlePermission } from '@berty-tech/rnutil/checkPermissions'
import {
	selectBlePerm,
	selectCurrentNetworkConfig,
	setCurrentNetworkConfig,
} from '@berty-tech/redux/reducers/networkConfig.reducer'

const Proximity: React.FC<{
	setNewConfig: (newConfig: beapi.account.INetworkConfig) => Promise<void>
}> = ({ setNewConfig }) => {
	const { navigate } = useNavigation()
	const { t }: { t: any } = useTranslation()
	const blePerm = useSelector(selectBlePerm)
	const networkConfig = useSelector(selectCurrentNetworkConfig)

	return (
		<Section>
			<ButtonSettingV2
				text={t('settings.network.ble-button')}
				toggle={{
					enable: true,
					value:
						blePerm === 'granted' &&
						networkConfig?.bluetoothLe === beapi.account.NetworkConfig.Flag.Enabled,
					action: async () => {
						await checkBlePermission({
							setNetworkConfig: setNewConfig,
							networkConfig,
							changedKey: ['bluetoothLe'],
							navigate,
						})
					},
				}}
			/>
			{Platform.OS === 'ios' && (
				<ButtonSettingV2
					text={t('settings.network.mc-button')}
					toggle={{
						enable: true,
						value:
							blePerm === 'granted' &&
							networkConfig?.appleMultipeerConnectivity ===
								beapi.account.NetworkConfig.Flag.Enabled,
						action: async () => {
							await checkBlePermission({
								setNetworkConfig: setNewConfig,
								networkConfig,
								changedKey: ['appleMultipeerConnectivity'],
								navigate,
							})
						},
					}}
				/>
			)}
			{Platform.OS === 'android' && (
				<ButtonSettingV2
					text={t('settings.network.nearby-button')}
					toggle={{
						enable: true,
						value:
							blePerm === 'granted' &&
							networkConfig?.androidNearby === beapi.account.NetworkConfig.Flag.Enabled,
						action: async () => {
							await checkBlePermission({
								setNetworkConfig: setNewConfig,
								networkConfig,
								changedKey: ['androidNearby'],
								navigate,
							})
						},
					}}
				/>
			)}
			<ButtonSettingV2
				text={t('settings.network.mdns-button')}
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

// const InputSetting: React.FC<{
// 	setNewConfig: (newConfig: beapi.account.INetworkConfig) => Promise<void>
// 	obj: string
// }> = ({ setNewConfig, obj }) => {
// 	const [{ border, padding, margin }, { scaleSize }] = useStyles()
// 	const colors = useThemeColor()
// 	const [input, setInput] = React.useState<string>('')
// 	const networkConfig = useSelector(selectNetworkConfig)

// 	const heightButton = 55

// 	return (
// 		<View
// 			style={[
// 				padding.horizontal.medium,
// 				{
// 					flex: 1,
// 					flexDirection: 'row',
// 					justifyContent: 'space-between',
// 					alignItems: 'center',
// 				},
// 			]}
// 		>
// 			<View
// 				style={[
// 					border.radius.medium,
// 					{
// 						height: heightButton * scaleSize,
// 						backgroundColor: colors['main-background'],
// 						flexDirection: 'row',
// 						alignItems: 'center',
// 					},
// 				]}
// 			>
// 				<Icon
// 					width={20 * scaleSize}
// 					height={20 * scaleSize}
// 					fill={colors['background-header']}
// 					name='server'
// 					pack='feather'
// 				/>

// 				<TextInput
// 					value={input}
// 					placeholderTextColor={`${colors['main-text']}50`}
// 					style={[margin.left.small, { fontFamily: 'Open Sans', fontWeight: '600', padding: 0 }]}
// 					onChangeText={(text: string) => {
// 						setInput(text)
// 					}}
// 				/>
// 			</View>
// 			<TouchableOpacity
// 				onPress={() => {
// 					const item = input
// 					const newArray = networkConfig?.rendezvous
// 					if (!newArray) {
// 						return
// 					}
// 					newArray.push(item)
// 					setNewConfig({
// 						...networkConfig,
// 						[obj]: newArray,
// 					})
// 				}}
// 			>
// 				<Icon
// 					name='plus-circle'
// 					width={23 * scaleSize}
// 					height={23 * scaleSize}
// 					pack='feather'
// 					fill={colors['background-header']}
// 				/>
// 			</TouchableOpacity>
// 		</View>
// 	)
// }

// const CustomItem: React.FC<{
// 	value: string
// 	toggle: boolean
// 	onToggleChange: () => void
// }> = ({ value, toggle, onToggleChange }) => {
// 	const [{ margin, padding }, { scaleSize }] = useStyles()
// 	const colors = useThemeColor()
// 	const heightButton = 55
// 	return (
// 		<>
// 			<View
// 				style={[
// 					padding.horizontal.medium,
// 					{
// 						flex: 1,
// 						flexDirection: 'row',
// 						alignItems: 'center',
// 						justifyContent: 'space-between',
// 					},
// 				]}
// 			>
// 				<View style={{ height: heightButton * scaleSize, marginLeft: 30 }}>
// 					<View
// 						style={[
// 							margin.left.small,
// 							{ height: heightButton, flexDirection: 'row', alignItems: 'center' },
// 						]}
// 					>
// 						<Text>{value}</Text>
// 					</View>
// 				</View>
// 				<Toggle status='primary' checked={toggle} onChange={onToggleChange} />
// 			</View>

// 			<View style={{ flex: 1, height: 1, backgroundColor: colors['secondary-background'] }} />
// 		</>
// 	)
// }

export const NetworkBody: React.FC = withInAppNotification(({ showNotification }: any) => {
	const [{}, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const selectedAccount = useSelector(selectSelectedAccount)
	const { t } = useTranslation()
	const ctx = useMessengerContext()
	const dispatch = useDispatch()
	const networkConfig = useSelector(selectCurrentNetworkConfig)

	// setNewConfig function: update the state + update the network config in the account service + show notif to restart app
	const setNewConfig = React.useCallback(
		async (newConfig: beapi.account.INetworkConfig) => {
			dispatch(setCurrentNetworkConfig({ ...newConfig }))

			await accountService.networkConfigSet({
				accountId: selectedAccount,
				config: newConfig,
			})
			showNotification({
				title: t('notification.need-restart-ble.title'),
				message: t('notification.need-restart-ble.desc'),
				onPress: async () => {
					await ctx.restart()
				},
				additionalProps: { type: 'message' },
			})
		},
		[dispatch, selectedAccount, showNotification, t, ctx],
	)

	return (
		<View style={{ backgroundColor: colors['secondary-background'], flex: 1 }}>
			<ScrollView
				bounces={false}
				contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
				showsVerticalScrollIndicator={false}
			>
				{/*
				<Section>
					<ButtonSettingV2
						text={t('settings.network.memo-cell-button')}
						toggle={{ enable: true }}
						disabled
					/>
					<ButtonSettingV2
						text={t('settings.network.medias-cell-button')}
						toggle={{ enable: true }}
						disabled
					/>
				</Section>
				*/}
				<Proximity setNewConfig={setNewConfig} />
				<Section>
					<ButtonSettingV2
						text={t('settings.network.dht-button')}
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
					{/*
					<ButtonSettingV2 text={t('settings.network.rdvp-button')} />
					{networkConfig?.rendezvous?.map(item => {
						return (
							<CustomItem
								key={item}
								value={item === ':default:' ? 'Berty RDVP' : item}
								toggle={true}
								onToggleChange={() => {}}
							/>
						)
					})}
					<InputSetting setNewConfig={setNewConfig} obj='rendezvous' />
				*/}
				</Section>
				{/*
				<Section>
					<ButtonSettingV2 text={t('settings.network.relay-button')} />
					<ButtonSettingV2 text={t('settings.network.bootstrap-button')} />
					<ButtonSettingV2 text='Tor' last disabled />
				</Section>
				*/}
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
			<NetworkBody />
		</IOSOnlyKeyboardAvoidingView>
	)
}
