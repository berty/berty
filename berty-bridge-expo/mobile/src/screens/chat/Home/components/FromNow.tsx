import moment from 'moment'
import React from 'react'

import { useNow } from '@berty/hooks'

const FromNow: React.FC<{ date: number; interval?: number }> = ({ date, interval = 30000 }) => {
	const now = useNow(interval)
	return <>{moment(date).from(now)}</>
}

export default FromNow
