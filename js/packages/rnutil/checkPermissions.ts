import { Platform } from 'react-native'
import { check, checkNotifications, PERMISSIONS, request, RESULTS } from 'react-native-permissions'

export const checkPermissions = async (
	permissionType: 'p2p' | 'audio' | 'notification' | 'camera',
	navigate: any,
	options?: {
		createNewAccount?: boolean
		isToNavigate?: boolean
		navigateNext?: string
		onComplete?: () => Promise<void>
	},
) => {
	let status
	if (permissionType === 'notification') {
		try {
			const res = await checkNotifications()
			status = res.status
		} catch (err) {
			console.log('request notification permission err:', err)
		}
	} else if (permissionType === 'p2p') {
		status = await check(
			Platform.OS === 'ios'
				? PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL
				: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
		)
	} else if (permissionType === 'camera') {
		try {
			status = await check(
				Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA,
			)
			if (status !== RESULTS.GRANTED) {
				status = await request(
					Platform.OS === 'ios' ? PERMISSIONS.IOS.CAMERA : PERMISSIONS.ANDROID.CAMERA,
				)
			}
		} catch (err) {
			console.log(err)
		}
	} else if (permissionType === 'audio') {
		status = await check(
			Platform.OS === 'ios' ? PERMISSIONS.IOS.MICROPHONE : PERMISSIONS.ANDROID.RECORD_AUDIO,
		)
	}

	console.log('RESULTS', status, options)
	if ((status === RESULTS.DENIED || status === RESULTS.BLOCKED) && options?.isToNavigate) {
		navigate('Main.Permissions', {
			permissionType,
			permissionStatus: status,
			navigateNext: options?.navigateNext,
			createNewAccount: options?.createNewAccount,
			onComplete: options?.onComplete,
		})
	} else if (options?.navigateNext) {
		navigate(options?.navigateNext, {})
	}

	return status
}
