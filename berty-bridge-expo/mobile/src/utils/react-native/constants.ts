import { Platform } from 'react-native'

export const isTablet =
	Platform.OS !== 'web' &&
	'interfaceIdiom' in Platform.constants &&
	Platform.constants.interfaceIdiom === 'pad'
