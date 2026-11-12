import { Icon } from '@ui-kitten/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'

import { MenuItem, ItemSection } from '@berty/components'
import { DividerItem } from '@berty/components/items/DividerItem'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useThemeColor } from '@berty/hooks'
import { ScreenFC, useNavigation } from '@berty/navigation'
import { setThemeMode, ThemeMode, useThemeMode } from '@berty/utils/theme/themeMode'
import { useTopInset } from '@berty/utils/react-native/useTopInset'

const MODES: { mode: ThemeMode; label: string }[] = [
	{ mode: 'system', label: 'settings.appearance.mode-system' },
	{ mode: 'light', label: 'settings.appearance.mode-light' },
	{ mode: 'dark', label: 'settings.appearance.mode-dark' },
	{ mode: 'black', label: 'settings.appearance.mode-black' },
]

export const Appearance: ScreenFC<'Settings.Appearance'> = () => {
	const { scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const { navigate } = useNavigation()
	const { t } = useTranslation()
	const topInset = useTopInset()
	const currentMode = useThemeMode()

	return (
		<View
			style={{
				backgroundColor: colors['secondary-background'] ?? colors['main-background'],
				flex: 1,
				paddingTop: topInset,
			}}
		>
			<ScrollView
				bounces={false}
				contentContainerStyle={{ paddingBottom: 12 * scaleSize }}
				showsVerticalScrollIndicator={false}
			>
				<ItemSection>
					{MODES.map(({ mode, label }, index) => (
						<React.Fragment key={mode}>
							{index > 0 && <DividerItem />}
							<TouchableOpacity
								style={styles.row}
								onPress={() => setThemeMode(mode)}
								testID={`theme-mode-${mode}`}
							>
								<Text style={[styles.label, { color: colors['main-text'] }]}>{t(label)}</Text>
								{currentMode === mode && (
									<Icon
										name='checkmark-outline'
										width={22}
										height={22}
										fill={colors['background-header']}
									/>
								)}
							</TouchableOpacity>
						</React.Fragment>
					))}
				</ItemSection>
				<ItemSection>
					<MenuItem onPress={() => navigate('Settings.ThemeEditor')}>
						{t('settings.appearance.editor-button')}
					</MenuItem>
				</ItemSection>
			</ScrollView>
		</View>
	)
}

const styles = StyleSheet.create({
	row: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		paddingHorizontal: 16,
		paddingVertical: 16,
	},
	label: {
		fontSize: 16,
	},
})
