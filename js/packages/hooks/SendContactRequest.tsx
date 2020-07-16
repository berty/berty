import React from 'react'
import { ActivityIndicator } from 'react-native'
import InvalidScan from './InvalidScan'
import AddThisContact from './AddThisContact'
import { Messenger } from '@berty-tech/hooks'

export const SendContactRequest: React.FC<{
	type: 'qr' | 'link'
}> = (params) => {
	const account = Messenger.useAccount()
	const client = Messenger.useClient()
	const requestDraft = Messenger.useRequestDraft()
	let content
	if (!client || !account?.onboarded) {
		content = (
			<InvalidScan
				title={'App not ready!'}
				error={'Please finish the onboarding before adding contacts.'}
			/>
		)
	} else if (!requestDraft) {
		content = <ActivityIndicator size='large' />
	} else if (requestDraft.error !== undefined) {
		let title
		if (params.type === 'link') {
			title = 'Invalid link!'
		} else if (params.type === 'qr') {
			title = 'Invalid QR code!'
		} else {
			title = 'Error!'
		}
		content = <InvalidScan title={title} error={requestDraft.error} />
	} else {
		content = <AddThisContact requestDraft={requestDraft} />
	}
	return content
}
