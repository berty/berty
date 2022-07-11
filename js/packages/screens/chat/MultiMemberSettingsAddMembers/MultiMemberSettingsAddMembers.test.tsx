import { getFirstMultiMemberConv } from '@berty/utils/testing/helpers'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { MultiMemberSettingsAddMembers } from './MultiMemberSettingsAddMembers'

test('Chat.MultiMemberSettingsAddMembers renders correctly', async () => {
	const conv = getFirstMultiMemberConv()

	const { toJSON } = renderScreen(
		'Chat.MultiMemberSettingsAddMembers',
		MultiMemberSettingsAddMembers,
		{ convPK: conv?.publicKey || '' },
	)
	expect(toJSON()).toMatchSnapshot()
})
