import { Icon } from '@ui-kitten/components'
import * as MailComposer from 'expo-mail-composer'
import React, { useContext } from 'react'
import { useTranslation } from 'react-i18next'
import { Platform, ScrollView, TouchableOpacity, View } from 'react-native'
import { withInAppNotification } from 'react-native-in-app-notification'
import { RESULTS } from 'react-native-permissions'
import { useDispatch, useSelector } from 'react-redux'

import beapi from '@berty/api'
import { DividerItem, MenuItemWithIcon, ItemSection, MenuToggleWithIcon } from '@berty/components'
import { AccountAvatar } from '@berty/components/avatars'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useModal } from '@berty/contexts/modal.context'
import PermissionsContext from '@berty/contexts/permissions.context'
import { useStyles } from '@berty/contexts/styles'
import {
	bertyMethodsHooks,
	useAccount,
	useAppSelector,
	useMessengerClient,
	useMountEffect,
	useSyncNetworkConfigOnScreenRemoved,
	useThemeColor,
} from '@berty/hooks'
import { ScreenFC, useNavigation } from '@berty/navigation'
import {
	selectBlePerm,
	selectEditedNetworkConfig,
	setBlePerm,
	setCurrentNetworkConfig,
	setNodeNetworkConfig,
} from '@berty/redux/reducers/networkConfig.reducer'
import {
	selectProtocolClient,
	selectSelectedAccount,
	selectDevMode,
	setDevMode,
} from '@berty/redux/reducers/ui.reducer'
import { accountClient } from '@berty/utils/accounts/accountClient'
import { numberifyLong } from '@berty/utils/convert/long'
import {
	accountPushToggleState,
	pushAvailable,
	pushFilteringAvailable,
} from '@berty/utils/notification/notif-push'
import { checkProximityPermission } from '@berty/utils/react-native/checkPermissions'
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
		const { t } = useTranslation()
		const messengerClient = useMessengerClient()
		const protocolClient = useSelector(selectProtocolClient)

		const selectedAccount = useAppSelector(selectSelectedAccount)
		const blePerm = useAppSelector(selectBlePerm)
		const networkConfig = useAppSelector(selectEditedNetworkConfig)
		const dispatch = useDispatch()
		const account = useAccount()
		const { permissions } = useContext(PermissionsContext)
		const devMode = useSelector(selectDevMode)
		const [nbClick, setNbClick] = React.useState<number>(0)
		const {
			reply: systemInfo,
			done: systemInfoDone,
			error: systemInfoError,
			call: systemInfoCall,
		} = bertyMethodsHooks.useSystemInfo()

		const hasKnownPushServer = account.serviceTokens?.some(t => t.serviceType === serviceTypes.Push)

		// get system info
		React.useEffect(() => {
			systemInfoCall()
		}, [systemInfoCall])

		const generateEmail = React.useCallback(async () => {
			var localSysInfo: beapi.messenger.SystemInfo.IReply
			if (systemInfoDone && systemInfoError != null) {
				localSysInfo = { ...systemInfo }
				// Delete useless / intrusive infos
				delete localSysInfo?.protocol?.process?.hostName
				delete localSysInfo?.protocol?.process?.systemUsername
				delete localSysInfo?.messenger?.process?.hostName
				delete localSysInfo?.messenger?.process?.systemUsername
			} else {
				localSysInfo = {}
			}
			try {
				let result = await MailComposer.composeAsync({
					recipients: ['bugs@berty.tech'],
					subject: 'Bug report',
					body: `You can describe your bug here.
						--------------------------------
						${JSON.stringify(
							{
								systemInfo: localSysInfo,
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
		}, [networkConfig, showNotification, t, systemInfoError, systemInfoDone, systemInfo])

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

		const onPressOffGridCommunication = async () => {
			if (Platform.OS === 'ios') {
				await checkProximityPermission({
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
				await checkProximityPermission({
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
								networkConfig?.androidNearby === beapi.account.NetworkConfig.Flag.Enabled
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
		}

		return (
			<View style={{ backgroundColor: colors['secondary-background'], flex: 1, paddingTop: 20 }}>
				<ScrollView
					bounces={false}
					contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
					showsVerticalScrollIndicator={false}
				>
					<ProfileButton />
					<ItemSection>
						{Platform.OS !== 'web' && networkConfig && (
							<>
								<MenuToggleWithIcon
									iconName='bluetooth-outline'
									isToggleOn={getOffGridCommunicationValue()}
									onPress={onPressOffGridCommunication}
								>
									{t('settings.home.proximity-button')}
								</MenuToggleWithIcon>
								<DividerItem />
							</>
						)}
						{pushAvailable && (
							<>
								{pushFilteringAvailable ? (
									<MenuToggleWithIcon
										iconName='bell-outline'
										isToggleOn={
											hasKnownPushServer &&
											numberifyLong(account.mutedUntil) < Date.now() &&
											(permissions.notification === RESULTS.GRANTED ||
												permissions.notification === RESULTS.LIMITED)
										}
										onPress={() => navigate('Settings.Notifications')}
										onToggle={async () =>
											accountPushToggleState({
												account,
												messengerClient: messengerClient,
												protocolClient: protocolClient,
												navigate,
												t,
											})
										}
									>
										{t('settings.home.notifications-button')}
									</MenuToggleWithIcon>
								) : (
									<MenuItemWithIcon
										iconName='bell-outline'
										onPress={() => navigate('Settings.Notifications')}
									>
										{t('settings.home.notifications-button')}
									</MenuItemWithIcon>
								)}
								<DividerItem />
							</>
						)}
						{/*
					<ButtonSettingV2
						text={t('settings.home.contact-convs-button')}
						icon='message-circle'
						onPress={() => navigate('Settings.ContactAndConversations')}
					/>
					*/}
						<MenuItemWithIcon
							iconName='eye-outline'
							onPress={() => navigate('Settings.Appearance')}
						>
							{t('settings.home.appearance-button')}
						</MenuItemWithIcon>
					</ItemSection>
					<ItemSection>
						<MenuItemWithIcon
							iconName='person-outline'
							onPress={() => navigate('Settings.Accounts')}
						>
							{t('settings.home.accounts-button')}
						</MenuItemWithIcon>
						<DividerItem />
						{networkConfig && (
							<MenuItemWithIcon
								iconName='wifi-outline'
								onPress={() => navigate('Settings.Network')}
							>
								{t('settings.home.network-button')}
							</MenuItemWithIcon>
						)}
					</ItemSection>
					<ItemSection>
						<MenuItemWithIcon iconName='email-outline' onPress={generateEmail}>
							{t('settings.home.bug-button')}
						</MenuItemWithIcon>
						<DividerItem />
						<MenuItemWithIcon
							iconName='info-outline'
							onPress={() => navigate('Settings.AboutBerty')}
						>
							{t('settings.home.about-button')}
						</MenuItemWithIcon>
					</ItemSection>
					{systemInfoDone && systemInfoError == null && (
						<ItemSection>
							<MenuItemWithIcon
								iconName='github'
								noRightArrow={true}
								onPress={() => {
									if (devMode) {
										return
									}
									if (nbClick + 1 === 7) {
										console.log('activate devmode')
										dispatch(setDevMode(true))
									}
									setNbClick(nbClick + 1)
									console.log('click: ' + (nbClick + 1))
								}}
							>
								{t('settings.home.version-button', {
									version: systemInfo?.messenger?.process?.version,
								})}
							</MenuItemWithIcon>
							<DividerItem />
							{devMode && (
								<MenuItemWithIcon iconName='code' onPress={() => navigate('Settings.DevTools')}>
									{t('settings.home.devtools-button')}
								</MenuItemWithIcon>
							)}
						</ItemSection>
					)}
				</ScrollView>
			</View>
		)
	},
)
