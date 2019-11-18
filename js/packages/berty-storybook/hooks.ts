import { useState, useCallback } from 'react'

export const useScroll = (): [React.NativeScrollEvent, ScrollViewProps.onScroll] => {
	const [scroll, setScroll] = useState({
		contentInset: { bottom: 0, left: 0, right: 0, top: 0 },
		contentOffset: { x: 0, y: 0 },
		contentSize: { height: 0, width: 0 },
		layoutMeasurement: { height: 0, width: 0, zoomScale: 0 },
	})
	const onScroll = useCallback((e) => setScroll(e.nativeEvent), [])
	return [scroll, onScroll]
}

export const useLayout = (): [React.NativeLayoutEvent, LayoutViewProps.onLayout] => {
	const [layout, setLayout] = useState({
		x: 0,
		y: 0,
		width: 0,
		height: 0,
	})
	const onLayout = useCallback((e) => setLayout(e.nativeEvent.layout), [])
	return [layout, onLayout]
}
