import { Platform } from 'react-native'
import { check, checkNotifications, PERMISSIONS, RESULTS } from 'react-native-permissions'

export const checkPermissions = async (
	permissionType: 'p2p' | 'audio' | 'notification' | 'camera',
	navigate: any,
	options?: {
		navigateToPermScreenOnProblem?: boolean
		navigateNext?: string
		onComplete?: () => Promise<void>
	},
) => {
	let status
	try {
		if (permissionType === 'notification') {
			const res = await checkNotifications()
			status = res.status
		} else if (permissionType === 'p2p') {
			status = await check(
				Platform.OS === 'ios'
					? PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL
					: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
			)
		} else if (permissionType === 'camera') {
			status = await check(
				Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA,
			)
		} else if (permissionType === 'audio') {
			status = await check(
				Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO,
			)
		}
	} catch (err) {
		console.warn('Check permission failed:', err)
	}

	console.log('Permission status:', status, options)
	if (
		(status === RESULTS.DENIED || status === RESULTS.BLOCKED) &&
		options?.navigateToPermScreenOnProblem
	) {
		navigate('Main.Permissions', {
			permissionType,
			permissionStatus: status,
			navigateNext: options?.navigateNext,
			onComplete: options?.onComplete,
		})
	} else if (options?.navigateNext) {
		navigate(options?.navigateNext, {})
	}

	return status
}
