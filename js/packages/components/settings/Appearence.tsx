import React from 'react'
import { ScrollView, View } from 'react-native'
import { useSelector, useDispatch } from 'react-redux'

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

	return (
		<View style={{ backgroundColor: colors['secondary-background'], flex: 1 }}>
			<ScrollView
				bounces={false}
				contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
				showsVerticalScrollIndicator={false}
			>
				<Section>
					<ButtonSettingV2
						text='Dark mode'
						icon='bluetooth'
						toggle={{
							enable: true,
							value: isDark,
							action: () => {
								dispatch(toggleDarkTheme())
							},
						}}
					/>
					<ButtonSettingV2 text='Auto dark mode' icon='info' toggle={{ enable: true }} disabled />
					<ButtonSettingV2
						text='Theme editor'
						icon='info'
						onPress={() => navigate('Settings.ThemeEditor')}
						last
					/>
				</Section>
			</ScrollView>
		</View>
	)
}
