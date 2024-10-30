import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { CustomMode } from './CustomMode'

test('Onboarding.CustomMode renders correctly', async () => {
	const { toJSON } = renderScreen('Onboarding.CustomMode', CustomMode)
	expect(toJSON()).toMatchSnapshot()
})
