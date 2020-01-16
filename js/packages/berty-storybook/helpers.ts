import { google } from '@berty-tech/api'

export const promiseResolved = (): Promise<void> => new Promise((res): any => setTimeout(res, 1000))
// export const promiseRejected = (): Promise<void> =>
//   new Promise((res, rej): Timeout => setTimeout(rej, 1000))

export const randomItem = <T extends unknown>(arr: Array<T>): T =>
	arr[Math.floor(Math.random() * 1000) % arr.length]

export const randomValue = <T extends { [name: string]: any }>(obj: T): any =>
	obj[randomItem(Object.keys(obj))]

export const randomLength = (mod = 20): number => Math.floor(Math.random() * 1000) % mod
export const randomArray = <T extends unknown>(mod: number): Array<T> =>
	new Array(randomLength(mod)).fill({})

export const timestamp = (date: Date): google.protobuf.ITimestamp => ({
	seconds: Math.floor(date.getTime() / 1000),
	nanos: (date.getTime() % 1000) * 1000,
})

export const deepFilterEqual = <T extends any>(
	a: T,
	b: T,
	opts: { exclude?: Array<string>; noPrivate?: boolean } = {},
): boolean => {
	const { exclude = [], noPrivate = true } = opts
	if (!a) {
		return true
	}
	if (typeof a !== typeof b) {
		return false
	}
	if (typeof a === 'object') {
		if (Array.isArray(a)) {
			if (!Array.isArray(b)) {
				return false
			}
			return a.every((av: T) => b.some((bv: T) => deepFilterEqual(av, bv)))
		}
		return Object.keys(a).every(
			(k: string) =>
				(noPrivate && k[0] === '_') ||
				exclude.some((excludeKey) => excludeKey === k) ||
				deepFilterEqual(a[k], b[k]),
		)
	}
	return a === b
}

export const deepEqual = <T extends any>(
	a: T,
	b: T,
	opts: { exclude?: Array<string>; noPrivate?: boolean } = {},
): boolean => {
	const { exclude = [], noPrivate = true } = opts
	if (typeof a !== typeof b) {
		return false
	}
	if (typeof a === 'object') {
		if (Array.isArray(a)) {
			if (!Array.isArray(b)) {
				return false
			}
			return a.every((av: T) => b.some((bv: T) => deepEqual(av, bv)))
		}
		if (Array.isArray(b)) {
			return false
		}
		return Object.keys(a).every(
			(k) =>
				(noPrivate && k[0] === '_') ||
				exclude.some((excludeKey) => excludeKey === k) ||
				deepEqual(a[k], b[k]),
		)
	}
	return a === b
}
