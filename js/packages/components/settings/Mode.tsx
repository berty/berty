import React from 'react'
import { ScrollView, Vibration, View } from 'react-native'
import { Layout, Text } from '@ui-kitten/components'
import { DropDownPicker } from '@berty-tech/components/shared-components/DropDownPicker'

import { Translation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { useAccount, useMsgrContext } from '@berty-tech/store/hooks'
import { exportAccountToFile, serviceTypes, useAccountServices } from '@berty-tech/store/services'
import { useNavigation } from '@berty-tech/navigation'
import i18n from '@berty-tech/berty-i18n'
import beapi from '@berty-tech/api'

import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting, ButtonSettingItem } from '../shared-components/SettingsButtons'
import { useNavigation as useReactNavigation } from '@react-navigation/native'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'
import { languages } from '@berty-tech/berty-i18n/locale/languages'
import { PersistentOptionsKeys } from '@berty-tech/store/context'

//
// Mode
//

// Types
type BodyModeProps = {}

// Styles
const useStylesMode = () => {
	const [{ text, margin }] = useStyles()
	return {
		buttonListUnderStateText: [text.bold.small, text.size.tiny, margin.right.scale(60)],
		buttonSettingText: [text.bold.small, text.size.small, { color: 'rgba(43,46,77,0.8)' }], // TODO: Fix horizontal alignment
	}
}

const BodyMode: React.FC<BodyModeProps> = () => {
	const _styles = useStylesMode()
	const [{ flex, padding, margin, color, text, column }, { scaleSize }] = useStyles()
	const navigation = useReactNavigation()
	const account: beapi.messenger.Account = useAccount()
	const services = useAccountServices()
	const replicationServices = services.filter(
		(s: any) => s.serviceType === serviceTypes.Replication,
	)

	const ctx = useMsgrContext()

	const isPrefMode = ctx.persistentOptions.preset.value === 'performance'
	const enableNotif = ctx.persistentOptions.notifications.enable

	const items: any = Object.entries(languages).map(([key, attrs]) => ({
		label: attrs.localName,
		value: key,
	}))

	items.push({ label: 'Debug', value: 'cimode' })

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<View style={[flex.tiny, padding.medium, margin.bottom.medium]}>
					<DropDownPicker
						items={items}
						defaultValue={ctx.persistentOptions?.i18n.language}
						onChangeItem={async (item: any) => {
							await ctx.setPersistentOption({
								type: PersistentOptionsKeys.I18N,
								payload: {
									language: item.value,
								},
							})
							await i18n.changeLanguage(item.value)
						}}
					/>
					<ButtonSetting
						name={t('settings.mode.notifications-button.title')}
						icon='bell-outline'
						iconColor={color.blue}
						state={{
							value: enableNotif
								? t('settings.mode.notifications-button.tag-enabled')
								: t('settings.mode.notifications-button.tag-disabled'),
							color: enableNotif ? color.green : color.red,
							bgColor: enableNotif ? color.light.green : color.light.red,
						}}
						onPress={() => navigation.navigate('Settings.Notifications')}
					/>
					<ButtonSetting
						name={t('settings.mode.bluetooth-button.title')}
						icon='bluetooth-outline'
						iconColor={color.blue}
						onPress={() => navigation.navigate('Settings.Bluetooth')}
					/>
					<ButtonSetting
						name={t('settings.mode.app-mode-button.title')}
						icon='options-outline'
						iconSize={30}
						iconColor={color.blue}
						actionIcon='arrow-ios-forward'
						state={{
							value: isPrefMode
								? t('settings.mode.app-mode-button.performance-tag')
								: t('settings.mode.app-mode-button.privacy-tag'),
							color: color.white,
							bgColor: isPrefMode ? color.blue : color.red,
							stateIcon: isPrefMode ? 'flash-outline' : 'lock-outline',
							stateIconColor: color.white,
						}}
						disabled
					>
						<Text
							style={[
								column.item.right,
								_styles.buttonListUnderStateText,
								isPrefMode ? text.color.blue : text.color.red,
								margin.bottom.small,
							]}
						>
							{t('settings.mode.app-mode-button.description-tag')}
						</Text>
						<View style={[padding.right.small]}>
							<ButtonSettingItem
								value={t('settings.mode.app-mode-button.first-bullet-point')}
								// color='rgba(43,46,77,0.8)'
								icon={isPrefMode ? 'checkmark-circle-2' : 'close-circle'}
								iconColor={isPrefMode ? color.blue : color.red}
								disabled
								styleText={[text.color.grey]}
								styleContainer={[margin.bottom.tiny]}
							/>
							<ButtonSettingItem
								value={t('settings.mode.app-mode-button.second-bullet-point')}
								color='rgba(43,46,77,0.8)'
								icon={isPrefMode ? 'checkmark-circle-2' : 'close-circle'}
								iconColor={isPrefMode ? color.blue : color.red}
								disabled
								styleText={[text.color.grey]}
								styleContainer={[margin.bottom.tiny]}
							/>
							<ButtonSettingItem
								value={t('settings.mode.app-mode-button.third-bullet-point')}
								color='rgba(43,46,77,0.8)'
								icon={isPrefMode ? 'checkmark-circle-2' : 'close-circle'}
								iconColor={isPrefMode ? color.blue : color.red}
								disabled
								styleText={[text.color.grey]}
								styleContainer={[margin.bottom.tiny]}
							/>
						</View>
					</ButtonSetting>
					<ButtonSetting
						name={t('settings.mode.dark-mode-button')}
						icon='moon-outline'
						iconColor={color.blue}
						toggled
						disabled
					/>
					<ButtonSetting
						name={t('settings.mode.receive-contact-requests-button')}
						icon='person-done-outline'
						iconColor={color.blue}
						iconSize={30}
						toggled
						disabled
					/>
					<ButtonSetting
						name={t('settings.mode.external-services-button')}
						icon='cube-outline'
						iconColor={color.blue}
						iconSize={30}
						actionIcon='arrow-ios-forward'
						onPress={() => navigation.navigate('Settings.ServicesAuth')}
					/>
					<ButtonSetting
						name={t('settings.mode.auto-replicate-button')}
						icon='cloud-upload-outline'
						iconColor={color.blue}
						actionIcon={
							// TODO: make toggle usable and use it
							replicationServices.length !== 0 && account.replicateNewGroupsAutomatically
								? 'toggle-right'
								: 'toggle-left-outline'
						}
						disabled={replicationServices.length === 0}
						onPress={async () => {
							if (replicationServices.length === 0) {
								return
							}

							await ctx.client?.replicationSetAutoEnable({
								enabled: !account.replicateNewGroupsAutomatically,
							})
						}}
					/>
					<ButtonSetting
						name={t('settings.mode.multicast-dns-button.title')}
						icon='upload'
						iconColor={color.blue}
						iconSize={30}
						toggled
						disabled
					>
						<Text
							style={[
								_styles.buttonSettingText,
								text.color.grey,
								{ marginLeft: margin.left.big.marginLeft + 3 * scaleSize },
							]}
						>
							{t('settings.mode.multicast-dns-button.desc')}
						</Text>
					</ButtonSetting>
					<ButtonSetting
						name={t('settings.mode.blocked-contacts-button.title')}
						icon='person-delete-outline'
						iconSize={30}
						iconColor={color.blue}
						state={{
							value: `3 ${t('settings.mode.blocked-contacts-button.tag')}`,
							color: color.blue,
							bgColor: color.light.blue,
						}}
						actionIcon='arrow-ios-forward'
						disabled
					/>
					<ButtonSetting
						name={t('settings.mode.backup-account-button')}
						icon='save-outline'
						iconSize={30}
						iconColor={color.blue}
						actionIcon='arrow-ios-forward'
						onPress={() => exportAccountToFile()}
					/>
					<ButtonSetting
						name={t('settings.mode.delete-account-button')}
						icon='trash-2-outline'
						iconSize={30}
						iconColor={'red'}
						actionIcon='arrow-ios-forward'
						onPress={() => {
							Vibration.vibrate([1000, 250, 1000])
							navigation.navigate('DeleteAccount')
						}}
					/>
				</View>
			)}
		</Translation>
	)
}

export const Mode: React.FC<{}> = () => {
	const { goBack } = useNavigation()
	const [{ flex, background, padding }] = useStyles()
	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<Layout style={[flex.tiny, background.white]}>
					<SwipeNavRecognizer>
						<ScrollView bounces={false} contentContainerStyle={[padding.bottom.scale(20)]}>
							<HeaderSettings
								title={t('settings.mode.title')}
								desc={t('settings.mode.desc')}
								undo={goBack}
							/>
							<BodyMode />
						</ScrollView>
					</SwipeNavRecognizer>
				</Layout>
			)}
		</Translation>
	)
}
