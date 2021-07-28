import React from 'react'
import { View, ScrollView } from 'react-native'
import { Layout, Text } from '@ui-kitten/components'
import { Translation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { useMsgrContext, useThemeColor } from '@berty-tech/store/hooks'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import { PersistentOptionsKeys } from '@berty-tech/store/context'

import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting, FactionButtonSetting } from '../shared-components/SettingsButtons'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'

//
// Notifications
//

// Styles
const useStylesNotifications = () => {
	const [{ padding, text }] = useStyles()
	return {
		buttonSettingText: [text.size.scale(10), padding.left.scale(39), padding.right.scale(100)],
	}
}

const BodyNotifications: React.FC<{}> = () => {
	const _styles = useStylesNotifications()
	const [{ flex, padding, margin }] = useStyles()
	const colors = useThemeColor()
	const ctx = useMsgrContext()

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<View style={[flex.tiny, padding.medium, margin.bottom.medium]}>
					<ButtonSetting
						name={t('settings.notifications.activate-button')}
						icon='bell-outline'
						iconSize={30}
						iconColor={colors['background-header']}
						toggled
						varToggle={ctx.persistentOptions?.notifications.enable}
						actionToggle={async () => {
							await ctx.setPersistentOption({
								type: PersistentOptionsKeys.Notifications,
								payload: {
									enable: !ctx.persistentOptions?.notifications.enable,
								},
							})
						}}
					/>
					<ButtonSetting
						name={t('settings.notifications.contact-request-button.title')}
						toggled={true}
						icon='user-plus'
						iconPack='custom'
						iconSize={30}
						iconColor={colors['background-header']}
						disabled
					>
						<Text style={[_styles.buttonSettingText]}>
							{t('settings.notifications.contact-request-button.desc')}
						</Text>
					</ButtonSetting>
					<FactionButtonSetting
						name={t('settings.notifications.messages-notifications-button.title')}
						icon='paper-plane-outline'
						iconSize={30}
						iconColor={colors['background-header']}
						style={[margin.top.medium]}
						disabled
					>
						<ButtonSetting
							name={t('settings.notifications.messages-notifications-button.display-button')}
							toggled
							disabled
							alone={false}
						/>
						<ButtonSetting
							name={t('settings.notifications.messages-notifications-button.preview-button')}
							toggled
							disabled
							alone={false}
						/>
						<ButtonSetting
							name={t('settings.notifications.messages-notifications-button.sound-button')}
							actionIcon='arrow-ios-forward'
							previewValue='Note'
							alone={false}
							disabled
						/>
						<ButtonSetting
							name={t(
								'settings.notifications.messages-notifications-button.exceptions-button.title',
							)}
							actionIcon='arrow-ios-forward'
							previewValue={t(
								'settings.notifications.messages-notifications-button.exceptions-button.preview-value',
							)}
							alone={false}
							disabled
						/>
					</FactionButtonSetting>
					<FactionButtonSetting
						name={t('settings.notifications.group-notifications-button.title')}
						icon='users'
						iconPack='custom'
						iconSize={30}
						iconColor={colors['background-header']}
						style={[margin.top.medium]}
						disabled
					>
						<ButtonSetting
							name={t('settings.notifications.group-notifications-button.display-button')}
							toggled
							disabled
							alone={false}
						/>
						<ButtonSetting
							name={t('settings.notifications.group-notifications-button.preview-button')}
							toggled
							disabled
							alone={false}
						/>
						<ButtonSetting
							name={t('settings.notifications.group-notifications-button.sound-button')}
							actionIcon='arrow-ios-forward'
							previewValue='Bambou'
							alone={false}
							disabled
						/>
						<ButtonSetting
							name={t('settings.notifications.group-notifications-button.exceptions-button.title')}
							actionIcon='arrow-ios-forward'
							state={{
								value: t(
									'settings.notifications.group-notifications-button.exceptions-button.tag',
									{ count: 2 },
								),
								color: colors['background-header'],
								bgColor: colors['positive-asset'],
							}}
							alone={false}
							disabled
						/>
					</FactionButtonSetting>
				</View>
			)}
		</Translation>
	)
}

export const Notifications: React.FC<ScreenProps.Settings.Notifications> = () => {
	const { goBack } = useNavigation()
	const ctx = useMsgrContext()
	const colors = useThemeColor()

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<Layout style={{ backgroundColor: colors['main-background'], flex: 1 }}>
					<SwipeNavRecognizer>
						<ScrollView bounces={false}>
							<HeaderSettings
								title={t('settings.notifications.title')}
								desc={
									ctx.persistentOptions?.notifications.enable
										? t('settings.notifications.enabled-desc')
										: t('settings.notifications.disabled-desc')
								}
								undo={goBack}
							/>
							<BodyNotifications />
						</ScrollView>
					</SwipeNavRecognizer>
				</Layout>
			)}
		</Translation>
	)
}
