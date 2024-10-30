import React from 'react'
import { useSelector } from 'react-redux'

import { selectStreamError, selectStreamProgress } from '@berty/redux/reducers/ui.reducer'

import { StreamProgressProps } from './interfaces'
import { StreamProgressPriv } from './StreamProgress.priv'
import { StreamProgressErrorPriv } from './StreamProgressError.priv'

export const StreamProgress: React.FC<StreamProgressProps> = props => {
	const streamInProgress = useSelector(selectStreamProgress)
	const streamError = useSelector(selectStreamError)

	if (streamError && !streamInProgress) {
		return <StreamProgressErrorPriv />
	}
	return <StreamProgressPriv testID={props.testID} />
}
