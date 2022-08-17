import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { DeleteAccount } from './DeleteAccount'

test('Settings.DeleteAccount renders correctly', async () => {
	await mockServices()

	const { toJSON } = renderScreen('Settings.DeleteAccount', DeleteAccount)
	expect(toJSON()).toMatchSnapshot()
})
