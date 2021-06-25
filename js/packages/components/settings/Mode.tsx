import React from 'react'
import { withInAppNotification } from 'react-native-in-app-notification'
import { Platform, ScrollView, Vibration, View } from 'react-native'
import { Layout, Text } from '@ui-kitten/components'
import { Translation } from 'react-i18next'
import { useNavigation as useReactNavigation } from '@react-navigation/native'

import beapi from '@berty-tech/api'
import { useStyles } from '@berty-tech/styles'
import { useAccount, useMsgrContext } from '@berty-tech/store/hooks'
import { exportAccountToFile, serviceTypes, useAccountServices } from '@berty-tech/store/services'
import { useNavigation } from '@berty-tech/navigation'

import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting } from '../shared-components/SettingsButtons'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'

// Styles
const useStylesMode = () => {
	const [{ text, margin }] = useStyles()
	return {
		buttonListUnderStateText: [text.bold.small, text.size.tiny, margin.right.scale(60)],
		buttonSettingText: [text.bold.small, text.size.small, { color: 'rgba(43,46,77,0.8)' }],
	}
}

const BodyMode: React.FC<{}> = withInAppNotification(({ showNotification }: any) => {
	const _styles = useStylesMode()
	const [{ flex, padding, margin, color, text }, { scaleSize }] = useStyles()
	const navigation = useReactNavigation()
	const account: beapi.messenger.IAccount | null | undefined = useAccount()
	const services = useAccountServices()
	const replicationServices = services.filter(
		(s: any) => s.serviceType === serviceTypes.Replication,
	)

	const ctx = useMsgrContext()

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<View style={[flex.tiny, padding.medium, margin.bottom.medium]}>
					<ButtonSetting
						name={t('settings.home.network-button')}
						icon='earth'
						iconPack='custom'
						iconColor={color.blue}
						onPress={() => navigation.navigate('Settings.NetworkMap')}
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
						}}
						disabled={replicationServices.length === 0}
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
})

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
