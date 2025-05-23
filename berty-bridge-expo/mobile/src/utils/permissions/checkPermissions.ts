import { NavigationProp } from '@react-navigation/native'
import { Platform } from 'react-native'
import { PermissionStatus, RESULTS } from 'react-native-permissions'

import beapi from '@berty/api'
import { ScreensParams } from '@berty/navigation/types'

import { getPermissions, PermissionType } from './permissions'

const getPermissionStatusAndSwitch = async (
	permissionType: PermissionType,
	accept: () => Promise<void> | void,
	deny: () => Promise<void> | void,
	navigate: NavigationProp<ScreensParams>['navigate'],
) => {
	let status: PermissionStatus = RESULTS.DENIED
	try {
		// check permission status
		status = (await getPermissions())[permissionType]
		if (Platform.OS === 'web') {
			return status
		}
		switch (status) {
			// run accept method when granted
			case RESULTS.GRANTED:
				await accept()
				break
			case RESULTS.DENIED:
				// status is denied at the first launch of the app (https://github.com/zoontek/react-native-permissions#understanding-permission-flow)
				// navigate to the permission screen to ask permission
				navigate('Settings.Permissions', {
					permissionType,
					status,
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
				navigate('Settings.Permissions', {
					permissionType,
					status,
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

export const checkPermission = async (options: {
	permissionType: PermissionType
	navigate: NavigationProp<ScreensParams>['navigate']
	accept: () => Promise<void> | void
	deny: () => Promise<void> | void
}) => {
	const { permissionType, navigate, accept, deny } = options

	return getPermissionStatusAndSwitch(permissionType, accept, deny, navigate)
}

export const checkProximityPermission = async (options: {
	setNetworkConfig: (newConfig: beapi.account.INetworkConfig) => Promise<void>
	networkConfig: beapi.account.INetworkConfig
	changedKey: ('bluetoothLe' | 'androidNearby' | 'appleMultipeerConnectivity')[]
	navigate: NavigationProp<ScreensParams>['navigate']
	accept?: () => Promise<void> | void
	deny?: () => Promise<void> | void
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
