import { useNavigation as useExpoRouterNavigation } from 'expo-router'
import { useMemo } from 'react'

import { encodeParams } from './params'
import { toRouteName } from './routes'
import { ScreensParams } from './types'

type ResetState = {
	index?: number
	routes: { name: keyof ScreensParams; params?: object }[]
}

// The rest of the React Navigation surface (setOptions, addListener, dispatch,
// getState, ...) is passed through untyped, as before.
// React Navigation accepts both navigate('Name', params) and
// navigate({ name, params }); both forms are in use across the app.
export type NavigateTarget<T extends keyof ScreensParams = keyof ScreensParams> = {
	name: T
	params?: ScreensParams[T]
}

export type Navigation = Record<string, any> & {
	navigate: {
		<T extends keyof ScreensParams>(name: T, params?: ScreensParams[T]): void
		<T extends keyof ScreensParams>(target: NavigateTarget<T>): void
	}
	push: <T extends keyof ScreensParams>(name: T, params?: ScreensParams[T]) => void
	reset: (state: ResetState) => void
	goBack: () => void
}

// Screens still refer to routes by their legacy dotted names ('Chat.OneToOne').
// Translate those to Expo Router route names and encode the params, leaving the
// rest of the React Navigation surface (setOptions, addListener, dispatch, ...)
// untouched.
export const useNavigation = (): Navigation => {
	const navigation = useExpoRouterNavigation<any>()

	return useMemo<Navigation>(
		() => ({
			...navigation,

			navigate: <T extends keyof ScreensParams>(
				nameOrTarget: T | NavigateTarget<T>,
				params?: ScreensParams[T],
			) => {
				const [name, routeParams] =
					typeof nameOrTarget === 'object'
						? [nameOrTarget.name, nameOrTarget.params]
						: [nameOrTarget, params]
				navigation.navigate(toRouteName(name), encodeParams(name, routeParams))
			},

			push: <T extends keyof ScreensParams>(name: T, params?: ScreensParams[T]) =>
				navigation.push
					? navigation.push(toRouteName(name), encodeParams(name, params))
					: navigation.navigate(toRouteName(name), encodeParams(name, params)),

			reset: (state: ResetState) =>
				navigation.reset({
					...state,
					routes: state.routes.map(route => ({
						...route,
						name: toRouteName(route.name),
						params: encodeParams(route.name, route.params as never),
					})),
				}),

			goBack: (): void => {
				navigation.goBack()
			},
		}),
		[navigation],
	)
}
