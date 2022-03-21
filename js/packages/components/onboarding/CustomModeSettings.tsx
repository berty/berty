import React from 'react'

import { Icon } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import {
	SafeAreaView,
	ScrollView,
	StatusBar,
	Text,
	TouchableOpacity,
	View,
	Platform,
	ActivityIndicator,
} from 'react-native'
import { useDispatch } from 'react-redux'

import beapi from '@berty-tech/api'
import { ScreenFC, useNavigation } from '@berty-tech/navigation'
import { useAppDispatch, useAppSelector } from '@berty-tech/react-redux'
import {
	addToBootstrap,
	addToRendezvous,
	modifyFromBootstrap,
	modifyFromRendezvous,
	modifyFromStaticRelay,
	removeFromBootstrap,
	removeFromRendezvous,
	removeFromStaticRelay,
	selectBootstrap,
	selectCurrentNetworkConfig,
	selectParsedLocalNetworkConfig,
	selectRendezvous,
	selectStaticRelay,
	setCurrentNetworkConfig,
	toggleFromBootstrap,
	toggleFromRendezvous,
	toggleFromStaticRelay,
} from '@berty-tech/redux/reducers/networkConfig.reducer'
import { checkBlePermission } from '@berty-tech/rnutil/checkPermissions'
import {
	accountService,
	useMessengerContext,
	useMountEffect,
	useThemeColor,
} from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'

import { AccordionAdd } from '../modals/AccordionAdd.modal'
import { AccordionEdit } from '../modals/AccordionEdit.modal'
import { useModal } from '../providers/modal.provider'
import { ButtonSetting } from '../shared-components'
import { Toggle } from '../shared-components/Toggle'
import { Accordion, AccordionAddItem, AccordionItem } from './OnBoardingAccorion'

const ConfigPart: React.FC<{
	title: string
	icon: string
	iconSize?: number
}> = ({ title, icon, iconSize = 40 }) => {
	const [{ padding, text, margin, border }, { scaleSize }] = useStyles()
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
					<Text
						style={[
							text.size.big,
							{
								fontFamily: 'Open Sans',
								fontWeight: '700',
								color: colors['background-header'],
								alignSelf: 'center',
							},
						]}
					>
						{title}
					</Text>
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
	const currentNetworkConfig = useAppSelector(selectCurrentNetworkConfig)

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

const Routing: React.FC = () => {
	const colors = useThemeColor()
	const { t } = useTranslation()
	const dispatch = useAppDispatch()
	const { hide, show } = useModal()
	const rendezvous = useAppSelector(selectRendezvous)
	const currentNetworkConfig = useAppSelector(selectCurrentNetworkConfig)

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
			<Accordion title={t('onboarding.custom-mode.settings.routing.rdvp-button')} icon='privacy'>
				{(rendezvous || []).map(({ alias, url, isEnabled, isEditable }, index) => (
					<AccordionItem
						key={`rendezvous-item-${index}`}
						toggle={isEnabled}
						value={alias}
						onToggleChange={isEditable ? () => dispatch(toggleFromRendezvous(url)) : undefined}
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

const Access: React.FC = () => {
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
			<Accordion title={t('onboarding.custom-mode.settings.access.relay-button')} icon='earth'>
				{(staticRelay || []).map(({ alias, url, isEnabled, isEditable }, index) => (
					<AccordionItem
						key={`rendezvous-item-${index}`}
						toggle={isEnabled}
						value={alias}
						onToggleChange={isEditable ? () => dispatch(toggleFromStaticRelay(url)) : undefined}
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
			<Accordion title={t('onboarding.custom-mode.settings.access.bootstrap-button')} icon='earth'>
				{(staticRelay || []).map(({ alias, url, isEnabled, isEditable }, index) => (
					<AccordionItem
						key={`rendezvous-item-${index}`}
						toggle={isEnabled}
						value={alias}
						onToggleChange={isEditable ? () => dispatch(toggleFromBootstrap(url)) : undefined}
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

const CustomConfig: React.FC = () => {
	const [{ margin, padding, border }] = useStyles()
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
				<Routing />
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
				<Access />
			</View>
		</View>
	)
}

const ApplyChanges: React.FC = () => {
	const [{ padding, border, text }] = useStyles()
	const colors = useThemeColor()
	const ctx = useMessengerContext()
	const [isPressed, setIsPressed] = React.useState<boolean>(false)
	const { t } = useTranslation()
	const currentNetworkConfig = useAppSelector(selectCurrentNetworkConfig)
	const parsedLocalNetworkConfig = useAppSelector(selectParsedLocalNetworkConfig)

	return (
		<View style={{ alignSelf: 'center', flex: 1 }}>
			<View style={[padding.medium]}>
				<TouchableOpacity
					onPress={async () => {
						if (currentNetworkConfig) {
							setIsPressed(true)
							console.log({ parsedLocalNetworkConfig })
							await ctx.createNewAccount(parsedLocalNetworkConfig)
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
						<Text
							style={[
								text.size.medium,
								{ fontFamily: 'Open Sans', fontWeight: '700', color: colors['reverted-main-text'] },
							]}
						>
							{t('onboarding.custom-mode.settings.accept-button')}
						</Text>
					)}
				</TouchableOpacity>
			</View>
		</View>
	)
}

const EnableDisableAll: React.FC = () => {
	const [{ padding, border }] = useStyles()
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
			<Text style={{ fontFamily: 'Open Sans', color: colors['reverted-main-text'] }}>
				{t('onboarding.custom-mode.settings.all-button')}
			</Text>
			<View style={[padding.small]}>
				<Toggle
					checked={isToggled}
					status='third'
					onChange={async () => {
						const toToggled = !isToggled
						setIsToggled(toToggled)
						if (toToggled) {
							if (Platform.OS === 'ios') {
								await checkBlePermission({
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
						} else {
							dispatch(setCurrentNetworkConfig(disable))
						}
					}}
				/>
			</View>
		</View>
	)
}

export const CustomModeSettings: ScreenFC<'Onboarding.CustomModeSettings'> = () => {
	const colors = useThemeColor()
	const [{ padding }] = useStyles()
	const dispatch = useAppDispatch()

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
				<CustomConfig />
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<EnableDisableAll />
					<ApplyChanges />
				</View>
			</ScrollView>
		</SafeAreaView>
	)
}
