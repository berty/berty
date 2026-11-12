import React from 'react'
import { useColorScheme } from 'react-native'
import { useSelector } from 'react-redux'

import darkTheme from '@berty/assets/themes/dark-theme.json'
import colors from '@berty/assets/themes/default-theme.json'
import {
	blackThemeColors,
	nightThemeColors,
	selectThemeCollection,
	selectThemeIsDark,
	selectThemeSelected,
	ThemeType,
} from '@berty/redux/reducers/theme.reducer'
import { useThemeMode } from '@berty/utils/theme/themeMode'

// 'light', 'dark' or 'black': the mode that is really applied (the system setting is resolved)
export const useEffectiveThemeMode = (): 'light' | 'dark' | 'black' => {
	const mode = useThemeMode()
	const systemScheme = useColorScheme()

	if (mode === 'system') {
		return systemScheme === 'dark' ? 'dark' : 'light'
	}
	return mode
}

export const useIsDarkTheme = (): boolean => {
	const mode = useEffectiveThemeMode()
	const legacyIsDark = useSelector(selectThemeIsDark)
	return mode !== 'light' || legacyIsDark
}

export const useThemeColor = (): ThemeType => {
	const mode = useEffectiveThemeMode()
	const themeIsDark = useSelector(selectThemeIsDark)
	const themeSelected = useSelector(selectThemeSelected)
	const themeCollection = useSelector(selectThemeCollection)

	return React.useMemo(() => {
		if (mode === 'black') {
			return blackThemeColors
		}
		if (mode === 'dark') {
			return nightThemeColors
		}

		if (!Object.entries(themeCollection).length) {
			return colors
		}

		if (themeIsDark) {
			return darkTheme
		}

		let collectionColors = {}
		for (const value of Object.entries(themeCollection)) {
			if (value[0] === themeSelected) {
				collectionColors = (value[1] as any)?.colors
				break
			}
		}
		return collectionColors as ThemeType
	}, [mode, themeCollection, themeIsDark, themeSelected])
}
