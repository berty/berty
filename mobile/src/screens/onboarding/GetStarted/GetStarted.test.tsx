import { renderScreen } from '@berty/utils/testing/renderScreen.test'
import * as testIDs from '@berty/utils/testing/testIDs.json'

import { GetStarted } from './GetStarted'

test('Onboarding.GetStarted renders correctly', async () => {
	const { toJSON } = renderScreen('Onboarding.GetStarted', GetStarted)
	expect(toJSON()).toMatchSnapshot()
})

/**
 * This test is only there as an example of getting an element by testID,
 * it shouldn't be needed due to the snapshot test
 */
test('create button exists', async () => {
	const { getByTestId } = renderScreen('Onboarding.GetStarted', GetStarted)

	const createButton = getByTestId(testIDs['create-account-button'])
	expect(createButton).toBeTruthy()
})
