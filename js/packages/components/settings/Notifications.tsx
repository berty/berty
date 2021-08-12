import React from 'react'
import { View, ScrollView } from 'react-native'
import { Layout, Text } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { useMsgrContext, useThemeColor } from '@berty-tech/store/hooks'
import { ScreenProps } from '@berty-tech/navigation'
import { PersistentOptionsKeys } from '@berty-tech/store/context'

import { ButtonSetting, FactionButtonSetting } from '../shared-components/SettingsButtons'

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
	const { t }: any = useTranslation()

	return (
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
					name={t('settings.notifications.messages-notifications-button.exceptions-button.title')}
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
						value: t('settings.notifications.group-notifications-button.exceptions-button.tag', {
							count: 2,
						}),
						color: colors['background-header'],
						bgColor: colors['positive-asset'],
					}}
					alone={false}
					disabled
				/>
			</FactionButtonSetting>
		</View>
	)
}

export const Notifications: React.FC<ScreenProps.Settings.Notifications> = () => {
	const ctx = useMsgrContext()
	const colors = useThemeColor()
	const { t }: any = useTranslation()
	const [{ padding, text }, { scaleSize }] = useStyles()

	return (
		<Layout style={{ backgroundColor: colors['main-background'], flex: 1 }}>
			<ScrollView bounces={false}>
				<View style={[padding.medium, { backgroundColor: colors['background-header'] }]}>
					<Text
						style={[
							text.align.center,
							padding.horizontal.big,
							padding.top.small,
							{ fontSize: 10 * scaleSize, color: colors['reverted-main-text'] },
						]}
					>
						{ctx.persistentOptions?.notifications.enable
							? t('settings.notifications.enabled-desc')
							: t('settings.notifications.disabled-desc')}
					</Text>
				</View>
				<BodyNotifications />
			</ScrollView>
		</Layout>
	)
}
