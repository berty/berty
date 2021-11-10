/* eslint-env jest */

jest.mock('react-native/Libraries/LogBox/LogBox')

beforeEach(() => {
	jest.useFakeTimers()
	jest.resetModules()
	jest.resetAllMocks()
})
