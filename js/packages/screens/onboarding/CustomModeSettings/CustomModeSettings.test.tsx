import { fireEvent } from '@testing-library/react-native'

import { renderScreen } from '@berty/utils/testing/renderScreen.test'
import * as testIDs from '@berty/utils/testing/testIDs.json'

import { CustomModeSettings } from './CustomModeSettings'

test('Onboarding.CustomModeSettings renders correctly', async () => {
	const { toJSON, getByTestId } = renderScreen('Onboarding.CustomModeSettings', CustomModeSettings)
	expect(toJSON()).toMatchSnapshot()

	const allButton = getByTestId(testIDs['network-all-button'])
	fireEvent.press(allButton)
	expect(toJSON()).toMatchSnapshot()

	const allButton2 = getByTestId(testIDs['network-all-button'])
	fireEvent.press(allButton2)
	expect(toJSON()).toMatchSnapshot()
})
