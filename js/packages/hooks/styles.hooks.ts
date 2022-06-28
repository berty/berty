import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

export const useStylesBertyId = ({
	iconIdSize = 45,
	iconShareSize = 26,
	titleSize = 26,
	contentScaleFactor = 0.66,
	avatarSize = 90,
}: {
	iconIdSize?: number
	iconShareSize?: number
	titleSize?: number
	contentScaleFactor?: number
	avatarSize?: number
}) => {
	const _iconIdSize = iconIdSize
	const _iconShareSize = iconShareSize
	const _titleSize = titleSize
	const bertyIdContentScaleFactor = contentScaleFactor
	const requestAvatarSize = avatarSize

	const { fontScale, scaleSize, windowHeight, windowWidth, isGteIpadSize } = useAppDimensions()
	const _bertyIdButtonSize = 60 * scaleSize

	// Make sure we can always see the whole QR code on the screen, even if need to scroll

	const qrCodeSize = isGteIpadSize
		? Math.min(windowHeight, windowWidth) * 0.3
		: Math.min(windowHeight * bertyIdContentScaleFactor, windowWidth * bertyIdContentScaleFactor) -
		  1.25 * _titleSize

	return {
		qrCodeSize,
		bertyIdContentScaleFactor,
		iconShareSize: _iconShareSize * scaleSize,
		iconIdSize: _iconIdSize * scaleSize,
		titleSize: _titleSize * fontScale,
		requestAvatarSize,
		styleBertyIdButton: {
			width: _bertyIdButtonSize,
			height: _bertyIdButtonSize,
			borderRadius: _bertyIdButtonSize / 2,
			marginRight: _bertyIdButtonSize,
			bottom: _bertyIdButtonSize / 2,
		},
		styleBertyIdContent: { paddingBottom: _bertyIdButtonSize / 2 + 10 },
	}
}
