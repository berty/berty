import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { PrivacyPolicy } from './PrivacyPolicy'

test('Settings.PrivacyPolicy renders correctly', async () => {
	await mockServices()

	const { toJSON } = renderScreen('Settings.PrivacyPolicy', PrivacyPolicy)
	expect(toJSON()).toMatchSnapshot()
})
