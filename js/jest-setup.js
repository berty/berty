/* eslint-disable no-undef */
import 'react-native'
import i18next from 'i18next'

import { initI18N } from '@berty/i18n'

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

jest.mock('react-native-gesture-handler', () => {
	return {
		...jest.requireActual('react-native-gesture-handler/src/mocks'),
		LongPressGestureHandler: jest.fn,
		TouchableOpacity: jest.fn,
	}
})

initI18N()
i18next.changeLanguage('cimode')
