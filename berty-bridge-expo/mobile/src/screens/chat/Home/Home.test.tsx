import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { Home } from './Home'

test('Chat.Home renders correctly', () => {
	const { toJSON } = renderScreen('Chat.Home', Home)
	expect(toJSON()).toMatchSnapshot()
})
