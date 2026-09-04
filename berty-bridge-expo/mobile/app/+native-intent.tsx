import { ROUTE_PATHS } from '@berty/navigation/routes'

// Expo Router matches incoming URLs against the routes under app/. Berty deep
// links carry a payload rather than a route path ("berty://b/contact/<payload>"),
// so nothing matches them and the user lands on the Unmatched Route screen.
// Rewrite those onto the ManageDeepLink route, which knows how to parse them.

const APP_SCHEME = 'berty'

const KNOWN_ROUTE_PATHS = new Set<string>(Object.values(ROUTE_PATHS))

// The Expo dev client launches the app with its own URL; it must reach the
// router untouched or the development build cannot connect to Metro.
const isExpoDevClientUrl = (url: string) =>
	url.includes('expo-development-client') || url.startsWith('exp://') || url.startsWith('exp+')

// Everything after the scheme, with any leading slashes removed. A plain launch
// arrives as "berty:///", which leaves nothing and is not a deep link.
const payloadOf = (url: string): string => {
	const withoutScheme = url.includes('://') ? url.slice(url.indexOf('://') + 3) : url
	return withoutScheme.replace(/^\/+/, '')
}

export function redirectSystemPath({ path }: { path: string; initial: boolean }): string {
	if (isExpoDevClientUrl(path)) {
		return path
	}

	const payload = payloadOf(path)
	if (!payload) {
		// Ordinary launch, no link to handle.
		return '/'
	}

	// Anything that already addresses a route in app/ is left alone.
	const [pathname] = path.split('?')
	if (KNOWN_ROUTE_PATHS.has(pathname) || KNOWN_ROUTE_PATHS.has(`/${payload.split('?')[0]}`)) {
		return path
	}

	// Keep the scheme so ManageDeepLink receives the link as it was opened.
	const link = path.includes('://') ? path : `${APP_SCHEME}://${payload}`

	const params = new URLSearchParams({ type: 'link', value: link })
	return `${ROUTE_PATHS['Chat.ManageDeepLink']}?${params.toString()}`
}
