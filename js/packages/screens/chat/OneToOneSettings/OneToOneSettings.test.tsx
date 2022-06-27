import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { OneToOneSettings } from './OneToOneSettings'

test('Chat.OneToOneSettings renders correctly', async () => {
	const { toJSON } = renderScreen('Chat.OneToOneSettings', OneToOneSettings, { convId: '' })
	expect(toJSON()).toMatchSnapshot()
})
