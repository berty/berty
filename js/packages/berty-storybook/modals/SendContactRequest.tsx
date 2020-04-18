import React from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'
import { BlurView } from '@react-native-community/blur'
import InvalidScan from './InvalidScan'
import AddThisContact from './AddThisContact'
import { Buffer } from 'buffer'
import { Chat } from '@berty-tech/hooks'

export const SendContactRequest: React.FC<{
	route: { params: { qrData: string } | { uriData: string } }
}> = ({ route: { params } }) => {
	const account = Chat.useAccount()
	const client = Chat.useClient()
	const contacts = Chat.useAccountContacts()
	let content
	if (!client || !account?.onboarded) {
		content = (
			<InvalidScan
				title={'App not ready!'}
				error={'Please finish the onboarding before adding contacts'}
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
				throw new Error('Corrupted deep link')
			}
			const [b64Name, rdvSeed, pubKey] = parts
			if (client.accountPk === pubKey) {
				throw new Error("Can't add self")
			} else if (contacts.find((contact) => contact.publicKey === pubKey)) {
				throw new Error('Contact already added')
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
			<SafeAreaView>{content}</SafeAreaView>
		</>
	)
}
