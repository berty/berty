import { NavigationProp, useNavigation as useReactNavigation } from '@react-navigation/native'

import { ScreensParams } from './types'

export const useNavigation = () => useReactNavigation<NavigationProp<ScreensParams>>()
