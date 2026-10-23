import { Camera } from 'expo-camera'
import { PermissionsAndroid, Platform } from 'react-native'
import { RESULTS } from 'react-native-permissions'

import { checkPermission } from './checkPermissions'
import { acquirePermission, getPermissions, PermissionType } from './permissions'

jest.mock('expo-camera', () => ({
	Camera: {
		getCameraPermissionsAsync: jest.fn(),
		requestCameraPermissionsAsync: jest.fn(),
	},
}))
jest.mock('expo-device', () => ({ isDevice: false }))
jest.mock('expo-notifications', () => ({}))
jest.mock('react-native-permissions', () => jest.requireActual('react-native-permissions/mock'))
jest.mock('@berty/api', () => ({}))

const cameraResponse = (status: 'undetermined' | 'granted' | 'denied', canAskAgain = true) => ({
	status,
	granted: status === 'granted',
	canAskAgain,
	expires: 'never',
})

beforeEach(() => {
	jest.clearAllMocks()
	jest.replaceProperty(Platform, 'OS', 'ios')
	;(Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue(cameraResponse('undetermined'))
})

afterEach(() => jest.restoreAllMocks())

test.each([
	['undetermined', true, RESULTS.DENIED],
	['granted', false, RESULTS.GRANTED],
	['denied', true, RESULTS.DENIED],
	['denied', false, RESULTS.BLOCKED],
] as const)('checking camera status %s (canAskAgain=%s) returns %s without prompting', async (status, canAskAgain, expected) => {
	;(Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue(cameraResponse(status, canAskAgain))
	expect((await getPermissions()).camera).toBe(expected)
	expect(Camera.requestCameraPermissionsAsync).not.toHaveBeenCalled()
})

test.each([
	['granted', true, RESULTS.GRANTED],
	['denied', true, RESULTS.DENIED],
	['denied', false, RESULTS.BLOCKED],
] as const)('requesting camera status %s (canAskAgain=%s) returns %s', async (status, canAskAgain, expected) => {
	;(Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue(cameraResponse(status, canAskAgain))
	expect(await acquirePermission(PermissionType.camera)).toBe(expected)
})

test.each(['granted', 'denied'] as const)('iOS opens the system prompt directly and respects %s', async status => {
	;(Camera.requestCameraPermissionsAsync as jest.Mock).mockResolvedValue(cameraResponse(status, false))
	const accept = jest.fn()
	const deny = jest.fn()
	const navigate = jest.fn()

	const result = await checkPermission({ permissionType: PermissionType.camera, accept, deny, navigate })

	expect(Camera.requestCameraPermissionsAsync).toHaveBeenCalledTimes(1)
	expect(navigate).not.toHaveBeenCalled()
	expect(accept).toHaveBeenCalledTimes(status === 'granted' ? 1 : 0)
	expect(deny).toHaveBeenCalledTimes(status === 'denied' ? 1 : 0)
	expect(result).toBe(status === 'granted' ? RESULTS.GRANTED : RESULTS.BLOCKED)
})

test('an existing grant opens the scanner without another prompt', async () => {
	;(Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue(cameraResponse('granted'))
	const accept = jest.fn()
	const deny = jest.fn()
	const navigate = jest.fn()

	expect(await checkPermission({ permissionType: PermissionType.camera, accept, deny, navigate })).toBe(RESULTS.GRANTED)
	expect(accept).toHaveBeenCalledTimes(1)
	expect(deny).not.toHaveBeenCalled()
	expect(navigate).not.toHaveBeenCalled()
	expect(Camera.requestCameraPermissionsAsync).not.toHaveBeenCalled()
})

test('a previous iOS denial offers Settings without requesting again', async () => {
	;(Camera.getCameraPermissionsAsync as jest.Mock).mockResolvedValue(cameraResponse('denied', false))
	const accept = jest.fn()
	const deny = jest.fn()
	const navigate = jest.fn()

	expect(await checkPermission({ permissionType: PermissionType.camera, accept, deny, navigate })).toBe(RESULTS.BLOCKED)
	expect(navigate).toHaveBeenCalledWith('Settings.Permissions', {
		permissionType: PermissionType.camera,
		status: RESULTS.BLOCKED,
		accept,
		deny,
	})
	expect(Camera.requestCameraPermissionsAsync).not.toHaveBeenCalled()
	expect(accept).not.toHaveBeenCalled()
	expect(deny).not.toHaveBeenCalled()
})

test('Android continues to use its existing permission screen', async () => {
	jest.replaceProperty(Platform, 'OS', 'android')
	Object.defineProperty(Platform, 'Version', { configurable: true, value: 35 })
	jest.spyOn(PermissionsAndroid, 'check').mockResolvedValue(true)
	const navigate = jest.fn()
	await checkPermission({ permissionType: PermissionType.camera, accept: jest.fn(), deny: jest.fn(), navigate })
	expect(navigate).toHaveBeenCalledWith('Settings.Permissions', expect.objectContaining({ status: RESULTS.DENIED }))
	expect(Camera.requestCameraPermissionsAsync).not.toHaveBeenCalled()
})
