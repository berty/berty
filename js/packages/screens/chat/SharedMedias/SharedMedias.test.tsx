import { getFirstOneToOneConv } from '@berty/utils/testing/helpers'
import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { SharedMedias } from './SharedMedias'

test('Chat.SharedMedias renders correctly', async () => {
	await mockServices()

	const conv = getFirstOneToOneConv()

	const { toJSON } = renderScreen('Chat.SharedMedias', SharedMedias, {
		convPk: conv?.publicKey || '',
	})
	expect(toJSON()).toMatchSnapshot()
})
