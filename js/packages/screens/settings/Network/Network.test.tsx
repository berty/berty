import { fireEvent } from '@testing-library/react-native'
import i18next from 'i18next'
import { Platform } from 'react-native'

import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { Network } from './Network'

test('Settings.Network renders correctly', async () => {
	await mockServices()

	const { toJSON } = renderScreen('Settings.Network', Network)
	expect(toJSON()).toMatchSnapshot()
})

test('Settings.Network toggle onPress works', async () => {
	await mockServices()

	const { toJSON, getByTestId } = renderScreen('Settings.Network', Network)

	const bleButton = getByTestId(i18next.t('settings.network.ble-button'))
	if (Platform.OS === 'ios') {
		const mcButton = getByTestId(i18next.t('settings.network.mc-button'))
		fireEvent.press(mcButton)
	} else {
		const nearbyButton = getByTestId(i18next.t('settings.network.nearby-button'))
		fireEvent.press(nearbyButton)
	}
	fireEvent.press(bleButton)
	expect(toJSON()).toMatchSnapshot()
})

test('Settings.Network + button onPress works', async () => {
	await mockServices()

	const { toJSON, getByTestId } = renderScreen('Settings.Network', Network)

	const bootstrapButton = getByTestId(i18next.t('settings.network.bootstrap-button'))
	const relayButton = getByTestId(i18next.t('onboarding.custom-mode.settings.access.relay-button'))
	const rdvpButton = getByTestId(i18next.t('onboarding.custom-mode.settings.routing.rdvp-button'))
	fireEvent.press(bootstrapButton)
	fireEvent.press(relayButton)
	fireEvent.press(rdvpButton)
	expect(toJSON()).toMatchSnapshot()
})
