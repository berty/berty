import { getFirstMultiMemberConv } from '@berty/utils/testing/helpers'
import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { ReplicateGroupSettings } from './ReplicateGroupSettings'

test('Chat.ReplicateGroupSettings renders correctly', async () => {
	await mockServices()

	const conv = getFirstMultiMemberConv()

	const { toJSON } = renderScreen('Chat.ReplicateGroupSettings', ReplicateGroupSettings, {
		convId: conv?.publicKey || '',
	})
	expect(toJSON()).toMatchSnapshot()
})
