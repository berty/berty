import { router } from 'expo-router'

import { decodeParams, encodeParams } from './params'
import { ROUTE_NAMES, ROUTE_PATHS, toRouteName } from './routes'
import { ScreensParams } from './types'

// Expo Router owns the navigation container, so code outside React navigates
// through its imperative `router`. The container ref is still published here by
// app/_layout.tsx for the few callers that need to inspect the active route.

type ContainerRef = {
	getCurrentRoute: () => { name: string; params?: object } | undefined
	reset?: (state: { index: number; routes: { name: string; params?: object }[] }) => void
} | null

export const navigationRef: { current: ContainerRef } = { current: null }

export const isReadyRef: { current: boolean } = { current: false }

export type CurrentRoute = {
	name: keyof ScreensParams | undefined
	params: Record<string, unknown>
}

// Reports the active route using the legacy dotted names ('Chat.OneToOne')
// rather than the Expo Router path ('chat/one-to-one').
export const getCurrentRoute = (): CurrentRoute | undefined => {
	const route = navigationRef.current?.getCurrentRoute()
	if (!route) {
		return undefined
	}
	return {
		name: ROUTE_NAMES[route.name],
		params: (route.params ?? {}) as Record<string, unknown>,
	}
}

export const navigate = <T extends keyof ScreensParams>(name: T, params?: ScreensParams[T]) => {
	router.push({
		pathname: ROUTE_PATHS[name] as never,
		params: encodeParams(name, params) as never,
	})
}

export const goBack = (): void => {
	if (router.canGoBack()) {
		router.back()
	}
}

type ResetRoute<T extends keyof ScreensParams = keyof ScreensParams> = {
	name: T
	params?: ScreensParams[T]
}

// Replaces the whole stack. Previously expressed as
// `dispatch(CommonActions.reset({ routes }))` against the container ref.
export const resetRoutes = (routes: ResetRoute[]): void => {
	const container = navigationRef.current
	if (!isReadyRef.current || !container?.reset) {
		return
	}
	container.reset({
		index: routes.length - 1,
		routes: routes.map(route => ({
			name: toRouteName(route.name),
			params: encodeParams(route.name, route.params as never),
		})),
	})
}

export { decodeParams }
