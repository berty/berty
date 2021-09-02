import 'react-native'
import React from 'react'
import App from './App'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

jest.useFakeTimers()

describe('Berty MessengerApp', () => {
	it('Renderer test', () => {
		renderer.create(<App />)
	})
})
