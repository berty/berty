import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { ContactAndConversations } from './ContactAndConversations'

test('Settings.ContactAndConversations renders correctly', async () => {
	await mockServices()

	const { toJSON } = renderScreen('Settings.ContactAndConversations', ContactAndConversations)
	expect(toJSON()).toMatchSnapshot()
})
