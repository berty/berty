import moment from 'moment'
import { Long } from 'protobufjs/light'
import DocumentPicker from 'react-native-document-picker'
import { Platform } from 'react-native'
import getPath from '@flyerhq/react-native-android-uri-path'

import { MsgrState } from '@berty-tech/store/context'

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

export const timestamp = (date: Date): any => ({
	seconds: Math.floor(date.getTime() / 1000),
	nanos: (date.getTime() % 1000) * 1000,
})

const getValidDateMoment = (date: number | Date): moment.Moment => {
	const mDate = moment(date)
	return mDate.isValid() ? mDate : moment(0)
}

/**
 * When we show time or date, depending on recency
 * (e.g. conversation list)
 */
const fmtTimestamp1 = (date: number | Date): string => {
	const now = moment()
	const mDate = getValidDateMoment(date)
	if (now.isSame(mDate, 'day')) {
		return mDate.format('hh:mm a')
	} else if (now.subtract(1, 'day').isSame(mDate, 'day')) {
		return 'Yesterday'
	} else if (now.isSame(mDate, 'week')) {
		// return mDate.format('DD/MM')
		return mDate.format('dddd')
	} else {
		return mDate.format('DD/MM/YY')
	}
}

/**
 * When we just care about the day (e.g. 1-1 chat confirmed header)
 */
const fmtTimestamp2 = (date: number | Date): string => {
	const now = moment()
	const mDate = getValidDateMoment(date)
	if (now.isSame(mDate, 'day')) {
		return 'Today'
	} else if (now.subtract(1, 'day').isSame(mDate, 'day')) {
		return 'Yesterday'
	}
	return mDate.format('MMM D YYYY')
}

/**
 * Only show time
 * Use for messages in chatrooms
 * (We don't need to show the date; it is in the sticky header)
 */
const fmtTimestamp3 = (date: number | Date): string => {
	const mDate = getValidDateMoment(date)
	return mDate.format('hh:mm a')
}

export const timeFormat = { fmtTimestamp1, fmtTimestamp2, fmtTimestamp3 }

export const strToTimestamp = (dateStr?: string): number =>
	new Date(parseInt(dateStr || '0', 10)).getTime()

export const pbDateToNum = (pbTimestamp?: number | Long | string | null): number => {
	try {
		return !pbTimestamp ? 0 : parseInt(pbTimestamp as string, 10)
	} catch (e) {
		console.warn(`Error parsing date ${pbTimestamp}; returning zero`)
		return 0
	}
}

export const openDocumentPicker = async (ctx: MsgrState) => {
	try {
		const res = await DocumentPicker.pick({
			// @ts-ignore
			type: Platform.OS === 'android' ? ['application/x-tar'] : ['public.tar-archive'],
		})

		const replaced =
			Platform.OS === 'android' ? getPath(res.uri) : res.uri.replace(/^file:\/\//, '')
		await ctx.importAccount(replaced)
	} catch (err) {
		if (DocumentPicker.isCancel(err)) {
			// ignore
		} else {
			console.error(err)
		}
	}
}
