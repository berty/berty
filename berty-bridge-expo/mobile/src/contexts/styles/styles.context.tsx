import { useWindowDimensions } from "react-native";
import React, { createContext, useContext } from 'react'

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
	const {
		height: windowHeight,
		width: windowWidth,
		fontScale: systemFontScale,
	} = useWindowDimensions()
	const stylesState = React.useMemo(() => {
		const isLandscape = windowHeight < windowWidth
		const _scaleHeight =
			windowHeight / Math.max(isLandscape ? iPhone11ShortEdge : iPhone11LongEdge, windowHeight)
		const _scaleSize =
			windowWidth / Math.max(isLandscape ? iPhone11LongEdge : iPhone11ShortEdge, windowWidth)
		return mapScaledDeclarationWithDims(defaultStylesDeclaration, {
			fontScale: systemFontScale * _scaleSize,
			scaleSize: _scaleSize,
			scaleHeight: _scaleHeight,
		})
	}, [windowHeight, windowWidth, systemFontScale])

	return (
		<styleContext.Provider value={stylesState}>
			<>{children}</>
		</styleContext.Provider>
	)
}

export const useStyles = () => {
	return useContext(styleContext)
}
