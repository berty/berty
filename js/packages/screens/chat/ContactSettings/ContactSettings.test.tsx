import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { ContactSettings } from './ContactSettings'

test('Chat.ContactSettings renders correctly', async () => {
	const { toJSON } = renderScreen('Chat.ContactSettings', ContactSettings, { contactId: '' })
	expect(toJSON()).toMatchSnapshot()
})
