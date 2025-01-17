import { fireEvent } from '@testing-library/react-native'
import i18next from 'i18next'

import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { WebViews } from './WebViews'

test('Onboarding.WebViews renders correctly', async () => {
	const { toJSON, getByTestId } = renderScreen('Onboarding.WebViews', WebViews, {
		url: 'https://example.com',
	})
	expect(toJSON()).toMatchSnapshot()

	const acceptButton = getByTestId(i18next.t('onboarding.web-views.second-button'))
	fireEvent.press(acceptButton)
	expect(toJSON()).toMatchSnapshot()
})
