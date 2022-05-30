import { NavigationProp } from '@react-navigation/native'
import { Platform } from 'react-native'
import { PermissionStatus, RESULTS } from 'react-native-permissions'

import beapi from '@berty/api'
import { ScreensParams } from '@berty/navigation/types'

import { PermissionType, getPermissions } from './permissions'

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
		status = (await getPermissions())[permissionType]
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

const getPermissionStatusAndSwitch = async (
	permissionType: PermissionType,
	accept: () => Promise<void>,
	deny: () => Promise<void>,
	navigate: NavigationProp<ScreensParams>['navigate'],
) => {
	let status: PermissionStatus = RESULTS.DENIED
	try {
		// check permission status
		status = (await getPermissions())[permissionType]
		switch (status) {
			// run accept method when granted
			case RESULTS.GRANTED:
				await accept()
				break
			case RESULTS.DENIED:
				// status is denied at the first launch of the app (https://github.com/zoontek/react-native-permissions#understanding-permission-flow)
				// navigate to the permission screen to ask permission
				navigate('Chat.NotificationAndProximityPermissions', {
					permissionType,
					accept,
					deny,
				})
				break
			case RESULTS.LIMITED:
				break
			case RESULTS.UNAVAILABLE:
				break
			case RESULTS.BLOCKED:
				// navigate to the permission screen to re-ask permission
				navigate('Chat.NotificationAndProximityPermissions', {
					permissionType,
					accept,
					deny,
				})
				break
		}
	} catch (err) {
		console.warn(`check ${permissionType} permissions failed:`, err)
	}
	return status
}

export const checkProximityPermission = async (options: {
	setNetworkConfig: (newConfig: beapi.account.INetworkConfig) => Promise<void>
	networkConfig: beapi.account.INetworkConfig
	changedKey: ('bluetoothLe' | 'androidNearby' | 'appleMultipeerConnectivity')[]
	navigate: NavigationProp<ScreensParams>['navigate']
	accept?: () => Promise<void>
	deny?: () => Promise<void>
}) => {
	const { setNetworkConfig, networkConfig, changedKey, navigate, accept, deny } = options

	// final ble accept flow
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

	// final ble deny flow
	const handleDeny = async () => {
		if (deny) {
			await deny()
		}
	}

	return getPermissionStatusAndSwitch(PermissionType.proximity, handleAccept, handleDeny, navigate)
}

export const checkNotificationPermission = async (options: {
	navigate: NavigationProp<ScreensParams>['navigate']
	accept: () => Promise<void>
	deny: () => Promise<void>
}) => {
	const { navigate, accept, deny } = options

	return getPermissionStatusAndSwitch(PermissionType.notification, accept, deny, navigate)
}
