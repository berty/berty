// Route params travel through the URL as strings. ScreensParams keeps the rich
// types the screens already expect, so each route declares which of its fields
// need converting on the way in and out.

import { registerCallback, resolveCallback } from './callbackRegistry'
import { ScreensParams } from './types'

type FieldKind = 'boolean' | 'callback'

// Fields not listed here are passed through as strings.
const PARAM_SCHEMA: Partial<Record<keyof ScreensParams, Record<string, FieldKind>>> = {
	'Account.SelectNode': { init: 'boolean', action: 'callback' },
	'Account.GoToLogInOrCreate': { isCreate: 'boolean' },
	'Account.Opening': { isNewAccount: 'boolean' },
	'Account.Closing': { callback: 'callback' },
	'Settings.Permissions': { accept: 'callback', deny: 'callback' },
}

export const encodeParams = <T extends keyof ScreensParams>(
	name: T,
	params?: ScreensParams[T],
): Record<string, string> | undefined => {
	if (!params) {
		return undefined
	}

	const schema: Record<string, FieldKind> = PARAM_SCHEMA[name] ?? {}
	const encoded: Record<string, string> = {}

	for (const [key, value] of Object.entries(params as Record<string, unknown>)) {
		if (value === undefined || value === null) {
			continue
		}

		switch (schema[key]) {
			case 'boolean':
				encoded[key] = value ? 'true' : 'false'
				break
			case 'callback':
				encoded[key] = registerCallback(value as (...args: any[]) => any)
				break
			default:
				encoded[key] = String(value)
		}
	}

	return encoded
}

export const decodeParams = <T extends keyof ScreensParams>(
	name: T,
	raw: Record<string, unknown>,
): ScreensParams[T] => {
	const schema: Record<string, FieldKind> = PARAM_SCHEMA[name] ?? {}
	const decoded: Record<string, unknown> = {}

	for (const [key, value] of Object.entries(raw ?? {})) {
		if (value === undefined) {
			continue
		}

		// useLocalSearchParams surfaces repeated keys as arrays; routes here only
		// ever set a key once.
		const single = Array.isArray(value) ? value[0] : value

		switch (schema[key]) {
			case 'boolean':
				decoded[key] = single === 'true'
				break
			case 'callback':
				decoded[key] = resolveCallback(single as string)
				break
			default:
				decoded[key] = single
		}
	}

	return decoded as ScreensParams[T]
}
