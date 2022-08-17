import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { Notifications } from './Notifications'

test('Settings.Notifications renders correctly', async () => {
	await mockServices()

	const { toJSON } = renderScreen('Settings.Notifications', Notifications)
	expect(toJSON()).toMatchSnapshot()
})
