import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { FakeData } from './FakeData'

test('Settings.FakeData renders correctly', () => {
	const { toJSON } = renderScreen('Settings.FakeData', FakeData)
	expect(toJSON()).toMatchSnapshot()
})
