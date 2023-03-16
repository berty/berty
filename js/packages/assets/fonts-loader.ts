import * as Font from 'expo-font'
import React from 'react'

import BoldOpenSans from '@berty/assets/font/OpenSans-Bold.ttf'
import LightOpenSans from '@berty/assets/font/OpenSans-Light.ttf'
import LightItalicOpenSans from '@berty/assets/font/OpenSans-LightItalic.ttf'
import RegularOpenSans from '@berty/assets/font/OpenSans-Regular.ttf'
import SemiBoldOpenSans from '@berty/assets/font/OpenSans-SemiBold.ttf'
import SemiBoldItalicOpenSans from '@berty/assets/font/OpenSans-SemiBoldItalic.ttf'
import { useMountEffect } from '@berty/hooks'

// load Open Sans font for web
export const useFonts = () => {
	const [isFontLoaded, setIsFontLoaded] = React.useState(false)

	const loadFontAsync = React.useCallback(async () => {
		try {
			await Font.loadAsync({
				'Bold Open Sans': {
					uri: BoldOpenSans,
					display: Font.FontDisplay.SWAP,
				},
				'Light Open Sans': {
					uri: LightOpenSans,
					display: Font.FontDisplay.SWAP,
				},
				'Light Italic Open Sans': {
					uri: LightItalicOpenSans,
					display: Font.FontDisplay.SWAP,
				},
				'Open Sans': {
					uri: SemiBoldOpenSans,
					display: Font.FontDisplay.SWAP,
				},
				'Italic Open Sans': {
					uri: SemiBoldItalicOpenSans,
					display: Font.FontDisplay.SWAP,
				},
				'Regular Open Sans': {
					uri: RegularOpenSans,
					display: Font.FontDisplay.SWAP,
				},
			})
			setIsFontLoaded(true)
		} catch (error) {
			console.log('Font Load Error:', error)
		}
	}, [])

	useMountEffect(() => {
		loadFontAsync()
	})

	return {
		isFontLoaded,
	}
}
