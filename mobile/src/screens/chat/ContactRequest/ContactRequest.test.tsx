import { getFirstContact } from '@berty/utils/testing/helpers'
import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { ContactRequest } from './ContactRequest'

test('Chat.ContactRequest renders correctly', async () => {
	await mockServices()

	const contact = getFirstContact()

	const { toJSON } = renderScreen('Chat.ContactRequest', ContactRequest, {
		contactId: contact?.publicKey || '',
	})
	expect(toJSON()).toMatchSnapshot()
})
