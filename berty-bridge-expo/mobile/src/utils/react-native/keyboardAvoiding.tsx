import React from 'react'
import { StyleProp, ViewStyle } from 'react-native'
import { useReanimatedKeyboardAnimation } from 'react-native-keyboard-controller'
import Animated, { useAnimatedStyle } from 'react-native-reanimated'

// Keyboard avoidance via the keyboard's animated height as bottom padding (reliable
// under Android edge-to-edge, unlike KeyboardAvoidingView). Name kept for call sites.
export const IOSOnlyKeyboardAvoidingView: React.FC<{
	style?: StyleProp<ViewStyle>
	children: React.ReactNode
}> = ({ style, children }) => {
	const { height } = useReanimatedKeyboardAnimation()

	const animatedStyle = useAnimatedStyle(() => ({
		// `height` is 0 when closed and negative (-keyboardHeight) when open.
		paddingBottom: Math.max(-height.value, 0),
	}))

	return <Animated.View style={[style, animatedStyle]}>{children}</Animated.View>
}
