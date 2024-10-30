import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { DeleteAccount } from './DeleteAccount'

test('Settings.DeleteAccount renders correctly', () => {
	const { toJSON } = renderScreen('Settings.DeleteAccount', DeleteAccount)
	expect(toJSON()).toMatchSnapshot()
})
