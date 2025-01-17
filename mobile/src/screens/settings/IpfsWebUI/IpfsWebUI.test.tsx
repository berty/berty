import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { IpfsWebUI } from './IpfsWebUI'

test('Settings.IpfsWebUI renders correctly', () => {
	const { toJSON } = renderScreen('Settings.IpfsWebUI', IpfsWebUI)
	expect(toJSON()).toMatchSnapshot()
})
