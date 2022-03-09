import React from 'react'
import { ScrollView, View } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'
import { useTranslation } from 'react-i18next'

import { useStyles } from '@berty-tech/styles'
import { ScreenFC, useNavigation } from '@berty-tech/navigation'
import { useThemeColor } from '@berty-tech/store'
import { selectThemeIsDark, toggleDarkTheme } from '@berty-tech/redux/reducers/theme.reducer'

import { ButtonSettingV2, Section } from '../shared-components'

export const Appearence: ScreenFC<'Settings.Appearence'> = () => {
	const [{}, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const isDark = useSelector(selectThemeIsDark)
	const dispatch = useDispatch()
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
