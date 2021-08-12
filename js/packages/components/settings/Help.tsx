import React from 'react'
import { View, ScrollView, StatusBar } from 'react-native'
import { Layout, Text } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { useNavigation, ScreenProps } from '@berty-tech/navigation'
import { useThemeColor } from '@berty-tech/store/hooks'

import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'

//
// Help
//

// Styles
const useStylesHelp = () => {
	const [{ padding, margin }] = useStyles()
	const colors = useThemeColor()

	return {
		rowButtons: padding.top.tiny,
		firstRowButton: margin.right.small,
		secondRowButton: margin.left.small,
		headerButtonText: {
			paddingLeft: 28,
			color: colors['main-text'],
			fontSize: 10,
			marginLeft: 6,
		},
	}
}

const HeaderHelp: React.FC<{}> = () => {
	const [{ text }] = useStyles()
	const colors = useThemeColor()
	const _helpStyles = useStylesHelp()
	const { t }: any = useTranslation()

	return (
		<View>
			<ButtonSetting
				name={t('settings.help.security-privacy-button.title')}
				icon='shield-outline'
				iconSize={30}
				iconColor={colors['secondary-background-header']}
				actionIcon='arrow-ios-forward'
				disabled={true}
			>
				<Text style={[text.bold.medium, _helpStyles.headerButtonText]}>
					{t('settings.help.security-privacy-button.desc')}
				</Text>
			</ButtonSetting>
		</View>
	)
}

const BodyHelp: React.FC<{}> = () => {
	const _styles = useStylesHelp()
	const [{ padding }] = useStyles()
	const colors = useThemeColor()
	const { navigate } = useNavigation()
	const { t }: any = useTranslation()

	return (
		<View style={padding.medium}>
			<ButtonSetting
				name={t('settings.help.updates-button')}
				icon='arrow-upward-outline'
				iconColor={colors['secondary-background-header']}
				onPress={() => navigate.settings.appUpdates()}
			/>
			<ButtonSetting
				name={t('settings.help.about-button')}
				icon='info-outline'
				iconColor={colors['secondary-background-header']}
				onPress={() => navigate.settings.aboutBerty()}
			/>
			<ButtonSetting
				name={t('settings.help.account-button')}
				icon='person-outline'
				iconSize={30}
				iconColor={colors['secondary-background-header']}
				actionIcon='arrow-ios-forward'
				disabled={true}
			/>
			<ButtonSetting
				name={t('settings.help.contact-button')}
				icon='user-plus'
				iconPack='custom'
				iconSize={30}
				iconColor={colors['secondary-background-header']}
				actionIcon='arrow-ios-forward'
				disabled={true}
			/>
			<ButtonSetting
				name={t('settings.help.message-button')}
				icon='paper-plane-outline'
				iconSize={30}
				iconColor={colors['secondary-background-header']}
				actionIcon='arrow-ios-forward'
				disabled={true}
			/>
			<ButtonSetting
				name={t('settings.help.group-button')}
				icon='users'
				iconPack='custom'
				iconSize={30}
				iconColor={colors['secondary-background-header']}
				actionIcon='arrow-ios-forward'
				disabled={true}
			/>
			<ButtonSetting
				name={t('settings.help.settings-button')}
				icon='settings-2-outline'
				iconSize={30}
				iconColor={colors['secondary-background-header']}
				actionIcon='arrow-ios-forward'
				disabled={true}
			/>
			<View style={[_styles.rowButtons]}>
				<ButtonSettingRow
					state={[
						{
							name: t('settings.help.ask-button'),
							icon: 'question-mark-circle-outline',
							color: colors['secondary-background-header'],
							style: _styles.firstRowButton,
							disabled: true,
						},
						{
							name: t('settings.help.report-button'),
							icon: 'bulb-outline',
							color: colors['secondary-background-header'],
							style: _styles.secondRowButton,
							disabled: true,
						},
					]}
				/>
			</View>
		</View>
	)
}

export const Help: React.FC<ScreenProps.Settings.Help> = () => {
	const colors = useThemeColor()
	const [{ padding }] = useStyles()

	return (
		<Layout style={{ backgroundColor: colors['main-background'], flex: 1 }}>
			<StatusBar backgroundColor={colors['secondary-background-header']} barStyle='light-content' />
			<ScrollView bounces={false}>
				<View style={[padding.medium, { backgroundColor: colors['secondary-background-header'] }]}>
					<HeaderHelp />
				</View>
				<BodyHelp />
			</ScrollView>
		</Layout>
	)
}
