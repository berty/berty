import React from 'react'
import { View, ScrollView, Linking } from 'react-native'
import { Layout } from '@ui-kitten/components'
import { Translation } from 'react-i18next'
import { useStyles } from '@berty-tech/styles'
import { HeaderSettings } from '../common/Header'
import { ButtonSetting, ButtonSettingRow } from '../common/SettingsButtons'
import { ScreenProps, useNavigation } from '@berty-tech/navigation'
import { SwipeNavRecognizer } from '../common/SwipeNavRecognizer'

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
	const [{ text, color, padding }] = useStyles()

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<View>
					<View style={padding.top.medium}>
						<ButtonSettingRow
							state={[
								{
									name: t('settings.about.top-left-button'),
									icon: 'lock-outline',
									color: color.yellow,
									style: _styles.firstHeaderButtonRow,
									disabled: true,
								},
								{
									name: t('settings.about.top-right-button'),
									icon: 'settings-2-outline',
									color: color.blue,
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
									color: color.red,
									style: _styles.firstHeaderButtonRow,
									disabled: true,
								},
								{
									name: t('settings.about.bottom-right-button'),
									icon: 'settings-2-outline',
									color: color.green,
									style: _styles.secondHeaderButtonRow,
									disabled: true,
								},
							]}
							style={_styles.buttonRowMarginTop}
							styleText={text.bold.medium}
						/>
					</View>
				</View>
			)}
		</Translation>
	)
}

const BodyAboutBerty: React.FC<{}> = () => {
	const _styles = useStylesAboutBerty()
	const navigation = useNavigation()
	const [{ flex, margin, padding, color }] = useStyles()

	return (
		<Translation>
			{(t: any): React.ReactNode => (
				<View style={[flex.tiny, padding.medium, margin.bottom.medium]}>
					<ButtonSetting
						name={t('settings.about.terms-button')}
						icon='info-outline'
						iconSize={30}
						iconColor={color.blue}
						actionIcon='arrow-ios-forward'
						onPress={() => navigation.navigate.settings.termsOfUse()}
					/>
					<ButtonSetting
						name={t('settings.about.privacy-button')}
						icon='book-open-outline'
						iconSize={30}
						iconColor={color.blue}
						actionIcon='arrow-ios-forward'
						disabled
					/>
					<ButtonSetting
						name={t('settings.about.software-button')}
						icon='award-outline'
						iconSize={30}
						iconColor={color.blue}
						actionIcon='arrow-ios-forward'
						disabled
					/>
					<ButtonSettingRow
						state={[
							{
								onPress: () => Linking.openURL('mailto:hello@berty.tech'),
								name: t('settings.about.contact-button'),
								icon: 'email-outline',
								color: color.blue,
								style: _styles.firstButtonRow,
							},
							{
								onPress: () => Linking.openURL('https://berty.tech'),
								name: t('settings.about.website-button'),
								icon: 'globe-outline',
								color: color.blue,
								style: _styles.secondButtonRow,
							},
						]}
						style={_styles.buttonRowMarginTop}
					/>
				</View>
			)}
		</Translation>
	)
}

export const AboutBerty: React.FC<ScreenProps.Settings.AboutBerty> = () => {
	const { goBack } = useNavigation()
	const [{ flex, background, padding }] = useStyles()

	return (
		<Layout style={[flex.tiny, background.white]}>
			<SwipeNavRecognizer>
				<ScrollView bounces={false} contentContainerStyle={[padding.bottom.huge]}>
					<HeaderSettings title='About Berty' undo={goBack}>
						<HeaderAboutBerty />
					</HeaderSettings>
					<BodyAboutBerty />
				</ScrollView>
			</SwipeNavRecognizer>
		</Layout>
	)
}
