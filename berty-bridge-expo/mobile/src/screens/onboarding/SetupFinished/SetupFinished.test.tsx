import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { SetupFinished } from './SetupFinished'

test('Onboarding.SetupFinished renders correctly', async () => {
	const { toJSON } = renderScreen('Onboarding.SetupFinished', SetupFinished)
	expect(toJSON()).toMatchSnapshot()
})
