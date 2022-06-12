import { fireEvent } from '@testing-library/react-native'
import i18next from 'i18next'

import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { DefaultMode } from './DefaultMode'

test('Onboarding.DefaultMode renders correctly', async () => {
	const { toJSON, getByLabelText } = renderScreen('Onboarding.DefaultMode', DefaultMode)
	expect(toJSON()).toMatchSnapshot()

	const createButton = getByLabelText(i18next.t('onboarding.default-mode.summary.accept-button'))
	fireEvent.press(createButton)
	expect(toJSON()).toMatchSnapshot()
})
