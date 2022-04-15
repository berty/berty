import { useState, useCallback, useRef, useEffect } from 'react'
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

export function usePrevious<T>(value: T) {
	// https://blog.logrocket.com/how-to-get-previous-props-state-with-react-hooks/
	const ref = useRef<T>()
	useEffect(() => {
		ref.current = value
	})
	return ref.current
}
