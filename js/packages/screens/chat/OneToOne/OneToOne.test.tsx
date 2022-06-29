import { getFirstOneToOneConv } from '@berty/utils/testing/helpers'
import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { OneToOne } from './OneToOne'

test('Chat.OneToOne renders correctly', async () => {
	await mockServices()

	const conv = getFirstOneToOneConv()

	const { toJSON } = renderScreen('Chat.OneToOne', OneToOne, { convId: conv?.publicKey || '' })
	expect(toJSON()).toMatchSnapshot()
})
