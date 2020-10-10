import { google } from '@berty-tech/api'
import moment from 'moment'

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

const getValidDateMoment = (date: number | Date): moment.Moment => {
	const mDate = moment(date)
	return mDate.isValid() ? mDate : moment(0)
}

const fmtTimestamp1 = (date: number | Date): string => {
	const now = moment()
	const mDate = getValidDateMoment(date)
	if (now.isSame(mDate, 'day')) {
		return mDate.format('hh:mm a')
	} else if (now.isSame(mDate, 'week')) {
		// return mDate.format('DD/MM')
		return mDate.format('dddd')
	} else {
		return mDate.format('DD/MM/YY')
	}
}

const fmtTimestamp2 = (date: number | Date): string => {
	const mDate = getValidDateMoment(date)
	return mDate.format('MMM D YYYY')
}

export const timeFormat = { fmtTimestamp1, fmtTimestamp2 }

export const strToTimestamp = (dateStr?: string): number =>
	new Date(parseInt(dateStr || '0', 10)).getTime()

export const pbDateToNum = (pbTimestamp?: number | Long | string | null): number => {
	return !pbTimestamp ? 0 : parseInt(pbTimestamp as string, 10)
}
