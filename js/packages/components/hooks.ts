import { useState, useCallback, useEffect } from 'react'
import { Messenger } from '@berty-tech/hooks'
import { useNavigation } from '@react-navigation/native'

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

export const useReadEffect = (convId: string, timeout: number) => {
	// timeout is the duration (in ms) that the user must stay on the page to set messages as read
	const navigation = useNavigation()
	const startRead = Messenger.useStartReadConversation(convId)
	const stopRead = Messenger.useStopReadConversation(convId)

	useEffect(() => {
		let timeoutID: ReturnType<typeof setTimeout> | null = null
		const handleStart = () => {
			if (timeoutID === null) {
				timeoutID = setTimeout(() => {
					timeoutID = null
					startRead()
				}, timeout)
			}
		}
		handleStart()
		const unsubscribeFocus = navigation.addListener('focus', handleStart)
		const handleStop = () => {
			if (timeoutID !== null) {
				clearTimeout(timeoutID)
				timeoutID = null
			}
			stopRead()
		}
		const unsubscribeBlur = navigation.addListener('blur', handleStop)
		return () => {
			unsubscribeFocus()
			unsubscribeBlur()
			handleStop()
		}
	}, [navigation, startRead, stopRead, timeout])
}
