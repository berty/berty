import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { AddDevConversations } from './AddDevConversations'

test('Settings.AddDevConversations renders correctly', async () => {
	await mockServices()

	const { toJSON } = renderScreen('Settings.AddDevConversations', AddDevConversations)
	expect(toJSON()).toMatchSnapshot()
})
