import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { ThemeEditor } from './ThemeEditor'

test('Settings.ThemeEditor renders correctly', async () => {
	await mockServices()

	const { toJSON } = renderScreen('Settings.ThemeEditor', ThemeEditor)
	expect(toJSON()).toMatchSnapshot()
})
