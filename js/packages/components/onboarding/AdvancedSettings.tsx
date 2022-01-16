import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import {
	Image,
	SafeAreaView,
	ScrollView,
	StatusBar,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	Platform,
} from 'react-native'
import { withInAppNotification } from 'react-native-in-app-notification'
import { Icon } from '@ui-kitten/components'
import { RESULTS, PERMISSIONS, check } from 'react-native-permissions'

import beapi from '@berty-tech/api'
import NetworkOptionsBg from '@berty-tech/assets/network_options_bg.png'
import { ScreenFC, useNavigation } from '@berty-tech/navigation'
import rnutil from '@berty-tech/rnutil'
import {
	accountService,
	GlobalPersistentOptionsKeys,
	storageGet,
	useMessengerContext,
	useMountEffect,
	useThemeColor,
	serviceTypes,
	useAccountServices,
	useMessengerClient,
} from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'
import { useAccount } from '@berty-tech/react-redux'

import { showNeedRestartNotification } from '../helpers'
import { ButtonSetting } from '../shared-components'
import { DropDownPicker, Item } from '../shared-components/DropDownPicker'
import { CreateAccountBox } from './CreateAccountBox'
import { useSelector } from 'react-redux'
import { selectSelectedAccount } from '@berty-tech/redux/reducers/ui.reducer'

const TitleBox: React.FC<{
	title: string
	desc: string
	icon: string
	iconSize?: number
	pack?: string
}> = ({ title, desc, icon, iconSize = 70, pack = null }) => {
	const [{ padding, text, border, margin }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	return (
		<View
			style={[
				padding.medium,
				margin.horizontal.medium,
				border.radius.medium,
				{
					backgroundColor: '#1B1C2B',
					flexDirection: 'row',
					alignItems: 'center',
				},
			]}
		>
			<View
				style={[padding.medium, { flexDirection: 'column', justifyContent: 'center', flex: 1 }]}
			>
				<Text
					style={[
						text.size.big,
						{ fontFamily: 'Open Sans', fontWeight: '700', color: colors['reverted-main-text'] },
					]}
				>
					{title}
				</Text>
				<Text
					style={[
						margin.top.small,
						text.size.medium,
						{ fontFamily: 'Open Sans', fontWeight: '600', color: colors['reverted-main-text'] },
					]}
				>
					{desc}
				</Text>
			</View>
			<Icon
				fill={colors['reverted-main-text']}
				width={iconSize * scaleSize}
				height={iconSize * scaleSize}
				name={icon}
				pack={pack ? pack : undefined}
			/>
		</View>
	)
}

const MoreAbout: React.FC<{}> = () => {
	const colors = useThemeColor()
	const [{ padding, margin, text }] = useStyles()
	const { t } = useTranslation()
	return (
		<View style={[margin.top.large]}>
			<View style={{ alignItems: 'center', flex: 1 }}>
				<Icon
					name='question-mark-circle'
					fill={colors['reverted-main-text']}
					width={40}
					height={40}
				/>
				<Text
					style={[
						text.size.large,
						margin.top.medium,
						{ fontFamily: 'Open Sans', fontWeight: '700', color: colors['reverted-main-text'] },
					]}
				>
					{t('onboarding.advanced-settings.more-about.title')}
				</Text>
			</View>
			<View style={[padding.horizontal.medium, margin.top.medium]}>
				<Text
					style={[
						text.size.medium,
						margin.top.medium,
						{ fontFamily: 'Open Sans', fontWeight: '600', color: colors['reverted-main-text'] },
					]}
				>
					{t('onboarding.advanced-settings.more-about.first-paragraph')}
				</Text>
				<Text
					style={[
						text.size.medium,
						margin.top.medium,
						{ fontFamily: 'Open Sans', fontWeight: '600', color: colors['reverted-main-text'] },
					]}
				>
					{t('onboarding.advanced-settings.more-about.second-paragraph')}
				</Text>
				<Text
					style={[
						text.size.medium,
						margin.top.medium,
						{ fontFamily: 'Open Sans', fontWeight: '600', color: colors['reverted-main-text'] },
					]}
				>
					{t('onboarding.advanced-settings.more-about.third-paragraph')}
				</Text>
			</View>
		</View>
	)
}

const ConfigPart: React.FC<{
	number: number
	title: string
	icon: string
	url: string
	iconSize?: number
}> = ({ number, title, icon, url, iconSize = 40 }) => {
	const [{ padding, text, margin, border }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const { t } = useTranslation()
	const { navigate } = useNavigation()

	return (
		<View
			style={[
				padding.vertical.small,
				margin.horizontal.medium,
				margin.top.medium,
				border.radius.medium,
				padding.horizontal.medium,
				{ flex: 1, backgroundColor: '#1B1C2B', height: 80 * scaleSize },
			]}
		>
			<View
				style={{
					flex: 1,
					flexDirection: 'row',
					alignItems: 'center',
				}}
			>
				<Text
					style={[
						text.size.big,
						{
							fontFamily: 'Open Sans',
							fontWeight: '700',
							color: colors['reverted-main-text'],
							flex: 1,
						},
					]}
				>{`#${number}`}</Text>
				<View style={{ flex: 6, justifyContent: 'center' }}>
					<Text
						style={[
							text.size.big,
							{
								fontFamily: 'Open Sans',
								fontWeight: '700',
								color: colors['reverted-main-text'],
								alignSelf: 'center',
							},
						]}
					>
						{title}
					</Text>
				</View>
				<View style={{ flex: 1 }}>
					<Icon
						width={iconSize * scaleSize}
						height={iconSize * scaleSize}
						name={icon}
						pack='custom'
						fill={colors['reverted-main-text']}
					/>
				</View>
			</View>
			<TouchableOpacity
				style={{ flexDirection: 'row', alignItems: 'center', alignSelf: 'flex-end' }}
				onPress={() => {
					navigate('Onboarding.WebViews', { url })
				}}
			>
				<Text
					style={[
						text.size.medium,
						{ fontFamily: 'Open Sans', color: colors['reverted-main-text'] },
					]}
				>
					{t('onboarding.advanced-settings.learn-more')}
				</Text>
				<Icon name='arrow-ios-forward' fill={colors['reverted-main-text']} width={20} height={20} />
			</TouchableOpacity>
		</View>
	)
}

const Proximity: React.FC<{
	setNewConfig: React.Dispatch<beapi.account.INetworkConfig | null>
	newConfig: beapi.account.INetworkConfig | null
}> = ({ setNewConfig, newConfig }) => {
	const { navigate } = useNavigation()
	const colors = useThemeColor()
	const selectedAccount = useSelector(selectSelectedAccount)
	const { t } = useTranslation()

	const setNewConfigProximityTransport = React.useCallback(() => {
		setNewConfig({
			...newConfig,
			bluetoothLe:
				newConfig?.bluetoothLe === beapi.account.NetworkConfig.Flag.Enabled
					? beapi.account.NetworkConfig.Flag.Disabled
					: beapi.account.NetworkConfig.Flag.Enabled,
			appleMultipeerConnectivity:
				newConfig?.appleMultipeerConnectivity === beapi.account.NetworkConfig.Flag.Enabled
					? beapi.account.NetworkConfig.Flag.Disabled
					: beapi.account.NetworkConfig.Flag.Enabled,
			androidNearby:
				newConfig?.androidNearby === beapi.account.NetworkConfig.Flag.Enabled
					? beapi.account.NetworkConfig.Flag.Disabled
					: beapi.account.NetworkConfig.Flag.Enabled,
		})
	}, [setNewConfig, newConfig])

	return (
		<View>
			<ButtonSetting
				name={t('onboarding.advanced-settings.first-part.first-button')}
				color={colors['reverted-main-text']}
				icon='expert-ble'
				iconPack='custom'
				iconColor='#6E6DFF'
				actionIconColor={colors['reverted-main-text']}
				backgroundColor={colors['alt-secondary-background-header']}
				toggled
				toggleStatus='secondary'
				varToggle={newConfig?.bluetoothLe === beapi.account.NetworkConfig.Flag.Enabled}
				actionToggle={
					selectedAccount
						? async () => {
								const status = await check(
									Platform.OS === 'ios'
										? PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL
										: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
								)
								if (status === RESULTS.GRANTED) {
									setNewConfigProximityTransport()
								} else {
									await rnutil.checkPermissions('p2p', navigate, {
										navigateToPermScreenOnProblem: true,
										onComplete: async () => setNewConfigProximityTransport(),
									})
								}
						  }
						: () => {}
				}
			/>
			<ButtonSetting
				name={t('onboarding.advanced-settings.first-part.second-button')}
				color={colors['reverted-main-text']}
				icon='expert-setting'
				iconPack='custom'
				iconColor='#6E6DFF'
				actionIconColor={colors['reverted-main-text']}
				backgroundColor={colors['alt-secondary-background-header']}
				toggled
				toggleStatus='secondary'
				varToggle={newConfig?.mdns === beapi.account.NetworkConfig.Flag.Enabled}
				actionToggle={
					selectedAccount
						? async () => {
								setNewConfig({
									...newConfig,
									mdns:
										newConfig?.mdns === beapi.account.NetworkConfig.Flag.Enabled
											? beapi.account.NetworkConfig.Flag.Disabled
											: beapi.account.NetworkConfig.Flag.Enabled,
								})
						  }
						: () => {}
				}
			/>
		</View>
	)
}

const PeerToPeer: React.FC<{
	setNewConfig: React.Dispatch<beapi.account.INetworkConfig | null>
	newConfig: beapi.account.INetworkConfig | null
}> = ({ setNewConfig, newConfig }) => {
	const colors = useThemeColor()
	const { t } = useTranslation()
	return (
		<View>
			<ButtonSetting
				name={t('onboarding.advanced-settings.second-part.first-button')}
				color={colors['reverted-main-text']}
				icon='expert-setting'
				iconPack='custom'
				iconColor='#6E6DFF'
				actionIconColor={colors['reverted-main-text']}
				backgroundColor={colors['alt-secondary-background-header']}
				toggled
				toggleStatus='secondary'
				varToggle={newConfig?.dht === beapi.account.NetworkConfig.DHTFlag.DHTClient}
				actionToggle={async () => {
					setNewConfig({
						...newConfig,
						dht:
							newConfig?.dht === beapi.account.NetworkConfig.DHTFlag.DHTClient
								? beapi.account.NetworkConfig.DHTFlag.DHTDisabled
								: beapi.account.NetworkConfig.DHTFlag.DHTClient,
					})
				}}
			/>
			<ButtonSetting
				name={t('onboarding.advanced-settings.second-part.second-button')}
				color={colors['reverted-main-text']}
				icon='privacy'
				iconPack='custom'
				iconColor='#6E6DFF'
				actionIconColor={colors['reverted-main-text']}
				backgroundColor={colors['alt-secondary-background-header']}
				toggled
				toggleStatus='secondary'
			/>
		</View>
	)
}

const CustomReplicationNode: React.FC<{
	setNewConfig: React.Dispatch<beapi.account.INetworkConfig | null>
	newConfig: beapi.account.INetworkConfig | null
}> = ({ setNewConfig, newConfig }) => {
	const [{ padding, border, margin, text }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const { t } = useTranslation()
	const [customNode, setCustomNode] = React.useState<boolean>(false)

	return (
		<View>
			<ButtonSetting
				name={t('onboarding.advanced-settings.third-part.second-button.title')}
				color={colors['reverted-main-text']}
				icon='expert-setting'
				iconPack='custom'
				iconColor='#6E6DFF'
				actionIcon='plus-circle'
				actionIconSize={30}
				actionIconColor='#6E6DFF'
				backgroundColor={colors['alt-secondary-background-header']}
				onPress={() => setCustomNode(!customNode)}
			/>
			{customNode ? (
				<>
					<View
						style={[
							padding.medium,
							border.radius.medium,
							margin.top.small,
							{
								height: 60 * scaleSize,
								backgroundColor: colors['main-background'],
								flexDirection: 'row',
								alignItems: 'center',
							},
						]}
					>
						<View style={[margin.right.medium]}>
							<Icon
								width={25 * scaleSize}
								height={25 * scaleSize}
								fill={colors['main-text']}
								name='expert-node'
								pack='custom'
							/>
						</View>

						<TextInput
							placeholderTextColor={`${colors['main-text']}50`}
							placeholder={t('onboarding.advanced-settings.third-part.second-button.placeholder')}
							style={[text.size.medium, { fontFamily: 'Open Sans', fontWeight: '600', padding: 0 }]}
							onChangeText={(text: string) => {
								setNewConfig({
									...newConfig,
									staticRelay: [text],
								})
							}}
						/>
					</View>
					<View style={{ top: -(12 * scaleSize) }}>
						<DropDownPicker
							items={[{ label: 'berty-static-relay', value: ':default:' }]}
							defaultValue={newConfig?.staticRelay ? newConfig?.staticRelay[0] : null}
							icon='expert-node'
							pack='custom'
							placeholder={t('onboarding.advanced-settings.third-part.third-button')}
							onChangeItem={async (item: Item) => {
								setNewConfig({
									...newConfig,
									staticRelay: [item.value],
								})
							}}
						/>
					</View>
				</>
			) : null}
		</View>
	)
}

const Services: React.FC<{
	setNewConfig: React.Dispatch<beapi.account.INetworkConfig | null>
	newConfig: beapi.account.INetworkConfig | null
}> = withInAppNotification(
	(props: {
		setNewConfig: React.Dispatch<beapi.account.INetworkConfig | null>
		newConfig: beapi.account.INetworkConfig | null
		showNotification: any
	}) => {
		const colors = useThemeColor()
		const { t } = useTranslation()
		const navigation = useNavigation()
		const account = useAccount()
		const services = useAccountServices()
		const [{ margin, text }, { scaleSize }] = useStyles()
		const ctx = useMessengerContext()
		const client = useMessengerClient()

		const replicationServices = services.filter(
			(s: any) => s.serviceType === serviceTypes.Replication,
		)

		return (
			<View>
				<ButtonSetting
					name={t('onboarding.advanced-settings.third-part.network-button')}
					icon='earth'
					iconPack='custom'
					color={colors['reverted-main-text']}
					iconColor='#6E6DFF'
					actionIconColor={colors['reverted-main-text']}
					backgroundColor={colors['alt-secondary-background-header']}
					onPress={() => navigation.navigate('Settings.NetworkMap')}
				/>
				<ButtonSetting
					name={t('settings.mode.external-services-button')}
					icon='cube-outline'
					color={colors['reverted-main-text']}
					iconColor='#6E6DFF'
					actionIconColor={colors['reverted-main-text']}
					backgroundColor={colors['alt-secondary-background-header']}
					iconSize={30}
					actionIcon='arrow-ios-forward'
					onPress={() => navigation.navigate('Settings.ServicesAuth')}
				/>
				<ButtonSetting
					name={t('settings.mode.auto-replicate-button')}
					icon='cloud-upload-outline'
					color={colors['reverted-main-text']}
					iconColor='#6E6DFF'
					actionIconColor={colors['reverted-main-text']}
					backgroundColor={colors['alt-secondary-background-header']}
					toggled
					toggleStatus='secondary'
					varToggle={
						(replicationServices.length !== 0 && account.replicateNewGroupsAutomatically) ||
						undefined
					}
					actionToggle={async () => {
						if (replicationServices.length === 0) {
							return
						}
						await client?.replicationSetAutoEnable({
							enabled: !account.replicateNewGroupsAutomatically,
						})
						showNeedRestartNotification(props.showNotification, ctx, t)
					}}
					disabled={replicationServices.length === 0}
				>
					{replicationServices.length === 0 && (
						<Text
							style={[
								text.bold.small,
								text.size.small,
								{
									marginLeft: margin.left.big.marginLeft + 3 * scaleSize,
									color: colors['secondary-text'],
								},
							]}
						>
							{t('settings.mode.auto-replicate-button-unavailable')}
						</Text>
					)}
				</ButtonSetting>
				<ButtonSetting
					name={t('onboarding.advanced-settings.third-part.first-button')}
					color={colors['reverted-main-text']}
					icon='expert-push-notif'
					iconPack='custom'
					iconColor='#6E6DFF'
					actionIconColor={colors['reverted-main-text']}
					backgroundColor={colors['alt-secondary-background-header']}
					toggled
					toggleStatus='secondary'
				/>
				<CustomReplicationNode {...props} />
			</View>
		)
	},
)

const CustomConfig: React.FC<{
	setNewConfig: React.Dispatch<beapi.account.INetworkConfig | null>
	newConfig: beapi.account.INetworkConfig | null
}> = ({ setNewConfig, newConfig }) => {
	const [{ margin }] = useStyles()
	const { t } = useTranslation()
	return (
		<View style={[margin.top.scale(50)]}>
			<View>
				<ConfigPart
					number={1}
					title={t('onboarding.advanced-settings.first-part.title')}
					icon='proximity'
					url='https://guide.berty.tech/learn-more/proximity'
				/>
				<Proximity setNewConfig={setNewConfig} newConfig={newConfig} />
			</View>
			<View style={[margin.top.medium]}>
				<ConfigPart
					number={2}
					title={t('onboarding.advanced-settings.second-part.title')}
					icon='peer'
					url='https://guide.berty.tech/learn-more/peer-to-peer'
				/>
				<PeerToPeer setNewConfig={setNewConfig} newConfig={newConfig} />
			</View>
			<View style={[margin.top.medium]}>
				<ConfigPart
					number={3}
					title={t('onboarding.advanced-settings.third-part.title')}
					icon='services'
					iconSize={50}
					url='https://guide.berty.tech/learn-more/berty-services'
				/>
				<Services setNewConfig={setNewConfig} newConfig={newConfig} />
			</View>
		</View>
	)
}

const AdvancedSettingsBackground: React.FC<{ top: number }> = ({ top }) => {
	const [{}, { scaleSize, windowWidth }] = useStyles()
	return (
		<Image
			source={NetworkOptionsBg}
			resizeMode='cover'
			style={{
				position: 'absolute',
				top: top * scaleSize,
				right: 0,
				left: 0,
				width: windowWidth,
				height: windowWidth * 1.28,
			}}
		/>
	)
}

const ApplyChanges: React.FC<{ newConfig: beapi.account.INetworkConfig | null }> =
	withInAppNotification(({ showNotification, newConfig }: any) => {
		const [{ padding, border, text, margin }] = useStyles()
		const colors = useThemeColor()
		const { t } = useTranslation()
		const ctx = useMessengerContext()
		const selectedAccount = useSelector(selectSelectedAccount)

		return (
			<View
				style={[{ position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: '#1B1C2B' }]}
			>
				<View style={[padding.medium, margin.horizontal.large]}>
					<TouchableOpacity
						onPress={async () => {
							await accountService.networkConfigSet({
								accountId: selectedAccount,
								config: newConfig,
							})
							await ctx.setNetworkConfig(newConfig)
							showNeedRestartNotification(showNotification, ctx, t)
						}}
						style={[
							padding.medium,
							border.radius.medium,
							{ backgroundColor: '#3F49EA', alignItems: 'center' },
						]}
					>
						<Text
							style={[
								text.size.large,
								{ fontFamily: 'Open Sans', fontWeight: '700', color: colors['reverted-main-text'] },
							]}
						>
							{t('onboarding.advanced-settings.apply-changes')}
						</Text>
					</TouchableOpacity>
				</View>
			</View>
		)
	})

export const AdvancedSettings: ScreenFC<'Onboarding.AdvancedSettings'> = ({
	navigation: { goBack },
}) => {
	const colors = useThemeColor()
	const ctx = useMessengerContext()
	const [{ padding, margin }, { scaleSize }] = useStyles()
	const { t } = useTranslation()
	const [defaultName, setDefaultName] = React.useState('')
	const [newConfig, setNewConfig] = React.useState<beapi.account.INetworkConfig | null>(
		ctx.networkConfig,
	)
	const [isNew, setIsNew] = React.useState<string | null>(null)
	const { navigate } = useNavigation()
	const selectedAccount = useSelector(selectSelectedAccount)

	useMountEffect(() => {
		ctx
			.getUsername()
			.then(reply => reply && setDefaultName(reply.username))
			.catch(err2 => console.warn('Failed to fetch username:', err2))
	})

	useEffect(() => {
		const getPersistentOptionIsNew = async () => {
			const isNewStorage = await storageGet(GlobalPersistentOptionsKeys.IsNewAccount)
			setIsNew(isNewStorage)
		}

		getPersistentOptionIsNew().then()
	}, [])

	return (
		<SafeAreaView style={{ backgroundColor: '#1B1C2B', flex: 1 }}>
			<StatusBar barStyle='light-content' />
			<ScrollView
				bounces={false}
				contentContainerStyle={[padding.medium, isNew !== 'isNew' && padding.bottom.scale(170)]}
				showsVerticalScrollIndicator={false}
			>
				<AdvancedSettingsBackground top={0} />
				<AdvancedSettingsBackground top={650} />
				<AdvancedSettingsBackground top={1300} />
				<TouchableOpacity onPress={() => goBack()}>
					<Icon
						name='arrow-back'
						fill={colors['reverted-main-text']}
						width={25 * scaleSize}
						height={25 * scaleSize}
					/>
				</TouchableOpacity>
				<View style={[margin.top.scale(20)]}>
					<TitleBox
						title={t('onboarding.advanced-settings.title')}
						desc={t('onboarding.advanced-settings.desc')}
						icon='privacy'
						pack='custom'
					/>
				</View>
				<MoreAbout />
				<View style={[margin.top.medium]}>
					<ButtonSetting
						name={t('onboarding.advanced-settings.read-more')}
						color={colors['reverted-main-text']}
						icon='info-outline'
						iconColor='#6E6DFF'
						actionIconColor={colors['reverted-main-text']}
						backgroundColor={colors['alt-secondary-background-header']}
						onPress={() =>
							navigate('Onboarding.WebViews', { url: 'https://guide.berty.tech/learn-more' })
						}
					/>
				</View>
				<CustomConfig setNewConfig={setNewConfig} newConfig={newConfig} />
				{isNew === 'isNew' ? (
					<View>
						{defaultName ? (
							<CreateAccountBox newConfig={newConfig} defaultName={defaultName} />
						) : null}
					</View>
				) : null}
			</ScrollView>
			{selectedAccount && isNew !== 'isNew' ? <ApplyChanges newConfig={newConfig} /> : null}
		</SafeAreaView>
	)
}
