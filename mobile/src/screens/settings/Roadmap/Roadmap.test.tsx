import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { Roadmap } from './Roadmap'

test('Settings.Roadmap renders correctly', () => {
	const { toJSON } = renderScreen('Settings.Roadmap', Roadmap)
	expect(toJSON()).toMatchSnapshot()
})
