import React, { useState } from 'react'
import { View, ScrollView, TouchableOpacity, StyleSheet } from 'react-native'
import { Layout, Text, Icon } from '@ui-kitten/components'
import { Translation } from 'react-i18next'
import { useStyles } from '@berty-tech/styles'
import { useMsgrContext } from '@berty-tech/store/hooks'
import { HeaderInfoSettings, HeaderSettings } from '../common/Header'
import { ButtonSetting, FactionButtonSetting } from '../common/SettingsButtons'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import { SwipeNavRecognizer } from '../common/SwipeNavRecognizer'
import { PersistentOptionsKeys } from '@berty-tech/store/context'

//
// Notifications
//

// Types
type NotificationsPorps = {
	isAuthorize: boolean
}

// Styles
const useStylesNotifications = () => {
	const [{ padding, text }] = useStyles()
	return {
		headerInfosTitleText: padding.left.small,
		headerInfosText: text.size.scale(11),
		headerInfosButtonText: text.size.medium,
		buttonSettingText: [text.size.scale(10), padding.left.scale(39), padding.right.scale(100)],
	}
}
const _notificationsStyles = StyleSheet.create({
	bodyNotAuthorize: {
		opacity: 0.3,
	},
})

const HeaderNotifications: React.FC<NotificationsPorps> = ({ isAuthorize }) => {
	const [{ row, color, flex, text, margin, border, padding, background }] = useStyles()
	const _styles = useStylesNotifications()
	return (
		<View>
			{!isAuthorize && (
				<View>
					<HeaderInfoSettings>
						<TouchableOpacity style={[row.right]}>
							<Icon name='close-outline' width={20} height={20} fill={color.light.blue} />
						</TouchableOpacity>
						<View style={[row.center, flex.tiny, { justifyContent: 'center' }]}>
							<Icon name='alert-circle' width={25} height={25} fill={color.red} />
							<Text
								category='h6'
								style={[text.color.white, text.bold.medium, _styles.headerInfosTitleText]}
							>
								Authorize notifications
							</Text>
						</View>
						<View style={[row.item.justify, margin.top.medium, margin.horizontal.medium]}>
							<Text
								style={[
									text.bold.medium,
									text.align.center,
									text.color.white,
									row.item.justify,
									_styles.headerInfosText,
								]}
							>
								You need to authorize notifications for the Berty app in order to receive
								notifications for new messages and contact requests
							</Text>
						</View>
						<TouchableOpacity
							style={[
								background.blue,
								border.radius.medium,
								margin.horizontal.medium,
								margin.top.medium,
							]}
						>
							<View style={[margin.vertical.medium, row.center, { justifyContent: 'center' }]}>
								<Icon name='bell-outline' width={20} height={20} fill={color.white} />
								<Text
									style={[
										text.bold.medium,
										text.color.white,
										padding.left.small,
										_styles.headerInfosButtonText,
									]}
								>
									Authorize notifications
								</Text>
							</View>
						</TouchableOpacity>
					</HeaderInfoSettings>
				</View>
			)}
		</View>
	)
}

const BodyNotifications: React.FC<NotificationsPorps> = ({ isAuthorize }) => {
	const _styles = useStylesNotifications()
	const [{ flex, padding, margin, color }] = useStyles()
	const ctx = useMsgrContext()
	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<View
					style={[
						flex.tiny,
						padding.medium,
						margin.bottom.medium,
						!isAuthorize ? _notificationsStyles.bodyNotAuthorize : null,
					]}
				>
					<ButtonSetting
						name={t('settings.notifications.activate-button')}
						icon='bell-outline'
						iconSize={30}
						iconColor={color.blue}
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
						iconColor={color.blue}
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
						iconColor={color.blue}
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
						iconColor={color.blue}
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
								color: color.blue,
								bgColor: color.light.blue,
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
	const [isAuthorize] = useState(true)
	const { goBack } = useNavigation()
	const [{ padding, flex, background }] = useStyles()
	const ctx = useMsgrContext()

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<Layout style={[flex.tiny, background.white]}>
					<SwipeNavRecognizer>
						<ScrollView bounces={false} contentContainerStyle={padding.bottom.scale(90)}>
							<HeaderSettings
								title={t('settings.notifications.title')}
								desc={
									ctx.persistentOptions?.notifications.enable
										? t('settings.notifications.enabled-desc')
										: t('settings.notifications.disabled-desc')
								}
								undo={goBack}
							>
								<HeaderNotifications isAuthorize={isAuthorize} />
							</HeaderSettings>
							<BodyNotifications isAuthorize={isAuthorize} />
						</ScrollView>
					</SwipeNavRecognizer>
				</Layout>
			)}
		</Translation>
	)
}
