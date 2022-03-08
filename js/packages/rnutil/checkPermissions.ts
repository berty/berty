import { Platform } from 'react-native'
import {
	check,
	checkNotifications,
	Permission,
	PERMISSIONS,
	PermissionStatus,
	request,
	requestNotifications,
	RESULTS,
} from 'react-native-permissions'

export type PermissionType = 'proximity' | 'audio' | 'notification' | 'camera' | 'gallery'

export const permissionsByDevice: Record<string, Permission> = {
	proximity:
		Platform.OS === 'ios'
			? PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL
			: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
	camera: Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA,
	audio: Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO,
	gallery:
		Platform.OS === 'ios'
			? PERMISSIONS.IOS.PHOTO_LIBRARY
			: PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE,
}

export const getPermissionStatus = async (
	permissionType: PermissionType,
): Promise<PermissionStatus> => {
	if (permissionType === 'notification') {
		return (await checkNotifications()).status
	}
	return await check(permissionsByDevice[permissionType])
}

export const requestPermission = async (
	permissionType: PermissionType,
): Promise<PermissionStatus> => {
	if (permissionType === 'notification') {
		return (await requestNotifications(['alert', 'sound'])).status
	}
	return await request(permissionsByDevice[permissionType])
}

export const checkPermissions = async (
	permissionType: PermissionType,
	options?: {
		navigate: any
		navigateToPermScreenOnProblem?: boolean
		navigateNext?: string
		onComplete?: (() => Promise<void>) | (() => void)
	},
): Promise<PermissionStatus | undefined> => {
	let status
	try {
		status = await getPermissionStatus(permissionType)
	} catch (err) {
		console.warn('Check permission failed:', err)
	}

	if (
		(status === RESULTS.DENIED || status === RESULTS.BLOCKED) &&
		options?.navigateToPermScreenOnProblem
	) {
		options.navigate('Main.Permissions', {
			permissionType,
			permissionStatus: status,
			navigateNext: options?.navigateNext,
			onComplete: options?.onComplete,
		})
	} else if (options?.navigateNext) {
		options.navigate(options?.navigateNext, {})
	}

	return status
}
