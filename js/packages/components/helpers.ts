import moment from 'moment'

import {
	MessengerState,
	PersistentOptionsKeys,
	UpdatesProfileNotification,
} from '@berty-tech/store/types'

export const promiseResolved = (): Promise<void> => new Promise((res): any => setTimeout(res, 1000))

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

export const showNeedRestartNotification = (showNotification: any, ctx: MessengerState, t: any) => {
	showNotification({
		title: t('notification.need-restart.title'),
		message: t('notification.need-restart.desc'),
		onPress: async () => {
			await ctx.restart()
		},
		additionalProps: { type: 'message' },
	})
}

export const readProfileNotification = async (
	ctx: MessengerState,
	type: typeof UpdatesProfileNotification,
) => {
	const profileNotifs = ctx.persistentOptions[PersistentOptionsKeys.ProfileNotification]
	const numberNotifs = profileNotifs[UpdatesProfileNotification]
	if (numberNotifs === 0) {
		return
	}
	await ctx.setPersistentOption({
		type: PersistentOptionsKeys.ProfileNotification,
		payload: {
			...profileNotifs,
			[type]: numberNotifs - 1,
		},
	})
}
