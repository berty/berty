import React from 'react'
import { ScrollView, View } from 'react-native'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty/styles'
import { ScreenFC, useNavigation } from '@berty/navigation'
import { useThemeColor } from '@berty/store'

import { ButtonSettingV2, Section } from '../shared-components'

export const AboutBerty: ScreenFC<'Settings.AboutBerty'> = () => {
	const [{}, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const { navigate } = useNavigation()
	const { t }: { t: any } = useTranslation()

	return (
		<View style={{ backgroundColor: colors['secondary-background'], flex: 1 }}>
			<ScrollView
				bounces={false}
				contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
				showsVerticalScrollIndicator={false}
			>
				<Section>
					<ButtonSettingV2
						text={t('settings.about.faq-button')}
						onPress={() => navigate('Settings.Faq')}
						icon='question-mark-circle-outline'
					/>
					<ButtonSettingV2
						text={t('settings.about.roadmap-button')}
						icon='map-outline'
						onPress={() => navigate('Settings.Roadmap')}
					/>
					<ButtonSettingV2
						text={t('settings.about.policy-button')}
						icon='lock-outline'
						onPress={() => navigate('Settings.PrivacyPolicy')}
					/>
					<ButtonSettingV2 text={t('settings.about.license-button')} icon='info-outline' last />
				</Section>
			</ScrollView>
		</View>
	)
}
