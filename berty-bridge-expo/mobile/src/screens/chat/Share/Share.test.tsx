import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { ShareModal } from './Share'

test('Chat.Share renders correctly', () => {
	const { toJSON } = renderScreen('Chat.Share', ShareModal)
	expect(toJSON()).toMatchSnapshot()
})
