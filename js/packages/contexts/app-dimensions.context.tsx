import React, { createContext, useContext, useState } from 'react'
import { useDimensions } from '@react-native-community/hooks'
import { PixelRatio } from 'react-native'

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
} from './styles/constant'

const appDimensionsContext = createContext<{
	scaleSize: number
	scaleHeight: number
	fontScale: number
	windowHeight: number
	windowWidth: number
	isGteIpadSize: boolean
	isLandscape: boolean
}>({
	scaleSize: initialScaleSize,
	scaleHeight: initialScaleHeight,
	fontScale: initialFontScale,
	windowHeight: initialHeight,
	windowWidth: initialWidth,
	isGteIpadSize:
		Math.min(initialHeight, initialWidth) >= iPadShortEdge &&
		Math.max(initialHeight, initialWidth) >= iPadLongEdge,
	isLandscape: initialWidth > initialHeight,
})

export const AppDimensionsProvider: React.FC = ({ children }) => {
	const { height: windowHeight, width: windowWidth } = useDimensions().window
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
	}, [windowHeight, windowWidth])

	return (
		<appDimensionsContext.Provider
			value={{
				scaleHeight,
				scaleSize,
				fontScale,
				windowHeight,
				windowWidth,
				isGteIpadSize,
				isLandscape: windowWidth > windowHeight,
			}}
		>
			<>{children}</>
		</appDimensionsContext.Provider>
	)
}

export const useAppDimensions = () => {
	return useContext(appDimensionsContext)
}
