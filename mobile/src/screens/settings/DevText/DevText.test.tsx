import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { DevText } from './DevText'

test('Settings.DevText renders correctly', () => {
	const { toJSON } = renderScreen('Settings.DevText', DevText, { text: 'Hello World' })
	expect(toJSON()).toMatchSnapshot()
})
