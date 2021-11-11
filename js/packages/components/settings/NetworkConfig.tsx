import { View, ScrollView, Alert, Linking } from 'react-native'
import { Layout, Text } from '@ui-kitten/components'
import React, { useCallback, useEffect } from 'react'
import { withInAppNotification } from 'react-native-in-app-notification'
import { useTranslation } from 'react-i18next'

import beapi from '@berty-tech/api'
import {
	useMessengerContext,
	useThemeColor,
	accountService,
	getNetworkConfigurationFromPreset,
} from '@berty-tech/store'
import { useStyles } from '@berty-tech/styles'
import rnutil from '@berty-tech/rnutil'
import { ScreenFC, useNavigation } from '@berty-tech/navigation'

import { ButtonSetting, StringOptionInput } from '../shared-components'
import { showNeedRestartNotification } from '../helpers'
import { Toggle } from '../shared-components/Toggle'

const BodyNetworkConfig: React.FC = withInAppNotification(({ showNotification }: any) => {
	const colors = useThemeColor()
	const [{ padding, text, margin }, { scaleSize }] = useStyles()
	const ctx = useMessengerContext()
	const { t }: any = useTranslation()
	const { networkConfig, selectedAccount, setNetworkConfig } = ctx
	const { navigate } = useNavigation()

	const [toggled, setToggled] = React.useState(false)

	const sanitizeCheckNetworkConfig = useCallback(
		async (newConfig: beapi.account.INetworkConfig) => {
			try {
				await accountService.networkConfigSet({
					accountId: ctx.selectedAccount,
					config: newConfig,
				})
				await ctx.setNetworkConfig(newConfig)
				showNeedRestartNotification(showNotification, ctx, t)
			} catch (e: any) {
				Alert.alert('Input validation field failed!', `${e?.message}`)
			}
		},
		[ctx, showNotification, t],
	)

	return (
		<View
			style={[padding.horizontal.medium, { flex: 1, backgroundColor: colors['main-background'] }]}
		>
			<View style={{ alignItems: 'flex-end' }}>
				<View style={[margin.top.medium, { alignItems: 'center', flexDirection: 'row' }]}>
					<Text
						style={[
							text.align.center,
							padding.right.small,
							{ fontSize: 10 * scaleSize, color: colors['main-text'] },
						]}
					>
						{t('settings.network-config.anon-mode')}
					</Text>
					<Toggle
						status='primary'
						checked={toggled}
						onChange={async () => {
							const newToggled = toggled ? false : true
							let preset
							if (!newToggled) {
								preset = beapi.account.NetworkConfigPreset.Performance
							} else {
								preset = beapi.account.NetworkConfigPreset.FullAnonymity
							}
							const netConf: beapi.account.INetworkConfig = await getNetworkConfigurationFromPreset(
								preset,
							)
							await accountService.networkConfigSet({
								accountId: selectedAccount,
								config: netConf,
							})
							await setNetworkConfig(netConf)
							setToggled(newToggled)
						}}
					/>
				</View>
			</View>
			<ButtonSetting
				name={t('settings.network-config.push-notifications')}
				icon='bell-outline'
				iconColor={colors['background-header']}
				disabled
			/>
			<ButtonSetting
				name={t('settings.network-config.replication-services')}
				icon='browser-outline'
				iconColor={colors['background-header']}
				onPress={() => navigate('Settings.ReplicationServices')}
			/>
			<ButtonSetting
				name={t('settings.network-config.ble')}
				icon='bluetooth-outline'
				iconColor={colors['background-header']}
				toggled
				varToggle={networkConfig.bluetoothLe === beapi.account.NetworkConfig.Flag.Enabled}
				actionToggle={async () => {
					const updateValue = async () => {
						const newConfig: beapi.account.INetworkConfig = {
							...networkConfig,
							bluetoothLe:
								networkConfig.bluetoothLe === beapi.account.NetworkConfig.Flag.Enabled
									? beapi.account.NetworkConfig.Flag.Disabled
									: beapi.account.NetworkConfig.Flag.Enabled,
							appleMultipeerConnectivity:
								networkConfig.appleMultipeerConnectivity ===
								beapi.account.NetworkConfig.Flag.Enabled
									? beapi.account.NetworkConfig.Flag.Disabled
									: beapi.account.NetworkConfig.Flag.Enabled,
							androidNearby:
								networkConfig.androidNearby === beapi.account.NetworkConfig.Flag.Enabled
									? beapi.account.NetworkConfig.Flag.Disabled
									: beapi.account.NetworkConfig.Flag.Enabled,
						}
						await accountService.networkConfigSet({
							accountId: selectedAccount,
							config: newConfig,
						})
						await setNetworkConfig(newConfig)
						showNeedRestartNotification(showNotification, ctx, t)
					}

					const bluetoothPermissions = await rnutil.checkPermissions('p2p', navigate, {
						isToNavigate: false,
					})
					switch (bluetoothPermissions) {
						case 'granted':
							await updateValue()
							break
						case 'unavailable':
							await rnutil.checkPermissions('p2p', navigate, {
								isToNavigate: true,
							})
							break
						case 'blocked':
							await rnutil.checkPermissions('p2p', navigate, {
								isToNavigate: true,
							})
							await Linking.openSettings()
							break
					}
					showNeedRestartNotification(showNotification, ctx, t)
				}}
			/>
			<ButtonSetting
				name={t('settings.network-config.multicast-dns-button.title')}
				icon='upload'
				iconColor={colors['background-header']}
				iconSize={30}
				varToggle={networkConfig.mdns === beapi.account.NetworkConfig.Flag.Enabled}
				actionToggle={async () => {
					const newConfig: beapi.account.INetworkConfig = {
						...networkConfig,
						mdns:
							networkConfig.mdns === beapi.account.NetworkConfig.Flag.Enabled
								? beapi.account.NetworkConfig.Flag.Disabled
								: beapi.account.NetworkConfig.Flag.Enabled,
					}
					await accountService.networkConfigSet({
						accountId: selectedAccount,
						config: newConfig,
					})
					setNetworkConfig(newConfig)
					showNeedRestartNotification(showNotification, ctx, t)
				}}
				toggled
			>
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
					{t('settings.network-config.multicast-dns-button.desc')}
				</Text>
			</ButtonSetting>
			<ButtonSetting
				name={t('settings.network-config.dht')}
				icon='hard-drive-outline'
				iconColor={colors['background-header']}
				toggled
				varToggle={networkConfig.dht === beapi.account.NetworkConfig.DHTFlag.DHTClient}
				actionToggle={async () => {
					const newConfig: beapi.account.INetworkConfig = {
						...networkConfig,
						dht:
							networkConfig.dht === beapi.account.NetworkConfig.DHTFlag.DHTClient
								? beapi.account.NetworkConfig.DHTFlag.DHTDisabled
								: beapi.account.NetworkConfig.DHTFlag.DHTClient,
					}
					await accountService.networkConfigSet({
						accountId: selectedAccount,
						config: newConfig,
					})
					setNetworkConfig(newConfig)
					showNeedRestartNotification(showNotification, ctx, t)
				}}
			/>
			<StringOptionInput
				name={t('settings.network-config.bootstrap')}
				getOptionValue={() => networkConfig?.bootstrap?.toString() || ''}
				setOptionValue={async val => {
					let newConfig = { ...networkConfig, bootstrap: val.split('\n') }
					await sanitizeCheckNetworkConfig(newConfig)
				}}
				iconColor={colors['background-header']}
			/>
			<StringOptionInput
				name={t('settings.network-config.rdv')}
				getOptionValue={() => networkConfig?.rendezvous?.toString() || ''}
				setOptionValue={async val => {
					let newConfig = { ...networkConfig, rendezvous: val.split('\n') }
					await sanitizeCheckNetworkConfig(newConfig)
				}}
				iconColor={colors['background-header']}
			/>
			<StringOptionInput
				name={t('settings.network-config.static-relay')}
				getOptionValue={() => networkConfig?.staticRelay?.toString() || ''}
				setOptionValue={async val => {
					let newConfig = { ...networkConfig, staticRelay: val.split('\n') }
					await sanitizeCheckNetworkConfig(newConfig)
				}}
				iconColor={colors['background-header']}
			/>
		</View>
	)
})

export const NetworkConfig: ScreenFC<'Settings.NetworkConfig'> = () => {
	const colors = useThemeColor()
	const [{ padding, text }, { scaleSize }] = useStyles()
	const { selectedAccount, setNetworkConfig } = useMessengerContext()
	const { t }: any = useTranslation()

	useEffect(() => {
		const getCurrentConfig = async () => {
			const currentConfig = await accountService.networkConfigGet({
				accountId: selectedAccount,
			})
			setNetworkConfig({ ...currentConfig.currentConfig })
		}

		getCurrentConfig().then()
	}, [selectedAccount, setNetworkConfig])

	return (
		<Layout style={{ flex: 1, backgroundColor: colors['main-background'] }}>
			<View style={[padding.medium, { backgroundColor: colors['background-header'] }]}>
				<Text
					style={[
						text.align.center,
						padding.horizontal.big,
						{ fontSize: 10 * scaleSize, color: colors['reverted-main-text'] },
					]}
				>
					{t('settings.network-config.desc')}
				</Text>
			</View>
			<ScrollView bounces={false} contentContainerStyle={[padding.bottom.medium]}>
				<BodyNetworkConfig />
			</ScrollView>
		</Layout>
	)
}
