import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { Faq } from './Faq'

test('Settings.Faq renders correctly', () => {
	const { toJSON } = renderScreen('Settings.Faq', Faq)
	expect(toJSON()).toMatchSnapshot()
})
