import React from 'react'
import { View, ScrollView, Linking, StatusBar } from 'react-native'
import { Layout } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import { useThemeColor } from '@berty-tech/store/hooks'

import { ButtonSetting, ButtonSettingRow } from '../shared-components/SettingsButtons'

//
// About Berty
//

// Styles
const useStylesAboutBerty = () => {
	const [{ padding, text, margin, minHeight }] = useStyles()
	return {
		headerInfosTitleText: padding.left.scale(10),
		headerInfosButtonText: text.size.scale(15),
		firstHeaderButtonRow: [margin.right.small, minHeight(108)],
		secondHeaderButtonRow: [margin.right.scale(10), minHeight(108)],
		firstButtonRow: margin.right.scale(10),
		secondButtonRow: margin.left.scale(10),
		buttonRowMarginTop: margin.top.scale(20),
	}
}

const HeaderAboutBerty: React.FC<{}> = () => {
	const _styles = useStylesAboutBerty()
	const [{ text, padding }] = useStyles()
	const colors = useThemeColor()
	const { t }: any = useTranslation()

	return (
		<View>
			<View style={padding.top.medium}>
				<ButtonSettingRow
					state={[
						{
							name: t('settings.about.top-left-button'),
							icon: 'lock-outline',
							color: colors['secondary-background-header'],
							style: _styles.firstHeaderButtonRow,
							disabled: true,
						},
						{
							name: t('settings.about.top-right-button'),
							icon: 'settings-2-outline',
							color: colors['background-header'],
							style: _styles.secondHeaderButtonRow,
							disabled: true,
						},
					]}
					styleText={text.bold.medium}
				/>
				<ButtonSettingRow
					state={[
						{
							name: t('settings.about.bottom-left-button'),
							icon: 'question-mark-circle-outline',
							color: colors['secondary-background-header'],
							style: _styles.firstHeaderButtonRow,
							disabled: true,
						},
						{
							name: t('settings.about.bottom-right-button'),
							icon: 'settings-2-outline',
							color: colors['background-header'],
							style: _styles.secondHeaderButtonRow,
							disabled: true,
						},
					]}
					style={_styles.buttonRowMarginTop}
					styleText={text.bold.medium}
				/>
			</View>
		</View>
	)
}

const BodyAboutBerty: React.FC<{}> = () => {
	const _styles = useStylesAboutBerty()
	const navigation = useNavigation()
	const [{ flex, margin, padding }] = useStyles()
	const colors = useThemeColor()
	const { t }: any = useTranslation()

	return (
		<View style={[flex.tiny, padding.medium, margin.bottom.medium]}>
			<ButtonSetting
				name={t('settings.about.terms-button')}
				icon='info-outline'
				iconSize={30}
				iconColor={colors['background-header']}
				actionIcon='arrow-ios-forward'
				onPress={() => navigation.navigate.settings.termsOfUse()}
			/>
			<ButtonSetting
				name={t('settings.about.privacy-button')}
				icon='book-open-outline'
				iconSize={30}
				iconColor={colors['background-header']}
				actionIcon='arrow-ios-forward'
				disabled
			/>
			<ButtonSetting
				name={t('settings.about.software-button')}
				icon='award-outline'
				iconSize={30}
				iconColor={colors['background-header']}
				actionIcon='arrow-ios-forward'
				disabled
			/>
			<ButtonSettingRow
				state={[
					{
						onPress: () => Linking.openURL('mailto:hello@berty.tech'),
						name: t('settings.about.contact-button'),
						icon: 'email-outline',
						color: colors['background-header'],
						style: _styles.firstButtonRow,
					},
					{
						onPress: () => Linking.openURL('https://berty.tech'),
						name: t('settings.about.website-button'),
						icon: 'globe-outline',
						color: colors['background-header'],
						style: _styles.secondButtonRow,
					},
				]}
				style={_styles.buttonRowMarginTop}
			/>
		</View>
	)
}

export const AboutBerty: React.FC<ScreenProps.Settings.AboutBerty> = () => {
	const colors = useThemeColor()
	const [{ padding }] = useStyles()

	return (
		<Layout style={{ backgroundColor: colors['main-background'], flex: 1 }}>
			<StatusBar backgroundColor={colors['background-header']} barStyle={'light-content'} />
			<ScrollView bounces={false}>
				<View style={[padding.medium, { backgroundColor: colors['background-header'] }]}>
					<HeaderAboutBerty />
				</View>
				<BodyAboutBerty />
			</ScrollView>
		</Layout>
	)
}
