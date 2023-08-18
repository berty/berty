import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { CodeLicense } from './CodeLicense'

test('Settings.CodeLicense renders correctly', async () => {
	const { toJSON } = renderScreen('Settings.CodeLicense', CodeLicense)
	expect(toJSON()).toMatchSnapshot()
})
