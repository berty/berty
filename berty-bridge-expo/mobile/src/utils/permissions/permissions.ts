import { Camera } from 'expo-camera'
import { PermissionsAndroid, Platform } from 'react-native'
import {
	PermissionStatus,
	RESULTS,
} from 'react-native-permissions'
import * as Notifications from 'expo-notifications';

export enum PermissionType {
	proximity = 'proximity',
	audio = 'audio',
	notification = 'notification',
	camera = 'camera',
	gallery = 'gallery',
	contacts = 'contacts',
}

const checkBluetoothPermission = async () => {
	if (Platform.OS === "ios") {
		return true;
	}
	if (Platform.OS === "android") {
		const apiLevel = parseInt(Platform.Version.toString(), 10);

		if (apiLevel < 31 && PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION) {
			return await PermissionsAndroid.check(
				PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
			);
		}
		if (
			PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN &&
			PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT &&
			PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE
		) {
			const resultScan = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN);

			if (!resultScan) {
				return false;
			}

			const resultConnect = await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT);

			if (!resultConnect) {
				return false;
			}

			return await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE);
		}
	}

	console.log("Permission have not been granted");

	return false;
};

const requestBluetoothPermission = async () => {
	if (Platform.OS === "ios") {
		return true;
	}
	if (Platform.OS === "android") {
		const apiLevel = parseInt(Platform.Version.toString(), 10);

		if (apiLevel < 31 && PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION) {
			const granted = await PermissionsAndroid.request(
				PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
			);
			return granted === PermissionsAndroid.RESULTS.GRANTED;
		}
		if (
			PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN &&
			PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT &&
			PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE
		) {
			const result = await PermissionsAndroid.requestMultiple([
				PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
				PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
				PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE,
			]);

			return (
				result["android.permission.BLUETOOTH_CONNECT"] ===
					PermissionsAndroid.RESULTS.GRANTED &&
				result["android.permission.BLUETOOTH_SCAN"] ===
					PermissionsAndroid.RESULTS.GRANTED &&
				result["android.permission.BLUETOOTH_ADVERTISE"] ===
					PermissionsAndroid.RESULTS.GRANTED
			);
		}
	}

	console.log("Permission have not been granted");

	return false;
};

export type Permissions = {
	[Property in PermissionType]: PermissionStatus
}

export const getPermissions = async (): Promise<Permissions> => {
	const ret: Permissions = Object.assign({}, defaultPermissionStatus)

	const { status }= await Notifications.getPermissionsAsync()
	ret[PermissionType.notification] = status === 'granted' ? RESULTS.GRANTED : RESULTS.DENIED

	ret[PermissionType.camera] =
		(await Camera.getCameraPermissionsAsync()).status === 'granted'
			? RESULTS.GRANTED
			: RESULTS.DENIED

	ret[PermissionType.proximity] = await checkBluetoothPermission() ? RESULTS.GRANTED : RESULTS.DENIED

	return Object.freeze(ret)
}

export const acquirePermission = async (
	permissionType: PermissionType,
): Promise<PermissionStatus> => {
	switch (permissionType) {
	case PermissionType.notification:
		const { status } = await Notifications.requestPermissionsAsync();
		return status === 'granted' ? RESULTS.GRANTED : RESULTS.DENIED
	case PermissionType.camera:
		return (await Camera.requestCameraPermissionsAsync()).status === 'granted'
			? RESULTS.GRANTED
			: RESULTS.DENIED
	case PermissionType.proximity:
		return (await requestBluetoothPermission())
			? RESULTS.GRANTED
			: RESULTS.DENIED
	default:
		console.warn(`unsupported permission ${permissionType} for device`)
		return RESULTS.UNAVAILABLE
	}
}

export const defaultPermissionStatus: Permissions = Object.freeze({
	[PermissionType.notification]: RESULTS.DENIED,
	[PermissionType.proximity]: RESULTS.DENIED,
	[PermissionType.camera]: RESULTS.DENIED,
	[PermissionType.audio]: RESULTS.DENIED,
	[PermissionType.gallery]: RESULTS.DENIED,
	[PermissionType.contacts]: RESULTS.DENIED,
})
