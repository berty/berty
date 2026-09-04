import React from 'react'

// Expo Router mounts routes from a Metro `require.context`. Tests and Storybook
// have no such context, so build a minimal one over an explicit route map.
export const makeRouteContext = (routes: Record<string, React.ComponentType<any>>) => {
	const context = ((key: string) => ({ default: routes[key] })) as any
	context.keys = () => Object.keys(routes)
	context.resolve = (key: string) => key
	context.id = 'in-memory-routes'
	return context
}

// Builds the require.context key Expo Router expects for a given route path.
export const routeContextKey = (path: string) => `.${path}.tsx`
