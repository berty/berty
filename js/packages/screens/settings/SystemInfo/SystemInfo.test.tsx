import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { SystemInfo } from './SystemInfo'

test('Settings.SystemInfo renders correctly', () => {
	const { toJSON } = renderScreen('Settings.SystemInfo', SystemInfo)
	expect(toJSON()).toMatchSnapshot()
})
