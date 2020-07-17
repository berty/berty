import { PixelRatio, Dimensions } from 'react-native'

const { height, width } = Dimensions.get('window')
const isLandscape = height < width
const iPhone11ShortEdge = 414
const iPhone11LongEdge = 896
const boundedInitialDimensions = {
	shortEdge: Math.max(isLandscape ? height : width, iPhone11ShortEdge),
	longEdge: Math.max(isLandscape ? width : height, iPhone11LongEdge),
}

export const scaleSize = Math.min(boundedInitialDimensions.shortEdge / iPhone11ShortEdge, 1)
export const scaleHeight = Math.min(boundedInitialDimensions.longEdge / iPhone11LongEdge, 1)
export const fontScale = PixelRatio.getFontScale() * scaleSize
