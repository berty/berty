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

export const SwipeNavRecognizer: React.FC<{
	children: any
	onSwipeRight?: () => void
	onSwipeLeft?: () => void
	styles?: any
	noActionOnRightSwipe?: boolean
}> = ({
	children,
	onSwipeRight,
	onSwipeLeft,
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

	const onSwipeHandler = React.useCallback(
		(_, gestureState) => {
			const gestureName =
				gestureState.dx > onSwipeHorizontalOffsetThreshold ? 'SWIPE_RIGHT' : 'SWIPE_LEFT'
			return gestureName === 'SWIPE_LEFT'
				? swipeLeftHandler && swipeLeftHandler()
				: swipeRightHandler && swipeRightHandler()
		},
		[swipeLeftHandler, swipeRightHandler],
	)

	const isHorizontalSwipe = React.useCallback(
		(evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
			const toSwipe =
				evt.nativeEvent.touches.length === 1 &&
				Math.abs(gestureState.dx) > onSwipeHorizontalOffsetThreshold &&
				Math.abs(gestureState.vx) > navSwipeVelocityThreshold &&
				Math.abs(gestureState.dy) < Math.abs(gestureState.dx)
			return toSwipe
		},
		[],
	)

	const panResponder = React.useMemo(() => {
		return PanResponder.create({
			onPanResponderRelease: onSwipeHandler,
			onPanResponderTerminate: onSwipeHandler,
			onStartShouldSetPanResponder: () => false,
			onMoveShouldSetPanResponder: isHorizontalSwipe,
		})
	}, [onSwipeHandler, isHorizontalSwipe])

	return (
		<View style={styles} {...panResponder.panHandlers}>
			{children}
		</View>
	)
}

//
// cancels onPress callbacks when swiping
//
// workaround to allow createMaterialTopNavigator swipe gesture option
// on TabBar views with full-screen-width TouchableOpacity items
//

export const SwipeHelperReactNavTabBar: React.FC<{
	children: any
	styles?: any
}> = ({ children, styles = { flex: 1 } }) => {
	const isHorizontalSwipe = React.useCallback(
		(evt: GestureResponderEvent, gestureState: PanResponderGestureState) => {
			const toSwipe =
				evt.nativeEvent.touches.length === 1 &&
				Math.abs(gestureState.dx) > onSwipeHorizontalOffsetThreshold &&
				Math.abs(gestureState.vx) > navSwipeVelocityThreshold &&
				Math.abs(gestureState.dy) < Math.abs(gestureState.dx)
			return toSwipe
		},
		[],
	)

	const panResponder = React.useMemo(() => {
		return PanResponder.create({
			onMoveShouldSetPanResponder: isHorizontalSwipe,
		})
	}, [isHorizontalSwipe])

	return (
		<View style={styles} {...panResponder.panHandlers}>
			{children}
		</View>
	)
}
