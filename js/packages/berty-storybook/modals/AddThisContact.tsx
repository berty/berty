import React, { useContext } from 'react'
import { Modal, View, Button, StyleSheet, Text } from 'react-native'
import { BlurView } from '@react-native-community/blur'
import { ModalsContext } from '../ModalsProvider'
import { Chat } from '@berty-tech/hooks'

export const AddThisContact: React.FC<{
	name: string
	publicKey: string
	reference: string
	onConfirm?: () => void
}> = ({ name, publicKey, reference, onConfirm = () => {} }) => {
	const modals = useContext(ModalsContext)
	const sendContactRequest = Chat.useAccountSendContactRequest()
	return (
		<Modal animationType='slide' transparent visible>
			<BlurView style={[StyleSheet.absoluteFill, { zIndex: 41 }]} blurType='light' />
			<View
				style={{
					justifyContent: 'center',
					alignItems: 'center',
					width: '100%',
					height: '100%',
					zIndex: 42,
				}}
			>
				<View
					style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' }}
				>
					<Text>{name}</Text>
					<Button
						title='ADD THIS CONTACT'
						onPress={() => {
							sendContactRequest(name, reference)
							modals.setCurrent()
							onConfirm()
						}}
					/>
					<Button title='Close' onPress={() => modals.setCurrent()} />
				</View>
			</View>
		</Modal>
	)
}
