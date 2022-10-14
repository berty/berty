import { getFirstMultiMemberConv } from '@berty/utils/testing/helpers'
import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { MultiMember } from './MultiMember'

test('Chat.MultiMember renders correctly', async () => {
	await mockServices()

	const conv = getFirstMultiMemberConv()

	const { toJSON } = renderScreen('Chat.MultiMember', MultiMember, {
		convId: conv?.publicKey || '',
	})
	expect(toJSON()).toMatchSnapshot()
})
