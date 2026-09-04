// Expo Router carries route params through URLs, so a param can only ever be a
// string. A few screens are navigated to with callbacks in their params
// ('Account.SelectNode'.action, 'Account.Closing'.callback,
// 'Settings.Permissions'.accept/deny). React Navigation tolerated those
// non-serializable values; file-based routing cannot.
//
// Instead of passing the function, we stash it here and put its id in the URL.
// The screen resolves the id back to the function when it reads its params.

type AnyCallback = (...args: any[]) => any

const callbacks = new Map<string, AnyCallback>()

let nextId = 0

export const registerCallback = (fn: AnyCallback): string => {
	const id = `cb_${++nextId}`
	callbacks.set(id, fn)
	return id
}

export const resolveCallback = (id: string | undefined): AnyCallback | undefined => {
	if (!id) {
		return undefined
	}
	return callbacks.get(id)
}

export const releaseCallback = (id: string | undefined): void => {
	if (id) {
		callbacks.delete(id)
	}
}

// Guards against unbounded growth if a screen is entered many times without the
// registered callback ever being released.
export const releaseAllCallbacks = (): void => {
	callbacks.clear()
}
