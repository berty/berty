import { PixelRatio, Dimensions } from 'react-native'

export const { height: initialHeight, width: initialWidth } = Dimensions.get('window')
export const iPhone11ShortEdge = 414
export const iPhone11LongEdge = 896
export const iPadShortEdge = 768
export const iPadLongEdge = 1024

const initialIsLandscape = initialHeight < initialWidth

export const initialScaleSize =
	initialWidth / Math.max(initialIsLandscape ? iPhone11LongEdge : iPhone11ShortEdge, initialWidth)
export const initialScaleHeight =
	initialHeight / Math.max(initialIsLandscape ? iPhone11ShortEdge : iPhone11LongEdge, initialHeight)

export const initialFontScale = PixelRatio.getFontScale() * initialScaleSize
