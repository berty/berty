import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { FakeData } from './FakeData'

test('Settings.FakeData renders correctly', async () => {
	await mockServices()

	const { toJSON } = renderScreen('Settings.FakeData', FakeData)
	expect(toJSON()).toMatchSnapshot()
})
