import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'

import { DividerItem, MenuItemWithIcon, ItemSection } from '@berty/components'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useThemeColor } from '@berty/hooks'
import { ScreenFC, useNavigation } from '@berty/navigation'

export const AboutBerty: ScreenFC<'Settings.AboutBerty'> = () => {
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const { navigate } = useNavigation()
	const { t } = useTranslation()

	return (
		<ScrollView
			bounces={false}
			style={{ backgroundColor: colors['secondary-background'] }}
			contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
			showsVerticalScrollIndicator={false}
		>
			<ItemSection>
				<MenuItemWithIcon
					iconName='question-mark-circle-outline'
					onPress={() => navigate('Settings.Faq')}
				>
					{t('settings.about.faq-button')}
				</MenuItemWithIcon>
				<DividerItem />
				<MenuItemWithIcon iconName='map-outline' onPress={() => navigate('Settings.Roadmap')}>
					{t('settings.about.roadmap-button')}
				</MenuItemWithIcon>
				<DividerItem />
				<MenuItemWithIcon
					iconName='lock-outline'
					onPress={() => navigate('Settings.PrivacyPolicy')}
				>
					{t('settings.about.policy-button')}
				</MenuItemWithIcon>
				<DividerItem />
				<MenuItemWithIcon
					iconName='info-outline'
					onPress={() => navigate('Settings.CodeLicense')}
				>
					{t('settings.about.license-button')}
				</MenuItemWithIcon>
			</ItemSection>
		</ScrollView>
	)
}
