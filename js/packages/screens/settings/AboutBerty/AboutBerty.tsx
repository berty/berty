import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, View } from 'react-native'

import { Divider, ItemMenuWithIcon, Section } from '@berty/components'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { ScreenFC, useNavigation } from '@berty/navigation'
import { useThemeColor } from '@berty/store'

export const AboutBerty: ScreenFC<'Settings.AboutBerty'> = () => {
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const { navigate } = useNavigation()
	const { t } = useTranslation()

	return (
		<View style={{ backgroundColor: colors['secondary-background'], flex: 1 }}>
			<ScrollView
				bounces={false}
				contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
				showsVerticalScrollIndicator={false}
			>
				<Section>
					<ItemMenuWithIcon
						iconName='question-mark-circle-outline'
						onPress={() => navigate('Settings.Faq')}
					>
						{t('settings.about.faq-button')}
					</ItemMenuWithIcon>
					<Divider />
					<ItemMenuWithIcon iconName='map-outline' onPress={() => navigate('Settings.Roadmap')}>
						{t('settings.about.roadmap-button')}
					</ItemMenuWithIcon>
					<Divider />
					<ItemMenuWithIcon
						iconName='lock-outline'
						onPress={() => navigate('Settings.PrivacyPolicy')}
					>
						{t('settings.about.policy-button')}
					</ItemMenuWithIcon>
					{/* <ItemMenuWithIcon iconName='info-outline' onPress={() => navigate('Settings.Op')}>
						{t('settings.about.license-button')}
					</ItemMenuWithIcon> */}
				</Section>
			</ScrollView>
		</View>
	)
}
