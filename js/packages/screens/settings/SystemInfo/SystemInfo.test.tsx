import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { SystemInfo } from './SystemInfo'

test('Settings.SystemInfo renders correctly', async () => {
	await mockServices()

	const { toJSON } = renderScreen('Settings.SystemInfo', SystemInfo)
	expect(toJSON()).toMatchSnapshot()
})
