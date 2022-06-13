import { fireEvent } from '@testing-library/react-native'
import i18next from 'i18next'

import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { CustomModeSettings } from './CustomModeSettings'

test('Onboarding.CustomModeSettings renders correctly', async () => {
	const { toJSON, getByLabelText } = renderScreen(
		'Onboarding.CustomModeSettings',
		CustomModeSettings,
	)
	expect(toJSON()).toMatchSnapshot()

	const allButton = getByLabelText(i18next.t('onboarding.custom-mode.settings.all-button'))
	fireEvent.press(allButton)
	expect(toJSON()).toMatchSnapshot()

	const allButton2 = getByLabelText(i18next.t('onboarding.custom-mode.settings.all-button'))
	fireEvent.press(allButton2)
	expect(toJSON()).toMatchSnapshot()
})
