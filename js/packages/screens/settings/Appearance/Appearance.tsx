import React from 'react'
import { ScrollView, View } from 'react-native'
// import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'

import { ScreenFC, useNavigation } from '@berty/navigation'
import { useThemeColor } from '@berty/store'
// import { selectThemeIsDark, toggleDarkTheme } from '@berty/redux/reducers/theme.reducer'

import { ButtonSettingV2, Section } from '@berty/components/shared-components'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

export const Appearance: ScreenFC<'Settings.Appearance'> = () => {
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	// const isDark = useSelector(selectThemeIsDark)
	// const dispatch = useDispatch()
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
					{/*
					<ButtonSettingV2
						text={t('settings.appearance.dark-button')}
						toggle={{
							enable: true,
							value: isDark,
							action: async () => {
								dispatch(toggleDarkTheme())
							},
						}}
					/>
					*/}
					{/* TODO: replace dark toggle by a menu or a radio button:  Light, Dark, System based*/}
					<ButtonSettingV2
						text={t('settings.appearance.editor-button')}
						onPress={() => navigate('Settings.ThemeEditor')}
						last
					/>
				</Section>
			</ScrollView>
		</View>
	)
}
