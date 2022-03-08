import 'react-native'
import React from 'react'
import App from './App'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

jest.mock('react-native/Libraries/LogBox/LogBox')

jest.mock('react-native-reanimated', () => {
	const { View } = require('react-native')
	return {
		Value: jest.fn(),
		event: jest.fn(),
		add: jest.fn(),
		eq: jest.fn(),
		set: jest.fn(),
		cond: jest.fn(),
		interpolate: jest.fn(),
		View,
		Extrapolate: { CLAMP: jest.fn() },
		Transition: {
			Together: 'Together',
			Out: 'Out',
			In: 'In',
		},
		Easing: {
			in: jest.fn(),
			out: jest.fn(),
			inOut: jest.fn(),
		},
	}
})

describe('Berty MessengerApp', () => {
	beforeEach(() => {
		jest.resetModules()
		jest.resetAllMocks()
		jest.useFakeTimers()
	})
	it('Renderer test', done => {
		renderer.create(<App />)
		done()
	})
})
