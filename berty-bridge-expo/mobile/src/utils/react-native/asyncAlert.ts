import { Alert } from 'react-native'

export const asyncAlert = (title: string, message: string, button: string) => {
	return new Promise<void>(resolve => {
		Alert.alert(title, message, [{ text: button, onPress: () => resolve() }], {
			cancelable: false,
		})
	})
}
