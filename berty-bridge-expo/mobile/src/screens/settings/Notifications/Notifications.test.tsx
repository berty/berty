import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { Notifications } from './Notifications'

test('Settings.Notifications renders correctly', () => {
	const { toJSON } = renderScreen('Settings.Notifications', Notifications)
	expect(toJSON()).toMatchSnapshot()
})
