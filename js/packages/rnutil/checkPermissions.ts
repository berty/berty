import { Linking, Platform } from 'react-native'
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
import beapi from '@berty/api'
import { Camera } from 'expo-camera'

export enum PermissionType {
	proximity = 'proximity',
	audio = 'audio',
	notification = 'notification',
	camera = 'camera',
	gallery = 'gallery',
}

const permissionsByDevice: Record<string, Permission | undefined> = {
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
}

export const getPermissionStatus = async (
	permissionType: PermissionType,
): Promise<PermissionStatus> => {
	if (permissionType === PermissionType.notification) {
		return (await checkNotifications()).status
	}
	if (permissionType === PermissionType.camera && Platform.OS === 'web') {
		return (await Camera.requestCameraPermissionsAsync()).status === 'granted'
			? RESULTS.GRANTED
			: RESULTS.DENIED
	}
	const permission = permissionsByDevice[permissionType]
	if (!permission) {
		return RESULTS.UNAVAILABLE
	}
	return await check(permission)
}

export const requestPermission = async (
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
		return RESULTS.UNAVAILABLE
	}
	return await request(permission)
}

export const checkPermissions = async (
	permissionType: PermissionType,
	options?: {
		navigate: any
		navigateToPermScreenOnProblem?: boolean
		navigateNext?: string
		onComplete?: (() => Promise<void>) | (() => void)
		onSuccess?: (() => Promise<void>) | (() => void)
	},
): Promise<PermissionStatus | undefined> => {
	// if (Platform.OS === 'web') {
	// 	return RESULTS.DENIED
	// }
	let status
	try {
		status = await getPermissionStatus(permissionType)
	} catch (err) {
		console.warn('Check permission failed:', err)
	}

	if (
		(status === RESULTS.DENIED || status === RESULTS.BLOCKED) &&
		options?.navigateToPermScreenOnProblem &&
		Platform.OS !== 'web'
	) {
		options.navigate('Chat.Permissions', {
			permissionType,
			permissionStatus: status,
			navigateNext: options?.navigateNext,
			onComplete: options?.onComplete,
		})
		return status
	}
	if (options?.navigateNext) {
		options.navigate(options?.navigateNext, {})
		return status
	}

	options?.onSuccess && options.onSuccess()
	return status
}

export const checkBlePermission = async (options: {
	setNetworkConfig: (newConfig: beapi.account.INetworkConfig) => Promise<void>
	networkConfig: beapi.account.INetworkConfig
	changedKey: ('bluetoothLe' | 'androidNearby' | 'appleMultipeerConnectivity')[]
	navigate: any
	accept?: () => Promise<void>
	deny?: () => Promise<void>
}) => {
	const { setNetworkConfig, networkConfig, changedKey, navigate, accept, deny } = options

	// final accept flow
	let newConfig: beapi.account.INetworkConfig = networkConfig
	const handleAccept = async () => {
		changedKey.forEach((key: 'bluetoothLe' | 'androidNearby' | 'appleMultipeerConnectivity') => {
			let newValue = beapi.account.NetworkConfig.Flag.Disabled
			if (networkConfig?.[key] === beapi.account.NetworkConfig.Flag.Disabled) {
				newValue = beapi.account.NetworkConfig.Flag.Enabled
			}
			newConfig = { ...newConfig, [key]: newValue }
		})

		await setNetworkConfig(newConfig)
		if (accept) {
			await accept()
		}
	}

	// final deny flow
	const handleDeny = async () => {
		if (deny) {
			await deny()
		}
	}

	try {
		// check permission status
		const status = await check(
			Platform.OS === 'ios'
				? PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL
				: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
		)
		switch (status) {
			case 'granted':
				await handleAccept()
				break
			case 'denied':
				// status is denied at the first launch of the app (https://github.com/zoontek/react-native-permissions#understanding-permission-flow)
				navigate('Chat.BlePermission', {
					accept: handleAccept,
					deny: handleDeny,
				})
				break
			case 'limited':
			case 'unavailable':
				break
			case 'blocked':
				// if status is blocked, we open the settings
				await Linking.openSettings()
				break
		}
	} catch (err) {
		console.warn('checkBlePermissions failed:', err)
	}
}
