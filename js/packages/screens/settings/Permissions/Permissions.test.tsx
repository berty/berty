import { PermissionType } from '@berty/utils/permissions/permissions'
import { renderScreen } from '@berty/utils/testing/renderScreen.test'

import { Permissions } from './Permissions'

test('Settings.Permissions renders correctly', () => {
	const { toJSON } = renderScreen('Settings.Permissions', Permissions, {
		accept: () => {
			console.log('accept')
		},
		deny: () => {
			console.log('deny')
		},
		permissionType: PermissionType.audio,
		status: 'granted',
	})
	expect(toJSON()).toMatchSnapshot()
})
