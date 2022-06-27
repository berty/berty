import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { OneToOne } from './OneToOne'

test('Chat.OneToOne renders correctly', async () => {
	const { toJSON } = renderScreen('Chat.OneToOne', OneToOne, { convId: '' })
	expect(toJSON()).toMatchSnapshot()
})
