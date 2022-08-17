import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { Appearance } from './Appearance'

test('Settings.Appearance renders correctly', async () => {
	await mockServices()

	const { toJSON } = renderScreen('Settings.Appearance', Appearance)
	expect(toJSON()).toMatchSnapshot()
})
