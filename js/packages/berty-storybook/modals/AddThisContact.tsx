import React from 'react'
import { View, Button, Text } from 'react-native'
import { Chat } from '@berty-tech/hooks'
import { useNavigation } from '@react-navigation/native'

export const AddThisContact: React.FC<{
	name: string
	publicKey: string
	reference: string
}> = ({ name, publicKey, reference }) => {
	const sendContactRequest = Chat.useAccountSendContactRequest()
	const navigation = useNavigation()
	return (
		<View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10, alignItems: 'center' }}>
			<Text>{name}</Text>
			<Button
				title='ADD THIS CONTACT'
				onPress={() => {
					sendContactRequest(name, reference)
					navigation.goBack()
					navigation.navigate('Tabs', { screen: 'Main' })
				}}
			/>
			<Button title='Close' onPress={() => navigation.goBack()} />
		</View>
	)
}
