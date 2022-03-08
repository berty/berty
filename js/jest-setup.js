/* eslint-disable no-undef */
import 'react-native'

// @ts-ignore
global.__reanimatedWorkletInit = jest.fn()

jest.mock('react-native-reanimated', () => {
	return {
		// @ts-ignore
		...jest.requireActual('react-native-reanimated/mock'),
		useSharedValue: jest.fn,
		useAnimatedStyle: jest.fn,
		withTiming: jest.fn,
		withSpring: jest.fn,
		withRepeat: jest.fn,
		withSequence: jest.fn,
		useAnimatedProps: jest.fn,
		Easing: {
			linear: jest.fn,
			elastic: jest.fn,
		},
	}
})

jest.mock('@gorhom/bottom-sheet', () => require('react-native-reanimated/mock'))
