import { PixelRatio, Dimensions } from 'react-native'

const { height, width } = Dimensions.get('window')
const iPhone11ShortEdge = 414
const iPhone11LongEdge = 896

const dimensions = {
	shortEdge: Math.min(height, width),
	longEdge: Math.max(width, height),
}

const { shortEdge, longEdge } = dimensions

const shortEdgeRatio = shortEdge / Math.max(shortEdge, iPhone11ShortEdge)
const longEdgeRatio = longEdge / Math.max(longEdge, iPhone11LongEdge)
export const scaleSize = Math.min(shortEdgeRatio, 1)
export const scaleHeight = Math.min(longEdgeRatio, 1)
export const fontScale = PixelRatio.getFontScale() * scaleSize
