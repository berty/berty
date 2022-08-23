import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { DevTools } from './DevTools'

test('Settings.DevTools renders correctly', async () => {
	await mockServices()

	const { toJSON } = renderScreen('Settings.DevTools', DevTools)
	expect(toJSON()).toMatchSnapshot()
})
