import { useWindowDimensions } from "react-native";
import React, { createContext, useContext, useMemo } from 'react'
import { PixelRatio } from 'react-native'

import {
	initialScaleHeight,
	initialScaleSize,
	iPhone11ShortEdge,
	iPhone11LongEdge,
	initialFontScale,
} from './constant'
import { defaultStylesDeclaration, mapScaledDeclarationWithDims } from './map-declaration'
import { Styles } from './types'

const defaultStyles = mapScaledDeclarationWithDims(defaultStylesDeclaration, {
	scaleSize: initialScaleSize,
	fontScale: initialFontScale,
	scaleHeight: initialScaleHeight,
})

const styleContext = createContext<Styles>(defaultStyles)

interface StyleProviderProps {
	children: React.ReactNode
	}

export const StyleProvider = ({ children }: StyleProviderProps) => {
	const { height: windowHeight, width: windowWidth } = useWindowDimensions()

	// Derived from the window size rather than mirrored into state by an effect,
	// so the first render already uses the real scale instead of defaultStyles.
	const stylesState = useMemo(() => {
		const isLandscape = windowHeight < windowWidth
		const _scaleHeight =
			windowHeight / Math.max(isLandscape ? iPhone11ShortEdge : iPhone11LongEdge, windowHeight)
		const _scaleSize =
			windowWidth / Math.max(isLandscape ? iPhone11LongEdge : iPhone11ShortEdge, windowWidth)
		return mapScaledDeclarationWithDims(defaultStylesDeclaration, {
			fontScale: PixelRatio.getFontScale() * _scaleSize,
			scaleSize: _scaleSize,
			scaleHeight: _scaleHeight,
		})
	}, [windowHeight, windowWidth])

	return (
		<styleContext.Provider value={stylesState}>
			<>{children}</>
		</styleContext.Provider>
	)
}

export const useStyles = () => {
	return useContext(styleContext)
}
