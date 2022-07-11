import { getFirstMultiMemberConv } from '@berty/utils/testing/helpers'
import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { MultiMemberQR } from './MultiMemberQR'
test('Chat.MultiMemberQR renders correctly', async () => {
	await mockServices()

	const conv = getFirstMultiMemberConv()

	const { toJSON } = renderScreen('Chat.MultiMemberQR', MultiMemberQR, {
		convId: conv?.publicKey || '',
	})
	expect(toJSON()).toMatchSnapshot()
})
