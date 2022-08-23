import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { Appearance } from './Appearance'

test('Settings.Appearance renders correctly', () => {
	const { toJSON } = renderScreen('Settings.Appearance', Appearance)
	expect(toJSON()).toMatchSnapshot()
})
