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
import { Icon } from '@ui-kitten/components'

import beapi from '@berty/api'
import { ScreenFC, useNavigation } from '@berty/navigation'
import { accountService, useMountEffect, useThemeColor } from '@berty/store'
import { useStyles } from '@berty/contexts/styles'
import { useAppDispatch, useAppSelector, useCreateNewAccount } from '@berty/hooks'
import {
	addToBootstrap,
	addToRendezvous,
	disableEveryNodeLists,
	enableEveryNodeLists,
	modifyFromBootstrap,
	modifyFromRendezvous,
	modifyFromStaticRelay,
	removeFromBootstrap,
	removeFromRendezvous,
	removeFromStaticRelay,
	selectBootstrap,
	selectEditedNetworkConfig,
	selectRendezvous,
	selectStaticRelay,
	setCurrentNetworkConfig,
	toggleFromBootstrap,
	toggleFromRendezvous,
	toggleFromStaticRelay,
} from '@berty/redux/reducers/networkConfig.reducer'

import { ButtonSetting } from '@berty/components/shared-components'
import { Toggle } from '@berty/components/shared-components/Toggle'
import {
	checkBlePermission,
	getPermissionStatus,
	PermissionType,
} from '@berty/rnutil/checkPermissions'
import {
	Accordion,
	AccordionAddItem,
	AccordionItem,
	AccordionRef,
} from '@berty/screens/onboarding/CustomModeSettings/components/Accordion'
import { AccordionEdit } from '@berty/components/modals/AccordionEdit.modal'
import { AccordionAdd } from '@berty/components/modals/AccordionAdd.modal'
import { useModal } from '@berty/components/providers/modal.provider'
import { useDispatch } from 'react-redux'
import { UnifiedText } from '@berty/components/shared-components/UnifiedText'
import { RESULTS } from 'react-native-permissions'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

type AccordionRefsType = {
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
	const colors = useThemeColor()
	const { t } = useTranslation()
	const { navigate } = useNavigation()
	const dispatch = useDispatch()
	const currentNetworkConfig = useAppSelector(selectEditedNetworkConfig)

	return (
		<View>
			<ButtonSetting
				name={t('onboarding.custom-mode.settings.off-grid.ble-button')}
				color={colors['main-text']}
				icon='expert-ble'
				iconPack='custom'
				iconColor='#6E6DFF'
				actionIconColor={colors['main-text']}
				backgroundColor={colors['input-background']}
				toggled
				toggleStatus='secondary'
				varToggle={currentNetworkConfig?.bluetoothLe === beapi.account.NetworkConfig.Flag.Enabled}
				actionToggle={async () => {
					await checkBlePermission({
						setNetworkConfig: async (newConfig: beapi.account.INetworkConfig) => {
							dispatch(setCurrentNetworkConfig(newConfig))
						},
						networkConfig: currentNetworkConfig,
						changedKey: ['bluetoothLe'],
						navigate,
					})
				}}
			/>
			{Platform.OS === 'ios' && (
				<ButtonSetting
					name={t('onboarding.custom-mode.settings.off-grid.mc-button')}
					color={colors['main-text']}
					icon='expert-ble'
					iconPack='custom'
					iconColor='#6E6DFF'
					actionIconColor={colors['main-text']}
					backgroundColor={colors['input-background']}
					toggled
					toggleStatus='secondary'
					varToggle={
						currentNetworkConfig?.appleMultipeerConnectivity ===
						beapi.account.NetworkConfig.Flag.Enabled
					}
					actionToggle={async () => {
						await checkBlePermission({
							setNetworkConfig: async (newConfig: beapi.account.INetworkConfig) => {
								dispatch(setCurrentNetworkConfig(newConfig))
							},
							networkConfig: currentNetworkConfig,
							changedKey: ['appleMultipeerConnectivity'],
							navigate,
						})
					}}
				/>
			)}
			{Platform.OS === 'android' && (
				<ButtonSetting
					name={t('onboarding.custom-mode.settings.off-grid.nearby-button')}
					color={colors['main-text']}
					icon='expert-ble'
					iconPack='custom'
					iconColor='#6E6DFF'
					actionIconColor={colors['main-text']}
					backgroundColor={colors['input-background']}
					toggled
					toggleStatus='secondary'
					varToggle={
						currentNetworkConfig?.androidNearby === beapi.account.NetworkConfig.Flag.Enabled
					}
					actionToggle={async () => {
						await checkBlePermission({
							setNetworkConfig: async (newConfig: beapi.account.INetworkConfig) => {
								dispatch(setCurrentNetworkConfig(newConfig))
							},
							networkConfig: currentNetworkConfig,
							changedKey: ['androidNearby'],
							navigate,
						})
					}}
				/>
			)}
			<ButtonSetting
				name={t('onboarding.custom-mode.settings.off-grid.mdns-button')}
				color={colors['main-text']}
				icon='expert-setting'
				iconPack='custom'
				iconColor='#6E6DFF'
				actionIconColor={colors['main-text']}
				backgroundColor={colors['input-background']}
				toggled
				toggleStatus='secondary'
				varToggle={currentNetworkConfig?.mdns === beapi.account.NetworkConfig.Flag.Enabled}
				actionToggle={async () => {
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
			/>
		</View>
	)
}

const Routing: React.FC<{ accordionRefs: AccordionRefsType }> = ({ accordionRefs }) => {
	const colors = useThemeColor()
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const { hide, show } = useModal()
	const rendezvous = useAppSelector(selectRendezvous)
	const currentNetworkConfig = useAppSelector(selectEditedNetworkConfig)

	return (
		<View>
			<ButtonSetting
				name={t('onboarding.custom-mode.settings.routing.dht-button')}
				color={colors['main-text']}
				icon='expert-setting'
				iconPack='custom'
				iconColor='#6E6DFF'
				actionIconColor={colors['main-text']}
				backgroundColor={colors['input-background']}
				toggled
				toggleStatus='secondary'
				varToggle={currentNetworkConfig?.dht === beapi.account.NetworkConfig.DHTFlag.DHTClient}
				actionToggle={async () => {
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
			/>
			<Accordion
				title={t('onboarding.custom-mode.settings.routing.rdvp-button')}
				icon='privacy'
				ref={accordionRefs.rdvp}
			>
				{(rendezvous || []).map(({ alias, url, isEnabled, isEditable }, index) => (
					<AccordionItem
						key={`rendezvous-item-${index}`}
						toggle={isEnabled}
						value={alias}
						onToggleChange={() => dispatch(toggleFromRendezvous(url))}
						onPressModify={
							isEditable
								? () =>
										show(
											<AccordionEdit
												title={t('onboarding.custom-mode.settings.modals.edit.title.rdvp')}
												onEdit={data => {
													dispatch(modifyFromRendezvous({ url, changes: data }))
													hide()
												}}
												onDelete={() => {
													dispatch(removeFromRendezvous(url))
													hide()
												}}
												defaultAlias={alias}
												defaultUrl={url}
												alreadyExistingUrls={rendezvous
													.map(({ url }) => url)
													.filter((url): url is string => url !== undefined)}
												alreadyExistingAliases={rendezvous
													.map(({ alias }) => alias)
													.filter((alias): alias is string => alias !== undefined)}
											/>,
										)
								: undefined
						}
					/>
				))}
				<AccordionAddItem
					onPress={() =>
						show(
							<AccordionAdd
								title={t('onboarding.custom-mode.settings.modals.add.title.rdvp')}
								onSubmit={data => {
									dispatch(addToRendezvous(data))
									hide()
								}}
								alreadyExistingAliases={rendezvous
									.map(({ alias }) => alias)
									.filter((alias): alias is string => alias !== undefined)}
								alreadyExistingUrls={rendezvous
									.map(({ url }) => url)
									.filter((url): url is string => url !== undefined)}
							/>,
						)
					}
				/>
			</Accordion>
		</View>
	)
}

const Access: React.FC<{ accordionRefs: AccordionRefsType }> = ({ accordionRefs }) => {
	// const colors = useThemeColor()
	// const navigation = useNavigation()
	// const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const { t } = useTranslation()
	const { hide, show } = useModal()
	const bootstrap = useAppSelector(selectBootstrap)
	const staticRelay = useAppSelector(selectStaticRelay)

	return (
		<View>
			<Accordion
				title={t('onboarding.custom-mode.settings.access.relay-button')}
				icon='earth'
				ref={accordionRefs.relay}
			>
				{(staticRelay || []).map(({ alias, url, isEnabled, isEditable }, index) => (
					<AccordionItem
						key={`rendezvous-item-${index}`}
						toggle={isEnabled}
						value={alias}
						onToggleChange={() => dispatch(toggleFromStaticRelay(url))}
						onPressModify={
							isEditable
								? () =>
										show(
											<AccordionEdit
												title={t('onboarding.custom-mode.settings.modals.edit.title.relay')}
												onEdit={data => {
													dispatch(modifyFromStaticRelay({ url, changes: data }))
													hide()
												}}
												onDelete={() => {
													dispatch(removeFromStaticRelay(url))
													hide()
												}}
												defaultAlias={alias}
												defaultUrl={url}
												alreadyExistingUrls={staticRelay
													.map(({ url }) => url)
													.filter((url): url is string => url !== undefined)}
												alreadyExistingAliases={staticRelay
													.map(({ alias }) => alias)
													.filter((alias): alias is string => alias !== undefined)}
											/>,
										)
								: undefined
						}
					/>
				))}
				<AccordionAddItem
					onPress={() =>
						show(
							<AccordionAdd
								title={t('onboarding.custom-mode.settings.modals.add.title.relay')}
								onSubmit={data => {
									dispatch(addToRendezvous(data))
									hide()
								}}
								alreadyExistingAliases={staticRelay
									.map(({ alias }) => alias)
									.filter((alias): alias is string => alias !== undefined)}
								alreadyExistingUrls={staticRelay
									.map(({ url }) => url)
									.filter((url): url is string => url !== undefined)}
							/>,
						)
					}
				/>
			</Accordion>
			<Accordion
				title={t('onboarding.custom-mode.settings.access.bootstrap-button')}
				icon='earth'
				ref={accordionRefs.bootstrap}
			>
				{(bootstrap || []).map(({ alias, url, isEnabled, isEditable }, index) => (
					<AccordionItem
						key={`rendezvous-item-${index}`}
						toggle={isEnabled}
						value={alias}
						onToggleChange={() => dispatch(toggleFromBootstrap(url))}
						onPressModify={
							isEditable
								? () =>
										show(
											<AccordionEdit
												title={t('onboarding.custom-mode.settings.modals.edit.title.bootstrap')}
												onEdit={data => {
													dispatch(modifyFromBootstrap({ url, changes: data }))
													hide()
												}}
												onDelete={() => {
													dispatch(removeFromBootstrap(url))
													hide()
												}}
												defaultAlias={alias}
												defaultUrl={url}
												alreadyExistingUrls={bootstrap
													.map(({ url }) => url)
													.filter((url): url is string => url !== undefined)}
												alreadyExistingAliases={bootstrap
													.map(({ alias }) => alias)
													.filter((alias): alias is string => alias !== undefined)}
											/>,
										)
								: undefined
						}
					/>
				))}
				<AccordionAddItem
					onPress={() =>
						show(
							<AccordionAdd
								title={t('onboarding.custom-mode.settings.modals.add.title.bootstrap')}
								onSubmit={data => {
									dispatch(addToBootstrap(data))
									hide()
								}}
								alreadyExistingAliases={bootstrap
									.map(({ alias }) => alias)
									.filter((alias): alias is string => alias !== undefined)}
								alreadyExistingUrls={bootstrap
									.map(({ url }) => url)
									.filter((url): url is string => url !== undefined)}
							/>,
						)
					}
				/>
			</Accordion>
			{/* <ButtonSetting
				name={t('onboarding.custom-mode.settings.access.replication-button')}
				icon='earth'
				iconPack='custom'
				color={colors['main-text']}
				iconColor='#6E6DFF'
				actionIconColor={colors['main-text']}
				backgroundColor={colors['input-background']}
				onPress={() => navigation.navigate('Settings.NetworkMap')}
			/> */}
		</View>
	)
}

const CustomConfig: React.FC<{ accordionRefs: AccordionRefsType }> = ({ accordionRefs }) => {
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
				<Access accordionRefs={accordionRefs} />
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

const EnableDisableAll: React.FC<{ accordionRefs: AccordionRefsType }> = ({ accordionRefs }) => {
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
				<Toggle
					checked={isToggled}
					status='third'
					onChange={async () => {
						const toToggled = !isToggled
						setIsToggled(toToggled)
						if (toToggled) {
							if (Platform.OS === 'ios') {
								// TODO: dig why (on iOS) when i accept the request the status is unavailable
								const status = await getPermissionStatus(PermissionType.proximity)
								status === RESULTS.UNAVAILABLE
									? dispatch(setCurrentNetworkConfig(enableWithoutBle))
									: await checkBlePermission({
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
								await checkBlePermission({
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
	const accordionRefs: AccordionRefsType = {
		relay: createRef<AccordionRef>(),
		rdvp: createRef<AccordionRef>(),
		bootstrap: createRef<AccordionRef>(),
	}

	useMountEffect(() => {
		const getNetworkConfig = async () => {
			// with an empty accountId the function returns default config
			const defaultConfig = await accountService.networkConfigGet({ accountId: '' })
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
