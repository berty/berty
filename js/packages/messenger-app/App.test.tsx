import 'react-native'
import React from 'react'
import App from './App'

// Note: test renderer must be required after react-native.
import renderer from 'react-test-renderer'

jest.useFakeTimers()

jest.mock('react-native-document-picker', () => ({ default: jest.fn() }))

it('Renderer test', () => {
	renderer.create(<App />)
})
