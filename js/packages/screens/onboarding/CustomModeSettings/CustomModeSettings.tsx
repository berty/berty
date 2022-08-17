import { Icon } from '@ui-kitten/components'
import React, { createRef, RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import {
	SafeAreaView,
	ScrollView,
	StatusBar,
	TouchableOpacity,
	View,
	Platform,
	ActivityIndicator,
} from 'react-native'
import { RESULTS } from 'react-native-permissions'
import { useDispatch } from 'react-redux'

import beapi from '@berty/api'
import {
	AltToggle,
	BootstrapDropdown,
	FloatingMenuToggleAlt,
	RelayDropdown,
	RendezvousDropdown,
} from '@berty/components'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useStyles } from '@berty/contexts/styles'
import {
	useAppDispatch,
	useAppSelector,
	useCreateNewAccount,
	useMountEffect,
	useThemeColor,
} from '@berty/hooks'
import { ScreenFC, useNavigation } from '@berty/navigation'
import {
	disableEveryNodeLists,
	enableEveryNodeLists,
	selectEditedNetworkConfig,
	setCurrentNetworkConfig,
} from '@berty/redux/reducers/networkConfig.reducer'
import { accountClient } from '@berty/utils/accounts/accountClient'
import { checkProximityPermission } from '@berty/utils/permissions/checkPermissions'
import { getPermissions, PermissionType } from '@berty/utils/permissions/permissions'

interface AccordionRef {
	open: () => void
	close: () => void
}

interface AccordionRefs {
	relay: RefObject<AccordionRef>
	rdvp: RefObject<AccordionRef>
	bootstrap: RefObject<AccordionRef>
}

const ConfigPart: React.FC<{
	title: string
	icon: string
	iconSize?: number
}> = ({ title, icon, iconSize = 40 }) => {
	const { padding, text, margin, border } = useStyles()
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()

	return (
		<View
			style={[
				padding.vertical.small,
				margin.horizontal.medium,
				border.radius.medium,
				padding.horizontal.medium,
				{ flex: 1 },
			]}
		>
			<View
				style={{
					flex: 1,
					flexDirection: 'row',
					alignItems: 'center',
				}}
			>
				<View style={{ flex: 1 }}>
					<Icon
						width={iconSize * scaleSize}
						height={iconSize * scaleSize}
						name={icon}
						pack='custom'
						fill={colors['background-header']}
					/>
				</View>
				<View style={{ flex: 6, justifyContent: 'center' }}>
					<UnifiedText
						style={[
							text.size.big,
							text.bold,
							{
								color: colors['background-header'],
								alignSelf: 'center',
							},
						]}
					>
						{title}
					</UnifiedText>
				</View>
				<TouchableOpacity
					style={{ flex: 1 }}
					onPress={() => {
						// TODO navigate to the help page
					}}
				>
					<Icon
						width={30 * scaleSize}
						height={30 * scaleSize}
						name='info-outline'
						fill={colors['background-header']}
					/>
				</TouchableOpacity>
			</View>
		</View>
	)
}

const Proximity: React.FC = () => {
	const { t } = useTranslation()
	const { navigate } = useNavigation()
	const dispatch = useDispatch()
	const currentNetworkConfig = useAppSelector(selectEditedNetworkConfig)

	return (
		<View>
			<FloatingMenuToggleAlt
				pack='custom'
				iconName='expert-ble'
				isToggleOn={currentNetworkConfig?.bluetoothLe === beapi.account.NetworkConfig.Flag.Enabled}
				onPress={async () => {
					await checkProximityPermission({
						setNetworkConfig: async (newConfig: beapi.account.INetworkConfig) => {
							dispatch(setCurrentNetworkConfig(newConfig))
						},
						networkConfig: currentNetworkConfig,
						changedKey: ['bluetoothLe'],
						navigate,
					})
				}}
			>
				{t('onboarding.custom-mode.settings.off-grid.ble-button')}
			</FloatingMenuToggleAlt>
			{Platform.OS === 'ios' && (
				<FloatingMenuToggleAlt
					pack='custom'
					iconName='expert-ble'
					isToggleOn={
						currentNetworkConfig?.appleMultipeerConnectivity ===
						beapi.account.NetworkConfig.Flag.Enabled
					}
					onPress={async () => {
						await checkProximityPermission({
							setNetworkConfig: async (newConfig: beapi.account.INetworkConfig) => {
								dispatch(setCurrentNetworkConfig(newConfig))
							},
							networkConfig: currentNetworkConfig,
							changedKey: ['appleMultipeerConnectivity'],
							navigate,
						})
					}}
				>
					{t('onboarding.custom-mode.settings.off-grid.mc-button')}
				</FloatingMenuToggleAlt>
			)}
			{Platform.OS === 'android' && (
				<FloatingMenuToggleAlt
					pack='custom'
					iconName='expert-ble'
					isToggleOn={
						currentNetworkConfig?.androidNearby === beapi.account.NetworkConfig.Flag.Enabled
					}
					onPress={async () => {
						await checkProximityPermission({
							setNetworkConfig: async (newConfig: beapi.account.INetworkConfig) => {
								dispatch(setCurrentNetworkConfig(newConfig))
							},
							networkConfig: currentNetworkConfig,
							changedKey: ['androidNearby'],
							navigate,
						})
					}}
				>
					{t('onboarding.custom-mode.settings.off-grid.nearby-button')}
				</FloatingMenuToggleAlt>
			)}
			<FloatingMenuToggleAlt
				pack='custom'
				iconName='expert-setting'
				isToggleOn={currentNetworkConfig?.mdns === beapi.account.NetworkConfig.Flag.Enabled}
				onPress={async () => {
					dispatch(
						setCurrentNetworkConfig({
							...currentNetworkConfig,
							mdns:
								currentNetworkConfig?.mdns === beapi.account.NetworkConfig.Flag.Enabled
									? beapi.account.NetworkConfig.Flag.Disabled
									: beapi.account.NetworkConfig.Flag.Enabled,
						}),
					)
				}}
			>
				{t('onboarding.custom-mode.settings.off-grid.mdns-button')}
			</FloatingMenuToggleAlt>
		</View>
	)
}

const Routing: React.FC<{ accordionRefs: AccordionRefs }> = ({ accordionRefs }) => {
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const currentNetworkConfig = useAppSelector(selectEditedNetworkConfig)

	return (
		<View>
			<FloatingMenuToggleAlt
				pack='custom'
				iconName='expert-setting'
				isToggleOn={currentNetworkConfig?.dht === beapi.account.NetworkConfig.DHTFlag.DHTClient}
				onPress={async () => {
					dispatch(
						setCurrentNetworkConfig({
							...currentNetworkConfig,
							dht:
								currentNetworkConfig?.dht === beapi.account.NetworkConfig.DHTFlag.DHTClient
									? beapi.account.NetworkConfig.DHTFlag.DHTDisabled
									: beapi.account.NetworkConfig.DHTFlag.DHTClient,
						}),
					)
				}}
			>
				{t('onboarding.custom-mode.settings.routing.dht-button')}
			</FloatingMenuToggleAlt>

			<RendezvousDropdown ref={accordionRefs.rdvp} />
		</View>
	)
}

const CustomConfig: React.FC<{ accordionRefs: AccordionRefs }> = ({ accordionRefs }) => {
	const { margin, padding, border } = useStyles()
	const { t } = useTranslation()
	const colors = useThemeColor()

	return (
		<View>
			<View
				style={[
					padding.medium,
					border.radius.medium,
					{ backgroundColor: colors['main-background'] },
				]}
			>
				<ConfigPart title={t('onboarding.custom-mode.settings.off-grid.title')} icon='proximity' />
				<Proximity />
			</View>
			<View
				style={[
					margin.top.medium,
					padding.medium,
					border.radius.medium,
					{ backgroundColor: colors['main-background'] },
				]}
			>
				<ConfigPart title={t('onboarding.custom-mode.settings.routing.title')} icon='peer' />
				<Routing accordionRefs={accordionRefs} />
			</View>

			<View
				style={[
					margin.top.medium,
					padding.medium,
					border.radius.medium,
					{ backgroundColor: colors['main-background'] },
				]}
			>
				<ConfigPart
					title={t('onboarding.custom-mode.settings.access.title')}
					icon='services'
					iconSize={50}
				/>
				<RelayDropdown ref={accordionRefs.relay} />
				<BootstrapDropdown ref={accordionRefs.bootstrap} />
			</View>
		</View>
	)
}

const ApplyChanges: React.FC = () => {
	const { padding, border, text } = useStyles()
	const colors = useThemeColor()
	const [isPressed, setIsPressed] = React.useState<boolean>(false)
	const { t } = useTranslation()
	const currentNetworkConfig = useAppSelector(selectEditedNetworkConfig)
	const createNewAccount = useCreateNewAccount()

	return (
		<View style={{ alignSelf: 'center', flex: 1 }}>
			<View style={[padding.medium]}>
				<TouchableOpacity
					onPress={async () => {
						if (currentNetworkConfig) {
							setIsPressed(true)
							await createNewAccount(currentNetworkConfig)
						}
					}}
					style={[
						padding.medium,
						border.radius.medium,
						{ backgroundColor: '#3F49EA', alignItems: 'center' },
					]}
				>
					{isPressed ? (
						<ActivityIndicator color={colors['reverted-main-text']} />
					) : (
						<UnifiedText style={[text.bold, { color: colors['reverted-main-text'] }]}>
							{t('onboarding.custom-mode.settings.accept-button')}
						</UnifiedText>
					)}
				</TouchableOpacity>
			</View>
		</View>
	)
}

const EnableDisableAll: React.FC<{ accordionRefs: AccordionRefs }> = ({ accordionRefs }) => {
	const { padding, border } = useStyles()
	const colors = useThemeColor()
	const [isToggled, setIsToggled] = React.useState(false)
	const dispatch = useAppDispatch()
	const { t } = useTranslation()
	const { navigate } = useNavigation()

	const enableWithoutBle: beapi.account.INetworkConfig = {
		bootstrap: [':default:'],
		rendezvous: [':default:'],
		staticRelay: [':default:'],
		dht: beapi.account.NetworkConfig.DHTFlag.DHTClient,
		mdns: beapi.account.NetworkConfig.Flag.Enabled,
		bluetoothLe: beapi.account.NetworkConfig.Flag.Disabled,
		appleMultipeerConnectivity: beapi.account.NetworkConfig.Flag.Disabled,
		androidNearby: beapi.account.NetworkConfig.Flag.Disabled,
	}

	const disable: beapi.account.INetworkConfig = {
		bootstrap: [],
		rendezvous: [],
		staticRelay: [],
		dht: beapi.account.NetworkConfig.DHTFlag.DHTUndefined,
		bluetoothLe: beapi.account.NetworkConfig.Flag.Disabled,
		appleMultipeerConnectivity: beapi.account.NetworkConfig.Flag.Disabled,
		androidNearby: beapi.account.NetworkConfig.Flag.Disabled,
		mdns: beapi.account.NetworkConfig.Flag.Disabled,
	}

	return (
		<View
			style={[
				padding.scale(2),
				border.radius.medium,
				{
					flexDirection: 'row',
					alignItems: 'center',
				},
			]}
		>
			<UnifiedText style={{ color: colors['reverted-main-text'] }}>
				{t('onboarding.custom-mode.settings.all-button')}
			</UnifiedText>
			<View style={[padding.small]}>
				<AltToggle
					checked={isToggled}
					accessibilityLabel={t('onboarding.custom-mode.settings.all-button')}
					onChange={async () => {
						const toToggled = !isToggled
						setIsToggled(toToggled)
						if (toToggled) {
							if (Platform.OS === 'ios') {
								// TODO: dig why (on iOS) when i accept the request the status is unavailable
								const status = (await getPermissions())[PermissionType.proximity]
								status === RESULTS.UNAVAILABLE
									? dispatch(setCurrentNetworkConfig(enableWithoutBle))
									: await checkProximityPermission({
											setNetworkConfig: async (newConfig: beapi.account.INetworkConfig) => {
												dispatch(setCurrentNetworkConfig(newConfig))
											},
											networkConfig: enableWithoutBle,
											changedKey: ['bluetoothLe', 'appleMultipeerConnectivity'],
											navigate,
											deny: async () => {
												dispatch(setCurrentNetworkConfig(enableWithoutBle))
											},
									  })
							}
							if (Platform.OS === 'android') {
								await checkProximityPermission({
									setNetworkConfig: async (newConfig: beapi.account.INetworkConfig) => {
										dispatch(setCurrentNetworkConfig(newConfig))
									},
									networkConfig: enableWithoutBle,
									changedKey: ['bluetoothLe', 'androidNearby'],
									navigate,
									deny: async () => {
										dispatch(setCurrentNetworkConfig(enableWithoutBle))
									},
								})
							}

							Object.values(accordionRefs).forEach(ref => ref.current?.open())
							setTimeout(() => dispatch(enableEveryNodeLists()), 300)
						} else {
							dispatch(setCurrentNetworkConfig(disable))
							dispatch(disableEveryNodeLists())
						}
					}}
				/>
			</View>
		</View>
	)
}

export const CustomModeSettings: ScreenFC<'Onboarding.CustomModeSettings'> = () => {
	const colors = useThemeColor()
	const { padding } = useStyles()
	const dispatch = useAppDispatch()
	const accordionRefs: AccordionRefs = {
		relay: createRef<AccordionRef>(),
		rdvp: createRef<AccordionRef>(),
		bootstrap: createRef<AccordionRef>(),
	}

	useMountEffect(() => {
		const getNetworkConfig = async () => {
			// with an empty accountId the function returns default config
			const defaultConfig = await accountClient.networkConfigGet({ accountId: '' })
			if (defaultConfig.currentConfig) {
				dispatch(setCurrentNetworkConfig(defaultConfig?.currentConfig))
			}
		}

		getNetworkConfig()
	})

	return (
		<SafeAreaView style={{ backgroundColor: colors['background-header'], flex: 1 }}>
			<StatusBar barStyle='light-content' />
			<ScrollView
				bounces={false}
				contentContainerStyle={[padding.medium]}
				showsVerticalScrollIndicator={false}
			>
				<CustomConfig accordionRefs={accordionRefs} />
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<EnableDisableAll accordionRefs={accordionRefs} />
					<ApplyChanges />
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}
