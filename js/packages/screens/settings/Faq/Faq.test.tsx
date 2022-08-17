import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { Faq } from './Faq'

test('Settings.Faq renders correctly', async () => {
	await mockServices()

	const { toJSON } = renderScreen('Settings.Faq', Faq)
	expect(toJSON()).toMatchSnapshot()
})
