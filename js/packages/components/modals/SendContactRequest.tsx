import React from 'react'
import { StyleSheet, ActivityIndicator } from 'react-native'
import { BlurView } from '@react-native-community/blur'
import InvalidScan from './InvalidScan'
import AddThisContact from './AddThisContact'
import { Messenger } from '@berty-tech/hooks'
import { useStyles } from '@berty-tech/styles'
import { SafeAreaView } from 'react-native-safe-area-context'

export const SendContactRequest: React.FC<{
	route: { params: { type: 'qr' | 'link' } }
}> = ({ route: { params } }) => {
	const account = Messenger.useAccount()
	const client = Messenger.useClient()
	const requestDraft = Messenger.useRequestDraft()
	const [{ border }] = useStyles()
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
	return (
		<>
			<BlurView style={[StyleSheet.absoluteFill]} blurType='light' />
			<SafeAreaView style={[border.shadow.huge]}>{content}</SafeAreaView>
		</>
	)
}
