import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { Network } from './Network'

test('Settings.Network renders correctly', async () => {
	await mockServices()

	const { toJSON } = renderScreen('Settings.Network', Network)
	expect(toJSON()).toMatchSnapshot()
})
