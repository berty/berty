/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState } from 'react'
import { useDimensions } from '@react-native-community/hooks'
import { PixelRatio } from 'react-native'

import { Declaration, Styles, ScaleSizes } from './types'
import { defaultStylesDeclaration, mapScaledDeclarationWithDims } from './map-declaration'
import {
	initialScaleHeight,
	initialScaleSize,
	iPhone11ShortEdge,
	iPhone11LongEdge,
	initialFontScale,
	initialHeight,
	initialWidth,
	iPadShortEdge,
	iPadLongEdge,
} from './constant'

const defaultStyles = mapScaledDeclarationWithDims(defaultStylesDeclaration, {
	scaleSize: initialScaleSize,
	fontScale: initialFontScale,
	scaleHeight: initialScaleHeight,
})

type SetStylesDeclaration = (
	decl: Declaration,
	setStyles: React.Dispatch<React.SetStateAction<Styles>>,
	{ fontScale, scaleSize, scaleHeight }: ScaleSizes,
) => void

const setStylesDeclaration: SetStylesDeclaration = (
	decl,
	setStyles,
	{ fontScale, scaleSize, scaleHeight } = {
		fontScale: initialFontScale,
		scaleSize: initialScaleSize,
		scaleHeight: initialScaleHeight,
	},
) => setStyles(mapScaledDeclarationWithDims(decl, { fontScale, scaleSize, scaleHeight }))

const ctx = createContext<
	[
		Styles,
		{
			scaleSize: number
			scaleHeight: number
			fontScale: number
			windowHeight: number
			windowWidth: number
			isGteIpadSize: boolean
			isLandscape: boolean
		},
		(decl: Declaration) => void,
	]
>([
	defaultStyles,
	{
		scaleSize: initialScaleSize,
		scaleHeight: initialScaleHeight,
		fontScale: initialFontScale,
		windowHeight: initialHeight,
		windowWidth: initialWidth,
		isGteIpadSize:
			Math.min(initialHeight, initialWidth) >= iPadShortEdge &&
			Math.max(initialHeight, initialWidth) >= iPadLongEdge,
		isLandscape: initialWidth > initialHeight,
	},
	() => {},
])

export const Provider: React.FC = ({ children }) => {
	const { height: windowHeight, width: windowWidth } = useDimensions().window
	const [stylesState, setStylesState] = useState(defaultStyles)
	const [scaleHeight, setScaleHeight] = useState(initialScaleHeight)
	const [scaleSize, setScaleSize] = useState(initialScaleSize)
	const [fontScale, setFontScale] = useState(initialFontScale)
	const isGteIpadSize =
		Math.min(initialHeight, initialWidth) >= iPadShortEdge &&
		Math.max(initialHeight, initialWidth) >= iPadLongEdge
	React.useEffect(() => {
		const isLandscape = windowHeight < windowWidth
		const _scaleHeight =
			windowHeight / Math.max(isLandscape ? iPhone11ShortEdge : iPhone11LongEdge, windowHeight)
		const _scaleSize =
			windowWidth / Math.max(isLandscape ? iPhone11LongEdge : iPhone11ShortEdge, windowWidth)
		const _fontScale = PixelRatio.getFontScale() * _scaleSize
		setScaleHeight(_scaleHeight)
		setScaleSize(_scaleSize)
		setFontScale(_fontScale)
		setStylesState(
			mapScaledDeclarationWithDims(defaultStylesDeclaration, {
				fontScale: _fontScale,
				scaleSize: _scaleSize,
				scaleHeight: _scaleHeight,
			}),
		)
	}, [windowHeight, windowWidth])

	return (
		<ctx.Provider
			value={[
				stylesState,
				{
					scaleHeight,
					scaleSize,
					fontScale,
					windowHeight,
					windowWidth,
					isGteIpadSize,
					isLandscape: windowWidth > windowHeight,
				},
				(decl: Declaration) =>
					setStylesDeclaration(decl, setStylesState, {
						scaleHeight,
						fontScale,
						scaleSize,
					}),
			]}
		>
			<>{children}</>
		</ctx.Provider>
	)
}

export const useStyles = () => {
	return useContext(ctx)
}
