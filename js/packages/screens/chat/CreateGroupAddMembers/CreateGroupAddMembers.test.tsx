import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { CreateGroupAddMembers } from './CreateGroupAddMembers'

test('Chat.CreateGroupAddMembers renders correctly', async () => {
	const { toJSON } = renderScreen('Chat.CreateGroupAddMembers', CreateGroupAddMembers)
	expect(toJSON()).toMatchSnapshot()
})
