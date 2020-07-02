import { PixelRatio, Dimensions } from 'react-native'

const { height, width } = Dimensions.get('window')
const isLandscape = height < width
const iPhone11ShortEdge = 414
const iPhone11LongEdge = 896
const boundedInitialDimensions = {
	shortEdge: Math.min(isLandscape ? height : width, iPhone11ShortEdge),
	longEdge: Math.min(isLandscape ? width : height, iPhone11LongEdge),
}
export const scaleSize = boundedInitialDimensions.shortEdge / iPhone11ShortEdge
export const scaleHeight = boundedInitialDimensions.longEdge / iPhone11LongEdge
export const fontScale = PixelRatio.getFontScale() * scaleSize
