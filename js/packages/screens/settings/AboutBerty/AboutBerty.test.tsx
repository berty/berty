import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { AboutBerty } from './AboutBerty'

test('Settings.AboutBerty renders correctly', async () => {
	await mockServices()

	const { toJSON } = renderScreen('Settings.AboutBerty', AboutBerty)
	expect(toJSON()).toMatchSnapshot()
})
