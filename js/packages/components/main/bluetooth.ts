import { request, PERMISSIONS, RESULTS } from 'react-native-permissions'
import { Platform, Alert, Linking } from 'react-native'

export const requestBluetoothPermission = async (): Promise<boolean> => {
	let permission =
		Platform.OS === 'ios'
			? PERMISSIONS.IOS.BLUETOOTH_PERIPHERAL
			: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION
	try {
		let result = await request(permission)
		if (result === RESULTS.GRANTED) {
			return true
		}
	} catch (err) {}
	return false
}

export const requestBluetoothAndHandleAlert = async () =>
	new Promise(async (resolve) => {
		if (!(await requestBluetoothPermission())) {
			Alert.alert(
				'Berty would like to use Bluetooth for new connections',
				'You can allow new connections in Settings.',
				[
					{
						text: 'Close',
						style: 'cancel',
						onPress: () => resolve(''),
					},
					{
						text: 'Settings',
						onPress: () => {
							resolve('')
							Linking.openSettings()
						},
					},
				],
				{ cancelable: false },
			)
		}
	})
