import { fireEvent } from '@testing-library/react-native'
import { Platform } from 'react-native'

import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'
import * as testIDs from '@berty/utils/testing/testIDs.json'

import { Network } from './Network'

test('Settings.Network renders correctly', async () => {
	await mockServices()

	const { toJSON } = renderScreen('Settings.Network', Network)
	expect(toJSON()).toMatchSnapshot()
})

test('Settings.Network toggle onPress works', async () => {
	await mockServices()

	const { toJSON, getByTestId } = renderScreen('Settings.Network', Network)

	const bleButton = getByTestId(testIDs['ble-button'])
	if (Platform.OS === 'ios') {
		const mcButton = getByTestId(testIDs['mc-button'])
		fireEvent.press(mcButton)
	} else {
		const nearbyButton = getByTestId(testIDs['ble-button'])
		fireEvent.press(nearbyButton)
	}
	fireEvent.press(bleButton)
	expect(toJSON()).toMatchSnapshot()
})

test('Settings.Network + button onPress works', async () => {
	await mockServices()

	const { toJSON, getByTestId } = renderScreen('Settings.Network', Network)

	const bootstrapButton = getByTestId(testIDs['bootstrap-button'])
	const relayButton = getByTestId(testIDs['relay-button'])
	const rdvpButton = getByTestId(testIDs['rdvp-button'])
	fireEvent.press(bootstrapButton)
	fireEvent.press(relayButton)
	fireEvent.press(rdvpButton)
	expect(toJSON()).toMatchSnapshot()
})
