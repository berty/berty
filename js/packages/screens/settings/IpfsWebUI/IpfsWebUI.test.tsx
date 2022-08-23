import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { IpfsWebUI } from './IpfsWebUI'

test('Settings.IpfsWebUI renders correctly', async () => {
	await mockServices()

	const { toJSON } = renderScreen('Settings.IpfsWebUI', IpfsWebUI)
	expect(toJSON()).toMatchSnapshot()
})
