import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { CreateGroupFinalize } from './CreateGroupFinalize'

test('Chat.CreateGroupFinalize renders correctly', async () => {
	const { toJSON } = renderScreen('Chat.CreateGroupFinalize', CreateGroupFinalize)
	expect(toJSON()).toMatchSnapshot()
})
