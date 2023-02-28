import { Camera } from 'expo-camera'
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

export enum PermissionType {
	proximity = 'proximity',
	audio = 'audio',
	notification = 'notification',
	camera = 'camera',
	gallery = 'gallery',
	contacts = 'contacts',
}

const permissionsByDevice: Record<
	Exclude<PermissionType, PermissionType.notification>,
	Permission | undefined
> = {
	proximity: Platform.select({
		ios: PERMISSIONS?.IOS?.BLUETOOTH_PERIPHERAL,
		android: PERMISSIONS?.ANDROID?.ACCESS_FINE_LOCATION,
		web: undefined,
	}),
	camera: Platform.select({
		ios: PERMISSIONS?.IOS?.CAMERA,
		android: PERMISSIONS?.ANDROID?.CAMERA,
		web: undefined,
	}),
	audio: Platform.select({
		ios: PERMISSIONS?.IOS?.MICROPHONE,
		android: PERMISSIONS?.ANDROID?.RECORD_AUDIO,
		web: undefined,
	}),
	gallery: Platform.select({
		ios: PERMISSIONS?.IOS?.PHOTO_LIBRARY,
		android: PERMISSIONS?.ANDROID?.READ_EXTERNAL_STORAGE,
		web: undefined,
	}),
	contacts: Platform.select({
		ios: PERMISSIONS?.IOS?.CONTACTS,
		android: PERMISSIONS?.ANDROID?.READ_CONTACTS,
		web: undefined,
	}),
}

export type Permissions = {
	[Property in PermissionType]: PermissionStatus
}

export const getPermissions = async (): Promise<Permissions> => {
	const ret: Permissions = Object.assign({}, defaultPermissionStatus)

	ret[PermissionType.notification] = (await checkNotifications()).status

	await Promise.all(
		Object.entries(permissionsByDevice).map(async ([key, perm]) => {
			if (perm === undefined) {
				return
			}

			ret[key as PermissionType] = await check(perm)
		}),
	)

	if (Platform.OS === 'web') {
		ret[PermissionType.camera] =
			(await Camera.requestCameraPermissionsAsync()).status === 'granted'
				? RESULTS.GRANTED
				: RESULTS.DENIED
	}

	return Object.freeze(ret)
}

export const acquirePermission = async (
	permissionType: PermissionType,
): Promise<PermissionStatus> => {
	if (permissionType === PermissionType.notification) {
		return (await requestNotifications(['alert', 'sound'])).status
	}
	if (permissionType === PermissionType.camera) {
		return (await Camera.requestCameraPermissionsAsync()).status === 'granted'
			? RESULTS.GRANTED
			: RESULTS.DENIED
	}
	const permission = permissionsByDevice[permissionType]
	if (!permission) {
		console.warn(`unsupported permission ${permissionType} for device`)
		return RESULTS.UNAVAILABLE
	}
	return await request(permission)
}

export const defaultPermissionStatus: Permissions = Object.freeze({
	[PermissionType.notification]: RESULTS.DENIED,
	[PermissionType.proximity]: RESULTS.DENIED,
	[PermissionType.camera]: RESULTS.DENIED,
	[PermissionType.audio]: RESULTS.DENIED,
	[PermissionType.gallery]: RESULTS.DENIED,
	[PermissionType.contacts]: RESULTS.DENIED,
})
