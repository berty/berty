import React from 'react'
import { ScrollView, TouchableOpacity, View, Text, Platform } from 'react-native'
import { Icon } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import { withInAppNotification } from 'react-native-in-app-notification'
import { useDispatch, useSelector } from 'react-redux'
import { check, PERMISSIONS } from 'react-native-permissions'

import beapi from '@berty-tech/api'
import { useStyles } from '@berty-tech/styles'
import { ScreenFC, useNavigation } from '@berty-tech/navigation'
import {
	accountService,
	useMessengerContext,
	useMountEffect,
	useThemeColor,
} from '@berty-tech/store'
import { useAccount } from '@berty-tech/react-redux'
import { selectSelectedAccount } from '@berty-tech/redux/reducers/ui.reducer'
import { checkBlePermission } from '@berty-tech/rnutil/checkPermissions'

import { AccountAvatar } from '../avatars'
import { ButtonSettingV2, Section } from '../shared-components'
import {
	selectBlePerm,
	selectCurrentNetworkConfig,
	setBlePerm,
	setCurrentNetworkConfig,
} from '@berty-tech/redux/reducers/networkConfig.reducer'

const ProfileButton: React.FC<{}> = () => {
	const [{ padding, margin, border }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const account = useAccount()
	const { navigate } = useNavigation()

	return (
		<TouchableOpacity
			onPress={() => navigate('Modals.EditProfile')}
			style={[
				margin.horizontal.medium,
				padding.medium,
				border.radius.medium,
				{
					flex: 1,
					backgroundColor: colors['main-background'],
				},
			]}
		>
			<View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<AccountAvatar size={50 * scaleSize} />
					<Text style={[padding.left.medium, { fontFamily: 'Open Sans', fontWeight: '600' }]}>
						{account.displayName || ''}
					</Text>
				</View>
				<TouchableOpacity
					style={[
						padding.scale(8),
						border.radius.scale(100),
						{
							backgroundColor: '#EDEDED',
							alignItems: 'center',
							justifyContent: 'center',
							flexDirection: 'row',
						},
					]}
					onPress={() => navigate('Settings.MyBertyId')}
				>
					<Icon
						name='qr'
						pack='custom'
						fill={colors['background-header']}
						width={20 * scaleSize}
						height={20 * scaleSize}
					/>
				</TouchableOpacity>
			</View>
		</TouchableOpacity>
	)
}

export const Home: ScreenFC<'Settings.Home'> = withInAppNotification(
	({ showNotification }: any) => {
		const [{}, { scaleSize }] = useStyles()
		const colors = useThemeColor()
		const { navigate } = useNavigation()
		const { t }: { t: any } = useTranslation()

		const selectedAccount = useSelector(selectSelectedAccount)
		const ctx = useMessengerContext()

		const blePerm = useSelector(selectBlePerm)
		const networkConfig = useSelector(selectCurrentNetworkConfig)
		const dispatch = useDispatch()

		// get network config of the account at the mount of the component
		useMountEffect(() => {
			const f = async () => {
				const netConf = await accountService.networkConfigGet({
					accountId: selectedAccount,
				})
				if (netConf.currentConfig) {
					dispatch(setCurrentNetworkConfig(netConf.currentConfig))
					return
				}
			}

			f().catch(e => console.warn(e))
		})

		// get OS status permission
		useMountEffect(() => {
			const f = async () => {
				const status = await check(
					Platform.OS === 'ios'
						? PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL
						: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
				)
				dispatch(setBlePerm(status))
			}
			f()
		})

		// setNewConfig function: update the state + update the network config in the account service + show notif to restart app
		const setNewConfig = React.useCallback(
			async (newConfig: beapi.account.INetworkConfig) => {
				dispatch(setCurrentNetworkConfig(newConfig))

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
			[ctx, dispatch, selectedAccount, showNotification, t],
		)

		return (
			<View style={{ backgroundColor: colors['secondary-background'], flex: 1, paddingTop: 20 }}>
				<ScrollView
					bounces={false}
					contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
					showsVerticalScrollIndicator={false}
				>
					<ProfileButton />
					<Section>
						{networkConfig && (
							<ButtonSettingV2
								text={t('settings.home.proximity-button')}
								icon='bluetooth'
								toggle={{
									enable: true,
									value:
										blePerm === 'granted' &&
										networkConfig?.bluetoothLe === beapi.account.NetworkConfig.Flag.Enabled,
									action: async () => {
										if (Platform.OS === 'ios') {
											await checkBlePermission({
												setNetworkConfig: async (newConfig: beapi.account.INetworkConfig) => {
													dispatch(setCurrentNetworkConfig(newConfig))
												},
												networkConfig,
												changedKey: ['bluetoothLe', 'appleMultipeerConnectivity'],
												navigate,
												accept: async () => {
													const newValue =
														networkConfig?.bluetoothLe === beapi.account.NetworkConfig.Flag.Enabled
															? beapi.account.NetworkConfig.Flag.Disabled
															: beapi.account.NetworkConfig.Flag.Enabled
													dispatch(
														setCurrentNetworkConfig({
															...networkConfig,
															bluetoothLe: newValue,
															appleMultipeerConnectivity: newValue,
														}),
													)
												},
											})
										}
										if (Platform.OS === 'android') {
											await checkBlePermission({
												setNetworkConfig: async (newConfig: beapi.account.INetworkConfig) => {
													setNewConfig(newConfig)
												},
												networkConfig,
												changedKey: ['bluetoothLe', 'androidNearby'],
												navigate,
												accept: async () => {
													const newValue =
														networkConfig?.bluetoothLe === beapi.account.NetworkConfig.Flag.Enabled
															? beapi.account.NetworkConfig.Flag.Disabled
															: beapi.account.NetworkConfig.Flag.Enabled
													dispatch(
														setCurrentNetworkConfig({
															...networkConfig,
															bluetoothLe: newValue,
															androidNearby: newValue,
														}),
													)
												},
											})
										}
									},
								}}
							/>
						)}
						{/*
					<ButtonSettingV2
						text={t('settings.home.notifications-button')}
						icon='bell'
						onPress={() => navigate('Settings.Notifications')}
					/>
					<ButtonSettingV2
						text={t('settings.home.contact-convs-button')}
						icon='message-circle'
						onPress={() => navigate('Settings.ContactAndConversations')}
					/>
					*/}
						<ButtonSettingV2
							text={t('settings.home.appearance-button')}
							icon='eye'
							onPress={() => navigate('Settings.Appearence')}
						/>
						{/*
					<ButtonSettingV2
						text={t('settings.home.devices-button')}
						icon='smartphone'
						onPress={() => navigate('Settings.DevicesAndBackup')}
						last
					/>
					*/}
					</Section>
					<Section>
						{/*
					<ButtonSettingV2
						text={t('settings.home.security-button')}
						icon='lock'
						onPress={() => navigate('Settings.Security')}
					/>
					*/}
						<ButtonSettingV2
							text={t('settings.home.accounts-button')}
							icon='user'
							onPress={() => navigate('Settings.Accounts')}
						/>
						{networkConfig && (
							<ButtonSettingV2
								text={t('settings.home.network-button')}
								icon='wifi'
								last
								onPress={() => {
									navigate('Settings.Network')
								}}
							/>
						)}
					</Section>
					<Section>
						{/*
						<ButtonSettingV2
							text={t('settings.home.bug-button')}
							icon='mail'
							onPress={() => console.log('TODO')}
						/>
						*/}
						<ButtonSettingV2
							text={t('settings.home.about-button')}
							icon='info'
							last
							onPress={() => navigate('Settings.AboutBerty')}
						/>
					</Section>
				</ScrollView>
			</View>
		)
	},
)
