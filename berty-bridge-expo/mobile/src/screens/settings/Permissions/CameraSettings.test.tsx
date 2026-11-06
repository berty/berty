import { act, render } from '@testing-library/react-native'
import React from 'react'
import { AppState, AppStateStatus } from 'react-native'
import { openSettings, RESULTS } from 'react-native-permissions'

import { Permission } from '@berty/components/permissions/Permission'
import { acquirePermission, getPermissions, PermissionType } from '@berty/utils/permissions/permissions'

import { Permissions } from './Permissions'

const mockGoBack = jest.fn()
const mockNavigate = jest.fn()
const mockDispatch = jest.fn()

jest.mock('react-native-permissions', () => jest.requireActual('react-native-permissions/mock'))
jest.mock('@berty/components/permissions/Permission', () => ({ Permission: jest.fn(() => null) }))
jest.mock('@berty/hooks', () => ({ useAppSelector: () => ({}) }))
jest.mock('@berty/navigation', () => ({
	useNavigation: () => ({ goBack: mockGoBack, navigate: mockNavigate }),
}))
jest.mock('react-redux', () => ({ useDispatch: () => mockDispatch }))
jest.mock('@berty/redux/reducers/networkConfig.reducer', () => ({}))
jest.mock('@berty/utils/permissions/checkPermissions', () => ({}))
jest.mock('@berty/utils/permissions/permissions', () => ({
	PermissionType: { camera: 'camera', proximity: 'proximity' },
	acquirePermission: jest.fn(),
	getPermissions: jest.fn(),
}))

beforeEach(() => {
	jest.clearAllMocks()
	AppState.currentState = 'active'
})

afterEach(() => jest.restoreAllMocks())

test.each([RESULTS.GRANTED, RESULTS.BLOCKED])('returning from Settings with camera %s resolves once without another request', async status => {
	const accept = jest.fn()
	const deny = jest.fn()
	const remove = jest.fn()
	let listener: (state: AppStateStatus) => void = () => {}
	jest.spyOn(AppState, 'addEventListener').mockImplementation((_event, callback) => {
		listener = callback
		return { remove }
	})
	;(getPermissions as jest.Mock).mockResolvedValue({ camera: status })

	const screen = render(
		<Permissions
			navigation={{} as never}
			route={{
				key: 'camera-settings',
				name: 'Settings.Permissions',
				params: { accept, deny, status: RESULTS.BLOCKED, permissionType: PermissionType.camera },
			}}
		/>,
	)
	const props = (Permission as jest.Mock).mock.calls[0][0]
	await act(async () => { await props.onPressPrimary() })
	expect(openSettings).toHaveBeenCalledTimes(1)
	expect(AppState.addEventListener).toHaveBeenCalledWith('change', expect.any(Function))

	await act(async () => { listener('background') })
	await act(async () => { listener('active') })

	expect(getPermissions).toHaveBeenCalledTimes(1)
	expect(accept).toHaveBeenCalledTimes(status === RESULTS.GRANTED ? 1 : 0)
	expect(deny).toHaveBeenCalledTimes(status === RESULTS.GRANTED ? 0 : 1)
	expect(mockGoBack).toHaveBeenCalledTimes(1)
	expect(mockNavigate).not.toHaveBeenCalled()
	expect(acquirePermission).not.toHaveBeenCalled()
	expect(remove).toHaveBeenCalledTimes(1)
	screen.unmount()
})
