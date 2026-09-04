import { useLocalSearchParams } from 'expo-router'
import { useMemo } from 'react'

import { decodeParams } from './params'
import { ScreensParams } from './types'

// Typed replacement for the `route.params` prop React Navigation used to pass:
// Expo Router strips `route`/`navigation` from screen components to force the
// hooks, so screens read their params through this instead.
export const useRouteParams = <T extends keyof ScreensParams>(name: T): ScreensParams[T] => {
	const raw = useLocalSearchParams()

	return useMemo(() => decodeParams(name, raw as Record<string, unknown>), [name, raw])
}
