import 'react-native'
import React from 'react'
import renderer from 'react-test-renderer'

import App from './App'

// Note: test renderer must be required after react-native.

jest.mock('react-native/Libraries/LogBox/LogBox')

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
