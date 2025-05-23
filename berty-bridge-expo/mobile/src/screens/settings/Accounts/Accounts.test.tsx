import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { Accounts } from './Accounts'

test('Settings.Accounts renders correctly', () => {
	const { toJSON } = renderScreen('Settings.Accounts', Accounts)
	expect(toJSON()).toMatchSnapshot()
})
