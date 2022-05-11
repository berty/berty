import { Icon } from '@ui-kitten/components'
import * as MailComposer from 'expo-mail-composer'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, TouchableOpacity, View, Platform } from 'react-native'
import { withInAppNotification } from 'react-native-in-app-notification'
import { RESULTS } from 'react-native-permissions'
import { useDispatch, useSelector } from 'react-redux'

import beapi from '@berty/api'
import { AccountAvatar } from '@berty/components/avatars'
import { ButtonSettingV2, Section } from '@berty/components/shared-components'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useModal } from '@berty/contexts/modal.context'
import PermissionsContext from '@berty/contexts/permissions.context'
import { useStyles } from '@berty/contexts/styles'
import { useAccount, useAppSelector, useSyncNetworkConfigOnScreenRemoved } from '@berty/hooks'
import { ScreenFC, useNavigation } from '@berty/navigation'
import {
	selectBlePerm,
	selectEditedNetworkConfig,
	setBlePerm,
	setCurrentNetworkConfig,
	setNodeNetworkConfig,
} from '@berty/redux/reducers/networkConfig.reducer'
import { selectProtocolClient, selectSelectedAccount } from '@berty/redux/reducers/ui.reducer'
import { useMountEffect, useThemeColor, useMessengerClient } from '@berty/store'
import { accountClient } from '@berty/utils/accounts/accountClient'
import { numberifyLong } from '@berty/utils/convert/long'
import {
	accountPushToggleState,
	pushAvailable,
	pushFilteringAvailable,
} from '@berty/utils/notification/notif-push'
import { checkBlePermission } from '@berty/utils/react-native/checkPermissions'
import { serviceTypes } from '@berty/utils/remote-services/remote-services'

import { EditProfile } from './components/EditProfile'

const ProfileButton: React.FC<{}> = () => {
	const { padding, margin, border, text } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const account = useAccount()
	const { navigate } = useNavigation()
	const { show } = useModal()

	return (
		<TouchableOpacity
			onPress={() => show(<EditProfile />)}
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
					<UnifiedText style={[padding.left.medium, text.bold]}>
						{account.displayName || ''}
					</UnifiedText>
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

export const SettingsHome: ScreenFC<'Settings.Home'> = withInAppNotification(
	({ showNotification }: any) => {
		const { scaleSize } = useAppDimensions()
		const colors = useThemeColor()
		const { navigate } = useNavigation()
		const { t }: { t: any } = useTranslation()
		const messengerClient = useMessengerClient()
		const protocolClient = useSelector(selectProtocolClient)

		const selectedAccount = useAppSelector(selectSelectedAccount)
		const blePerm = useAppSelector(selectBlePerm)
		const networkConfig = useAppSelector(selectEditedNetworkConfig)
		const dispatch = useDispatch()
		const account = useAccount()
		const { permissions } = useContext(PermissionsContext)

		const hasKnownPushServer = account.serviceTokens?.some(t => t.serviceType === serviceTypes.Push)

		const generateEmail = React.useCallback(async () => {
			var systemInfo = await messengerClient?.systemInfo({})
			// Delete useless / intrusive infos
			delete systemInfo?.protocol?.process?.hostName
			delete systemInfo?.protocol?.process?.systemUsername
			delete systemInfo?.messenger?.process?.hostName
			delete systemInfo?.messenger?.process?.systemUsername
			try {
				let result = await MailComposer.composeAsync({
					recipients: ['bugs@berty.tech'],
					subject: 'Bug report',
					body: `You can describe your bug here.
						--------------------------------
						${JSON.stringify(
							{
								systemInfo: systemInfo,
								networkConfig: networkConfig,
							},
							null,
							2,
						)}`,
				})
				if (result.status === MailComposer.MailComposerStatus.UNDETERMINED) {
					showNotification({
						title: t('notification.submit-failed.title'),
						message: t('notification.submit-failed.desc'),
						additionalProps: { type: 'message' },
					})
				}
			} catch (err) {
				showNotification({
					title: t('notification.submit-failed.title'),
					message: t('notification.submit-failed.desc'),
					additionalProps: { type: 'message' },
				})
			}
		}, [messengerClient, networkConfig, showNotification, t])

		useSyncNetworkConfigOnScreenRemoved()

		// get network config of the account at the mount of the component
		useMountEffect(() => {
			const f = async () => {
				const netConf = await accountClient.networkConfigGet({
					accountId: selectedAccount,
				})
				if (netConf.currentConfig) {
					dispatch(setCurrentNetworkConfig(netConf.currentConfig))
					dispatch(setNodeNetworkConfig(netConf.currentConfig))
					return
				}
			}

			f().catch(e => console.warn(e))
		})

		// get OS status permission
		useMountEffect(() => {
			const f = async () => {
				if (Platform.OS === 'web') {
					return
				}
				dispatch(setBlePerm(permissions.proximity))
			}
			f()
		})

		const getOffGridCommunicationValue = React.useCallback(() => {
			if (
				blePerm === 'granted' &&
				networkConfig?.bluetoothLe === beapi.account.NetworkConfig.Flag.Enabled
			) {
				if (Platform.OS === 'android') {
					return networkConfig?.androidNearby === beapi.account.NetworkConfig.Flag.Enabled
				} else if (Platform.OS === 'ios') {
					return (
						networkConfig?.appleMultipeerConnectivity === beapi.account.NetworkConfig.Flag.Enabled
					)
				}
			}
			return false
		}, [blePerm, networkConfig])

		return (
			<View style={{ backgroundColor: colors['secondary-background'], flex: 1, paddingTop: 20 }}>
				<ScrollView
					bounces={false}
					contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
					showsVerticalScrollIndicator={false}
				>
					<ProfileButton />
					<Section>
						{Platform.OS !== 'web' && networkConfig && (
							<ButtonSettingV2
								text={t('settings.home.proximity-button')}
								icon='bluetooth-outline'
								toggle={{
									enable: true,
									value: getOffGridCommunicationValue(),
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
													let newValue
													newValue =
														networkConfig?.bluetoothLe === beapi.account.NetworkConfig.Flag.Enabled
															? beapi.account.NetworkConfig.Flag.Disabled
															: beapi.account.NetworkConfig.Flag.Enabled
													if (newValue === beapi.account.NetworkConfig.Flag.Disabled) {
														newValue =
															networkConfig?.appleMultipeerConnectivity ===
															beapi.account.NetworkConfig.Flag.Enabled
																? beapi.account.NetworkConfig.Flag.Disabled
																: beapi.account.NetworkConfig.Flag.Enabled
													}
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
													dispatch(setCurrentNetworkConfig(newConfig))
												},
												networkConfig,
												changedKey: ['bluetoothLe', 'androidNearby'],
												navigate,
												accept: async () => {
													let newValue
													newValue =
														networkConfig?.bluetoothLe === beapi.account.NetworkConfig.Flag.Enabled
															? beapi.account.NetworkConfig.Flag.Disabled
															: beapi.account.NetworkConfig.Flag.Enabled
													if (newValue === beapi.account.NetworkConfig.Flag.Disabled) {
														newValue =
															networkConfig?.androidNearby ===
															beapi.account.NetworkConfig.Flag.Enabled
																? beapi.account.NetworkConfig.Flag.Disabled
																: beapi.account.NetworkConfig.Flag.Enabled
													}
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
						{pushAvailable && (
							<ButtonSettingV2
								text={t('settings.home.notifications-button')}
								icon='bell'
								onPress={() => navigate('Settings.Notifications')}
								toggle={{
									enable: pushFilteringAvailable,
									value:
										hasKnownPushServer &&
										numberifyLong(account.mutedUntil) < Date.now() &&
										(permissions.notification === RESULTS.GRANTED ||
											permissions.notification === RESULTS.LIMITED),
									action: async () => {
										await accountPushToggleState({
											account,
											messengerClient: messengerClient,
											protocolClient: protocolClient,
											navigate,
											t,
										})
									},
								}}
							/>
						)}
						{/*
					<ButtonSettingV2
						text={t('settings.home.contact-convs-button')}
						icon='message-circle'
						onPress={() => navigate('Settings.ContactAndConversations')}
					/>
					*/}
						<ButtonSettingV2
							text={t('settings.home.appearance-button')}
							icon='eye-outline'
							onPress={() => navigate('Settings.Appearance')}
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
							icon='person-outline'
							onPress={() => navigate('Settings.Accounts')}
						/>
						{networkConfig && (
							<ButtonSettingV2
								text={t('settings.home.network-button')}
								icon='wifi-outline'
								last
								onPress={() => {
									navigate('Settings.Network')
								}}
							/>
						)}
					</Section>
					<Section>
						<ButtonSettingV2
							text={t('settings.home.bug-button')}
							icon='email-outline'
							onPress={() => generateEmail()}
						/>
						<ButtonSettingV2
							text={t('settings.home.about-button')}
							icon='info-outline'
							last
							onPress={() => navigate('Settings.AboutBerty')}
						/>
					</Section>
				</ScrollView>
			</View>
		)
	},
)
