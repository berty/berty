import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { ThemeEditor } from './ThemeEditor'

test('Settings.ThemeEditor renders correctly', () => {
	const { toJSON } = renderScreen('Settings.ThemeEditor', ThemeEditor)
	expect(toJSON()).toMatchSnapshot()
})
