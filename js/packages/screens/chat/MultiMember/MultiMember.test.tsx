import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { MultiMember } from './MultiMember'

test('Chat.Group renders correctly', async () => {
	const { toJSON } = renderScreen('Chat.Group', MultiMember, { convId: '' })
	expect(toJSON()).toMatchSnapshot()
})
