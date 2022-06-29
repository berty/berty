import { getFirstOneToOneConv } from '@berty/utils/testing/helpers'
import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { OneToOneSettings } from './OneToOneSettings'

test('Chat.OneToOneSettings renders correctly', async () => {
	await mockServices()

	const conv = getFirstOneToOneConv()

	const { toJSON } = renderScreen('Chat.OneToOneSettings', OneToOneSettings, {
		convId: conv?.publicKey || '',
	})
	expect(toJSON()).toMatchSnapshot()
})
