import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { MultiMemberQR } from './MultiMemberQR'

test('Chat.MultiMemberQR renders correctly', async () => {
	const { toJSON } = renderScreen('Chat.MultiMemberQR', MultiMemberQR, { convId: '' })
	expect(toJSON()).toMatchSnapshot()
})
