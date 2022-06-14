import React from 'react'
import { useSelector } from 'react-redux'

import { selectStreamError, selectStreamProgress } from '@berty/redux/reducers/ui.reducer'

import { StreamProgressPriv } from './StreamProgress.priv'
import { StreamProgressErrorPriv } from './StreamProgressError.priv'

export const StreamProgress: React.FC = () => {
	const streamInProgress = useSelector(selectStreamProgress)
	const streamError = useSelector(selectStreamError)

	if (streamError && !streamInProgress) {
		return <StreamProgressErrorPriv />
	}

	return <StreamProgressPriv />
}
