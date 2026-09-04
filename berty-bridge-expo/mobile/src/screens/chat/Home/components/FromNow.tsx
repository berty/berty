import moment from 'moment'
import React, { useState, useEffect } from 'react'

const FromNow: React.FC<{ date: number; interval?: number }> = ({ date, interval = 30000 }) => {
	const [value, setValue] = useState(() => moment(date).fromNow())
	useEffect(() => {
		const intervalID = setInterval(() => setValue(moment(date).fromNow()), interval)
		return () => clearInterval(intervalID)
	}, [date, interval])
	return <>{value}</>
}

export default FromNow
