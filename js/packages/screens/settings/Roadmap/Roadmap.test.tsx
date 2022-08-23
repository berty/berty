import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { Roadmap } from './Roadmap'

test('Settings.Roadmap renders correctly', async () => {
	await mockServices()

	const { toJSON } = renderScreen('Settings.Roadmap', Roadmap)
	expect(toJSON()).toMatchSnapshot()
})
