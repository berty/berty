import React from 'react'
import { useSelector } from 'react-redux'

import darkTheme from '@berty/assets/themes/dark-theme.json'
import colors from '@berty/assets/themes/default-theme.json'
import {
	selectThemeCollection,
	selectThemeIsDark,
	selectThemeSelected,
	ThemeType,
} from '@berty/redux/reducers/theme.reducer'

export const useThemeColor = (): ThemeType => {
	const themeIsDark = useSelector(selectThemeIsDark)
	const themeSelected = useSelector(selectThemeSelected)
	const themeCollection = useSelector(selectThemeCollection)

	return React.useMemo(() => {
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
	}, [themeCollection, themeIsDark, themeSelected])
}
