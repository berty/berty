import React from 'react'
import { SafeAreaView, StyleSheet } from 'react-native'
import { BlurView } from '@react-native-community/blur'
import InvalidScan from './InvalidScan'
import AddThisContact from './AddThisContact'
import { Buffer } from 'buffer'

export const SendContactRequest: React.FC<{
	route: { params: { qrData: string } | { uriData: string } }
}> = ({ route: { params } }) => {
	let content
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
		content = (
			<AddThisContact
				name={Buffer.from(b64Name, 'base64').toString()}
				rdvSeed={rdvSeed}
				pubKey={pubKey}
			/>
		)
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
	return (
		<>
			<BlurView style={[StyleSheet.absoluteFill]} blurType='light' />
			<SafeAreaView>{content}</SafeAreaView>
		</>
	)
}
