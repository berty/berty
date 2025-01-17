import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { ContactAndConversations } from './ContactAndConversations'

test('Settings.ContactAndConversations renders correctly', () => {
	const { toJSON } = renderScreen('Settings.ContactAndConversations', ContactAndConversations)
	expect(toJSON()).toMatchSnapshot()
})
