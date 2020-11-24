import React from 'react'
import { GestureResponderEvent, PanResponder, PanResponderGestureState, View } from 'react-native'

import { useNavigation } from '@berty-tech/navigation'

//
// Without any props, this will call goBack() on swipe right
//
// This component's parent must have flex: 1
//
// The onSwipe callbacks do not have to be navigation functions,
// but might be best for sanity if they are.
//

const navSwipeVelocityThreshold = 0.3
const onSwipeHorizontalOffsetThreshold = 100
const onSwipeVerticalOffsetThreshold = 90

export const SwipeNavRecognizer: React.FC<{
	children: any
	onSwipeRight?: () => void
	onSwipeLeft?: () => void
	onSwipeUp?: () => void
	onSwipeDown?: () => void
	styles?: any
	noActionOnRightSwipe?: boolean
}> = ({
	children,
	onSwipeRight,
	onSwipeLeft,
	onSwipeUp,
	onSwipeDown,
	styles = { flex: 1 },
	noActionOnRightSwipe = false,
}) => {
	const { goBack } = useNavigation()

	const swipeRightHandler: (() => void) | undefined = onSwipeRight
		? onSwipeRight
		: noActionOnRightSwipe
		? undefined
		: goBack

	const swipeLeftHandler: (() => void) | undefined = onSwipeLeft || undefined
	const swipeUpHandler: (() => void) | undefined = onSwipeUp || undefined
	const swipeDownHandler: (() => void) | undefined = onSwipeDown || undefined

	const onSwipeHandler = React.useCallback(
		(_, gestureState) => {
			if (gestureState.dy > onSwipeVerticalOffsetThreshold) {
				return swipeDownHandler && swipeDownHandler()
			} else if (gestureState.dy < -onSwipeVerticalOffsetThreshold) {
				return swipeUpHandler && swipeUpHandler()
			} else if (gestureState.dx > onSwipeHorizontalOffsetThreshold) {
				return swipeRightHandler && swipeRightHandler()
			}
			return swipeLeftHandler && swipeLeftHandler()
		},
		[swipeUpHandler, swipeDownHandler, swipeLeftHandler, swipeRightHandler],
	)

	const isSwipe = React.useCallback(
		(evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
			const toSwipe =
				(evt.nativeEvent.touches.length === 1 &&
					Math.abs(gestureState.dy) > onSwipeVerticalOffsetThreshold &&
					Math.abs(gestureState.vy) > navSwipeVelocityThreshold &&
					Math.abs(gestureState.dx) < Math.abs(gestureState.dy)) ||
				(evt.nativeEvent.touches.length === 1 &&
					Math.abs(gestureState.dx) > onSwipeHorizontalOffsetThreshold &&
					Math.abs(gestureState.vx) > navSwipeVelocityThreshold &&
					Math.abs(gestureState.dy) < Math.abs(gestureState.dx))
			return toSwipe
		},
		[],
	)

	const panResponder = React.useMemo(() => {
		return PanResponder.create({
			onPanResponderRelease: onSwipeHandler,
			onPanResponderTerminate: onSwipeHandler,
			onStartShouldSetPanResponder: () => false,
			onMoveShouldSetPanResponder: isSwipe,
		})
	}, [onSwipeHandler, isSwipe])

	return (
		<View style={styles} {...panResponder.panHandlers}>
			{children}
		</View>
	)
}
