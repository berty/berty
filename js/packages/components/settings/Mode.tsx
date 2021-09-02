import React from 'react'
import { withInAppNotification } from 'react-native-in-app-notification'
import { Alert, Platform, ScrollView, Vibration, View } from 'react-native'
import { Text } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'
import { useNavigation as useReactNavigation } from '@react-navigation/native'

import beapi from '@berty-tech/api'
import { useStyles } from '@berty-tech/styles'
import { useAccount, useMsgrContext, useThemeColor } from '@berty-tech/store/hooks'
import { exportAccountToFile, serviceTypes, useAccountServices } from '@berty-tech/store/services'
import { accountService } from '@berty-tech/store/context'

import { ButtonSetting, StringOptionInput } from '../shared-components/SettingsButtons'
import { showNeedRestartNotification } from '@berty-tech/components/helpers'

// Styles
const useStylesMode = () => {
	const [{ text, margin }] = useStyles()
	return {
		buttonListUnderStateText: [text.bold.small, text.size.tiny, margin.right.scale(60)],
		buttonSettingText: [text.bold.small, text.size.small],
	}
}

const BodyMode: React.FC<{}> = withInAppNotification(({ showNotification }: any) => {
	const _styles = useStylesMode()
	const [{ flex, padding, margin }, { scaleSize }] = useStyles()
	const ctx = useMsgrContext()
	const { t }: any = useTranslation()
	const colors = useThemeColor()
	const navigation = useReactNavigation()
	const account: beapi.messenger.IAccount | null | undefined = useAccount()
	const services = useAccountServices()
	const replicationServices = services.filter(
		(s: any) => s.serviceType === serviceTypes.Replication,
	)

	const sanitizeCheckNetworkConfig = async (newConfig: beapi.account.INetworkConfig) => {
		try {
			await accountService.networkConfigSet({
				accountId: ctx.selectedAccount,
				config: newConfig,
			})
			ctx.setNetworkConfig(newConfig)
			showNeedRestartNotification(showNotification, ctx, t)
		} catch (e) {
			Alert.alert('Input validation field failed!', `${e.message}`)
		}
	}

	return (
		<View style={[flex.tiny, padding.medium, margin.bottom.medium]}>
			<ButtonSetting
				name={t('settings.home.network-button')}
				icon='earth'
				iconPack='custom'
				iconColor={colors['background-header']}
				onPress={() => navigation.navigate('Settings.NetworkMap')}
			/>
			<ButtonSetting
				name={t('settings.mode.receive-contact-requests-button')}
				icon='person-done-outline'
				iconColor={colors['background-header']}
				iconSize={30}
				toggled
				disabled
			/>
			<ButtonSetting
				name={t('settings.mode.external-services-button')}
				icon='cube-outline'
				iconColor={colors['background-header']}
				iconSize={30}
				actionIcon='arrow-ios-forward'
				onPress={() => navigation.navigate('Settings.ServicesAuth')}
			/>
			<ButtonSetting
				name={t('settings.mode.auto-replicate-button')}
				icon='cloud-upload-outline'
				iconColor={colors['background-header']}
				toggled
				varToggle={
					(replicationServices.length !== 0 && account?.replicateNewGroupsAutomatically) ||
					undefined
				}
				actionToggle={async () => {
					if (replicationServices.length === 0) {
						return
					}
					await ctx.client?.replicationSetAutoEnable({
						enabled: !account?.replicateNewGroupsAutomatically,
					})
					showNeedRestartNotification(showNotification, ctx, t)
				}}
				disabled={replicationServices.length === 0}
			>
				{replicationServices.length === 0 && (
					<Text
						style={[
							_styles.buttonSettingText,
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
				name={t('settings.mode.multicast-dns-button.title')}
				icon='upload'
				iconColor={colors['background-header']}
				iconSize={30}
				varToggle={ctx.networkConfig.mdns === beapi.account.NetworkConfig.Flag.Enabled}
				actionToggle={async () => {
					let newValue = beapi.account.NetworkConfig.Flag.Enabled
					if (ctx.networkConfig.mdns === beapi.account.NetworkConfig.Flag.Enabled) {
						newValue = beapi.account.NetworkConfig.Flag.Disabled
					}

					const newNetConf = {
						...ctx.networkConfig,
						mdns: newValue,
					}

					await accountService.networkConfigSet({
						accountId: ctx.selectedAccount,
						config: newNetConf,
					})

					ctx.setNetworkConfig(newNetConf)
					showNeedRestartNotification(showNotification, ctx, t)
				}}
				toggled
			>
				<Text
					style={[
						_styles.buttonSettingText,
						{
							marginLeft: margin.left.big.marginLeft + 3 * scaleSize,
							color: colors['secondary-text'],
						},
					]}
				>
					{t('settings.mode.multicast-dns-button.desc')}
				</Text>
			</ButtonSetting>
			<StringOptionInput
				name={'Bootstrap'}
				bulletPointValue={t('settings.devtools.log-button.bullet-point')}
				getOptionValue={() => ctx.networkConfig.bootstrap.toString()}
				setOptionValue={async val => {
					let newConfig = { ...ctx.networkConfig, bootstrap: val.split('\n') }
					await sanitizeCheckNetworkConfig(newConfig)
				}}
				iconColor={colors['background-header']}
			/>
			<StringOptionInput
				name={'RendezVous'}
				bulletPointValue={t('settings.devtools.log-button.bullet-point')}
				getOptionValue={() => ctx.networkConfig.rendezvous.toString()}
				setOptionValue={async val => {
					let newConfig = { ...ctx.networkConfig, rendezvous: val.split('\n') }
					await sanitizeCheckNetworkConfig(newConfig)
				}}
				iconColor={colors['background-header']}
			/>
			<StringOptionInput
				name={'StaticRelay'}
				bulletPointValue={t('settings.devtools.log-button.bullet-point')}
				getOptionValue={() => ctx.networkConfig.staticRelay.toString()}
				setOptionValue={async val => {
					let newConfig = { ...ctx.networkConfig, staticRelay: val.split('\n') }
					await sanitizeCheckNetworkConfig(newConfig)
				}}
				iconColor={colors['background-header']}
			/>
			<ButtonSetting
				name={t('settings.mode.blocked-contacts-button.title')}
				icon='person-delete-outline'
				iconSize={30}
				iconColor={colors['background-header']}
				state={{
					value: `3 ${t('settings.mode.blocked-contacts-button.tag')}`,
					color: colors['background-header'],
					bgColor: colors['positive-asset'],
				}}
				actionIcon='arrow-ios-forward'
				disabled
			/>
			<ButtonSetting
				name={t('settings.mode.backup-account-button')}
				icon='save-outline'
				iconSize={30}
				iconColor={colors['background-header']}
				actionIcon='arrow-ios-forward'
				onPress={async () => {
					await exportAccountToFile(ctx.selectedAccount)
					if (Platform.OS === 'android') {
						showNotification({
							title: t('settings.mode.notification-file-saved.title'),
							message: t('settings.mode.notification-file-saved.desc'),
							additionalProps: { type: 'message' },
						})
					}
				}}
			/>
			<ButtonSetting
				name={t('settings.mode.delete-account-button')}
				icon='trash-2-outline'
				iconSize={30}
				iconColor={colors['secondary-background-header']}
				actionIcon='arrow-ios-forward'
				onPress={() => {
					Vibration.vibrate([1000, 250, 1000])
					navigation.navigate('Settings.DeleteAccount')
				}}
			/>
		</View>
	)
})

export const Mode: React.FC<{}> = () => {
	const colors = useThemeColor()
	const { t }: any = useTranslation()
	const [{ padding, text }, { scaleSize }] = useStyles()

	return (
		<View style={{ flex: 1, backgroundColor: colors['main-background'] }}>
			<ScrollView bounces={false}>
				<View style={[padding.medium, { backgroundColor: colors['background-header'] }]}>
					<Text
						style={[
							text.align.center,
							padding.horizontal.big,
							{ fontSize: 10 * scaleSize, color: colors['reverted-main-text'] },
						]}
					>
						{t('settings.mode.desc')}
					</Text>
				</View>
				<BodyMode />
			</ScrollView>
		</View>
	)
}
