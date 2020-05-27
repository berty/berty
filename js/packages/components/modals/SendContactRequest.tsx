import React from 'react'
import { StyleSheet, View } from 'react-native'
import { BlurView } from '@react-native-community/blur'
import InvalidScan from './InvalidScan'
import AddThisContact from './AddThisContact'
import { Buffer } from 'buffer'
import { Chat } from '@berty-tech/hooks'
import { useStyles } from '@berty-tech/styles'
import { SafeAreaView } from 'react-native-safe-area-context'

export const SendContactRequest: React.FC<{
	route: { params: { qrData: string } | { uriData: string } }
}> = ({ route: { params } }) => {
	const account = Chat.useAccount()
	const client = Chat.useClient()
	const contacts = Chat.useAccountContacts()
	const [{ border }] = useStyles()
	let content
	if (!client || !account?.onboarded) {
		content = (
			<InvalidScan
				title={'App not ready!'}
				error={'Please finish the onboarding before adding contacts.'}
			/>
		)
	} else {
		try {
			let decodedData
			if ('uriData' in params) {
				decodedData = decodeURIComponent(params.uriData)
			} else if ('qrData' in params) {
				decodedData = params.qrData
			} else {
				throw new Error('Bad usage of SendContactRequest component')
			}
			const parts = decodedData.split(' ')
			if (parts.length !== 3) {
				throw new Error('Corrupted deep link.')
			}
			const [b64Name, rdvSeed, pubKey] = parts
			if (client.accountPk === pubKey) {
				throw new Error("Can't send a contact request to yourself.")
			} else if (contacts.find((contact) => contact.publicKey === pubKey)) {
				throw new Error('Contact already added.')
			} else {
				content = (
					<AddThisContact
						name={Buffer.from(b64Name, 'base64').toString()}
						rdvSeed={rdvSeed}
						pubKey={pubKey}
					/>
				)
			}
		} catch (e) {
			let title
			if ('uriData' in params) {
				title = 'Invalid link!'
			} else if ('qrData' in params) {
				title = 'Invalid QR code!'
			} else {
				title = 'Error!'
			}
			content = <InvalidScan title={title} error={e.toString()} />
		}
	}
	return (
		<>
			<BlurView style={[StyleSheet.absoluteFill]} blurType='light' />
			<SafeAreaView style={[border.shadow.huge]}>{content}</SafeAreaView>
		</>
	)
}
