import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { MultiMemberSettingsAddMembers } from './MultiMemberSettingsAddMembers'

test('Chat.MultiMemberSettingsAddMembers renders correctly', async () => {
	const { toJSON } = renderScreen(
		'Chat.MultiMemberSettingsAddMembers',
		MultiMemberSettingsAddMembers,
		{ convPK: '' },
	)
	expect(toJSON()).toMatchSnapshot()
})
