import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { TermsOfUse } from './TermsOfUse'

test('Settings.TermsOfUse renders correctly', async () => {
	await mockServices()

	const { toJSON } = renderScreen('Settings.TermsOfUse', TermsOfUse)
	expect(toJSON()).toMatchSnapshot()
})
