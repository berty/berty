import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { CreateAccount } from './CreateAccount'

test('Onboarding.CreateAccount renders correctly', async () => {
	const { toJSON } = renderScreen('Onboarding.CreateAccount', CreateAccount)
	expect(toJSON()).toMatchSnapshot()
})
