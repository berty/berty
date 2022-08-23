import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { AddDevConversations } from './AddDevConversations'

test('Settings.AddDevConversations renders correctly', () => {
	const { toJSON } = renderScreen('Settings.AddDevConversations', AddDevConversations)
	expect(toJSON()).toMatchSnapshot()
})
