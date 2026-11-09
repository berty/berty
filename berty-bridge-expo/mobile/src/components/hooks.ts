import { useState, useCallback } from 'react'
import { LayoutChangeEvent, LayoutRectangle } from 'react-native'

export const useLayout = (): [LayoutRectangle, (e: LayoutChangeEvent) => void] => {
	const [layout, setLayout] = useState<LayoutRectangle>({
		x: 0,
		y: 0,
		width: 0,
		height: 0,
	})

	const onLayout = useCallback(
		(e: LayoutChangeEvent) =>
			setLayout({
				x: e.nativeEvent.layout.x,
				y: e.nativeEvent.layout.y,
				width: e.nativeEvent.layout.width,
				height: e.nativeEvent.layout.height,
			}),
		[],
	)
	return [layout, onLayout]
}
