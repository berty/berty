import { getFirstContact } from '@berty/utils/testing/helpers'
import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { ContactSettings } from './ContactSettings'

test('Chat.ContactSettings renders correctly', async () => {
	await mockServices()

	const contact = getFirstContact()

	const { toJSON } = renderScreen('Chat.ContactSettings', ContactSettings, {
		contactId: contact?.publicKey || '',
	})
	expect(toJSON()).toMatchSnapshot()
})
