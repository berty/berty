import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { SettingsHome } from './SettingsHome'

test('Settings.Home renders correctly', () => {
	const { toJSON } = renderScreen('Settings.Home', SettingsHome)
	expect(toJSON()).toMatchSnapshot()
})
