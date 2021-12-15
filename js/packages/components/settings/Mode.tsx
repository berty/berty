import React from 'react'
import { withInAppNotification } from 'react-native-in-app-notification'
import { Platform, ScrollView, Vibration, View } from 'react-native'
import { Text } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import {
	useMessengerContext,
	useThemeColor,
	exportAccountToFile,
	PersistentOptionsKeys,
	useMessengerClient,
	useAccount,
} from '@berty-tech/store'
import { ScreenFC, useNavigation } from '@berty-tech/navigation'

import { ButtonSetting } from '../shared-components/SettingsButtons'

const BodyMode: React.FC = withInAppNotification(({ showNotification }: any) => {
	const [{ flex, padding, margin }] = useStyles()
	const ctx = useMessengerContext()
	const { t }: any = useTranslation()
	const colors = useThemeColor()
	const navigation = useNavigation()
	const client = useMessengerClient()
	const account = useAccount()
	const shouldNotify = !!account?.shouldNotify

	return (
		<View style={[flex.tiny, padding.medium, margin.bottom.medium]}>
			<ButtonSetting
				name={t('settings.mode.notifications')}
				icon='bell-outline'
				iconSize={30}
				iconColor={colors['background-header']}
				toggled
				varToggle={shouldNotify}
				actionToggle={async () => {
					if (!account) {
						return
					}
					try {
						await client?.notificationSetEnabled({ value: !shouldNotify })
					} catch (err) {
						console.warn('failed to toggle notification:', err)
					}
				}}
			/>
			<ButtonSetting
				name={t('onboarding.advanced-settings.title')}
				icon='peer'
				iconPack='custom'
				iconSize={30}
				iconColor={colors['background-header']}
				onPress={() => navigation.navigate('Onboarding.AdvancedSettings')}
			/>
			{__DEV__ ? (
				<ButtonSetting
					name={t('settings.mode.devtools')}
					icon='options-2-outline'
					iconColor={colors['alt-secondary-background-header']}
					onPress={() => navigation.navigate('Settings.DevTools')}
				/>
			) : null}
			<ButtonSetting
				name={t('settings.mode.dark-mode-button')}
				icon='moon-outline'
				iconColor={colors['background-header']}
				toggled
				varToggle={ctx.persistentOptions.themeColor.isDark}
				actionToggle={async () => {
					await ctx.setPersistentOption({
						type: PersistentOptionsKeys.ThemeColor,
						payload: {
							...ctx.persistentOptions.themeColor,
							isDark: !ctx.persistentOptions.themeColor.isDark,
						},
					})
				}}
			/>
			<ButtonSetting
				name={t('settings.devtools.theme-editor')}
				icon='color-palette-outline'
				iconSize={30}
				iconColor={colors['background-header']}
				onPress={() => navigation.navigate('Settings.ThemeEditor')}
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

export const Mode: ScreenFC<'Settings.Mode'> = () => {
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
