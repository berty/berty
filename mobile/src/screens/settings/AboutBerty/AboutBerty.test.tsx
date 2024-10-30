import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { AboutBerty } from './AboutBerty'

test('Settings.AboutBerty renders correctly', () => {
	const { toJSON } = renderScreen('Settings.AboutBerty', AboutBerty)
	expect(toJSON()).toMatchSnapshot()
})
