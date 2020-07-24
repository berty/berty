/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { createContext, useContext, useState } from 'react'
import { Declaration, Styles, ScaleSizes } from './types'
import { defaultStylesDeclaration, mapScaledDeclarationWithDims } from './map-declaration'
import {
	initialScaleHeight,
	initialScaleSize,
	iPhone11ShortEdge,
	iPhone11LongEdge,
	initialFontScale,
} from './constant'
import { useDimensions } from '@react-native-community/hooks'
import { PixelRatio } from 'react-native'

const defaultStyles = mapScaledDeclarationWithDims(defaultStylesDeclaration, {
	scaleSize: initialScaleSize,
	fontScale: initialFontScale,
	scaleHeight: initialScaleHeight,
})

export type SetStylesDeclaration = (
	decl: Declaration,
	setStyles: React.Dispatch<React.SetStateAction<Styles>>,
	{ fontScale, scaleSize, scaleHeight }: ScaleSizes,
) => void

export const setStylesDeclaration: SetStylesDeclaration = (
	decl,
	setStyles,
	{ fontScale, scaleSize, scaleHeight } = {
		fontScale: initialFontScale,
		scaleSize: initialScaleSize,
		scaleHeight: initialScaleHeight,
	},
) => setStyles(mapScaledDeclarationWithDims(decl, { fontScale, scaleSize, scaleHeight }))

export const ctx: React.Context<any> = createContext<any>([
	defaultStyles,
	{
		scaleSize: initialScaleSize,
		scaleHeight: initialScaleHeight,
		fontScale: initialFontScale,
	},
	(decl: Declaration) => {},
])

export const Provider: React.FC = ({ children }) => {
	const { height: windowHeight, width: windowWidth } = useDimensions().window
	const [stylesState, setStylesState] = useState(defaultStyles)
	const [scaleHeight, setScaleHeight] = useState(initialScaleHeight)
	const [scaleSize, setScaleSize] = useState(initialScaleSize)
	const [fontScale, setFontScale] = useState(initialFontScale)
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
		// console.log('recalculating styles')
	}, [windowHeight, windowWidth])
	return (
		<ctx.Provider
			value={[
				stylesState,
				{ scaleHeight, scaleSize, fontScale },
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
export const Consumer = ctx.Consumer

export const useStyles = () => {
	return useContext(ctx)
}
