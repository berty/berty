import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { DevTools } from './DevTools'

test('Settings.DevTools renders correctly', () => {
	const { toJSON } = renderScreen('Settings.DevTools', DevTools)
	expect(toJSON()).toMatchSnapshot()
})
