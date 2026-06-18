import { Platform } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

// Top padding for formSheet content to clear the status bar (Android only; iOS sheets handle it).
export const useTopInset = (): number => {
	const insets = useSafeAreaInsets()
	return Platform.OS === 'android' ? insets.top : 0
}
