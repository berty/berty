import { PixelRatio, Dimensions } from 'react-native'

export const dimensions = Dimensions.get('window')
export const iphone11 = {
	width: dimensions.width < 414 ? 414 : dimensions.width,
	height: dimensions.height < 896 ? 896 : dimensions.height,
}
export const scaleSize = dimensions.width / iphone11.width
export const scaleHeight = dimensions.height / iphone11.height
export const fontScale = PixelRatio.getFontScale() * scaleSize
