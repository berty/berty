import { fireEvent } from '@testing-library/react-native'

import { renderScreen } from '@berty/utils/testing/renderScreen.test'
import * as testIDs from '@berty/utils/testing/testIDs.json'

import { DefaultMode } from './DefaultMode'

test('Onboarding.DefaultMode renders correctly', async () => {
	const { toJSON, getByTestId } = renderScreen('Onboarding.DefaultMode', DefaultMode)
	expect(toJSON()).toMatchSnapshot()

	const createButton = getByTestId(testIDs['lets-go-button'])
	fireEvent.press(createButton)
	expect(toJSON()).toMatchSnapshot()
})
