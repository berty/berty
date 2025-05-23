import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { TermsOfUse } from './TermsOfUse'

test('Settings.TermsOfUse renders correctly', () => {
	const { toJSON } = renderScreen('Settings.TermsOfUse', TermsOfUse)
	expect(toJSON()).toMatchSnapshot()
})
