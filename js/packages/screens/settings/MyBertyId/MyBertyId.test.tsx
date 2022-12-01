import { fireEvent } from '@testing-library/react-native'
import i18next from 'i18next'

import { mockServices } from '@berty/utils/testing/mockServices.test'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { MyBertyId } from './MyBertyId'

test('Settings.MyBertyId renders correctly', async () => {
	await mockServices()

	const { toJSON, getByTestId } = renderScreen('Settings.MyBertyId', MyBertyId)
	expect(toJSON()).toMatchSnapshot()

	const button = getByTestId(i18next.t('tabs.fingerprint'))
	fireEvent.press(button)
	expect(toJSON()).toMatchSnapshot()
})
