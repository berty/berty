import moment from 'moment'

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

export const showNeedRestartNotification = (
	showNotification: any,
	restart: () => Promise<void>,
	t: any,
) => {
	showNotification({
		title: t('notification.need-restart.title'),
		message: t('notification.need-restart.desc'),
		onPress: async () => {
			await restart()
		},
		additionalProps: { type: 'message' },
	})
}
