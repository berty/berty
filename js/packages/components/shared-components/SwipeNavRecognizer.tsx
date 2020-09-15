import { useNavigation } from '@berty-tech/navigation'
import { debounce } from 'lodash'
import React from 'react'
import { View } from 'react-native'
import GestureRecognizer from 'react-native-swipe-gestures'

//
// Without any props, this will call goBack() on swipe right
//
// This component's parent must have flex: 1
//
// The onSwipe callbacks do not have to be navigation functions,
// but might be best for sanity if they are.
//

export const SwipeNavRecognizer: React.FC<{
	children: any
	stylesRecognizer?: any
	onSwipe?: (gestureName: string) => void
	onSwipeRight?: () => void
	onSwipeLeft?: () => void
}> = ({ children = null, stylesRecognizer = { flex: 1 }, onSwipe, onSwipeLeft, onSwipeRight }) => {
	const { goBack } = useNavigation()
	const debouncer = (fn: any) => debounce(fn, 500, { leading: true })

	return (
		// <View style={{ flex: 1 }}>
		<GestureRecognizer
			onSwipeRight={
				onSwipeRight
					? debouncer(onSwipeRight)
					: !onSwipe && !onSwipeLeft
					? debouncer(goBack)
					: undefined
			}
			onSwipeLeft={onSwipeLeft && debouncer(onSwipeLeft)}
			onSwipe={onSwipe && debouncer((gestureName: string) => onSwipe(gestureName))}
			style={stylesRecognizer}
		>
			{children}
		</GestureRecognizer>
		// </View>
	)
}
