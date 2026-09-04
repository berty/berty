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
	// Tracks the value from the previous render. Reading a ref while rendering is
	// not allowed, so this keeps the pair in state and adjusts it during render.
	const [current, setCurrent] = useState<T | undefined>(undefined)
	const [previous, setPrevious] = useState<T | undefined>(undefined)

	if (value !== current) {
		setPrevious(current)
		setCurrent(value)
	}

	return previous
}
