import React, { createContext, useContext, useState } from 'react'
import { PixelRatio, useWindowDimensions } from 'react-native'

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

export const StyleProvider: React.FC = ({ children }) => {
	const { height: windowHeight, width: windowWidth } = useWindowDimensions()
	const [stylesState, setStylesState] = useState(defaultStyles)
	React.useEffect(() => {
		const isLandscape = windowHeight < windowWidth
		const _scaleHeight =
			windowHeight / Math.max(isLandscape ? iPhone11ShortEdge : iPhone11LongEdge, windowHeight)
		const _scaleSize =
			windowWidth / Math.max(isLandscape ? iPhone11LongEdge : iPhone11ShortEdge, windowWidth)
		const _fontScale = PixelRatio.getFontScale() * _scaleSize
		setStylesState(
			mapScaledDeclarationWithDims(defaultStylesDeclaration, {
				fontScale: _fontScale,
				scaleSize: _scaleSize,
				scaleHeight: _scaleHeight,
			}),
		)
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
