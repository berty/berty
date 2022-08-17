import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { Accounts } from './Accounts'

test('Settings.Accounts renders correctly', async () => {
	await mockServices()

	const { toJSON } = renderScreen('Settings.Accounts', Accounts)
	expect(toJSON()).toMatchSnapshot()
})
