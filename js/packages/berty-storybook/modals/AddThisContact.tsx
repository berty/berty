import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text } from 'react-native-ui-kitten'
import { useNavigation } from '@react-navigation/native'
import { Chat } from '@berty-tech/hooks'

const AddThisContact: React.FC<{ name: string; data: string }> = ({ name, data }) => {
	const navigation = useNavigation()
	const sendContactRequest = Chat.useAccountSendContactRequest()
	return (
		<View style={{ justifyContent: 'center', alignItems: 'center', height: '100%' }}>
			<View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
				<Text style={{ textAlign: 'center' }}>{name}</Text>
				<TouchableOpacity
					onPress={() => {
						sendContactRequest(name, data)
						navigation.navigate('Main.List')
					}}
					style={{ padding: 10, backgroundColor: 'grey' }}
				>
					<Text style={{ textAlign: 'center' }}>Add this contact</Text>
				</TouchableOpacity>
				<TouchableOpacity
					onPress={() => navigation.goBack()}
					style={{ padding: 10, backgroundColor: 'grey' }}
				>
					<Text style={{ textAlign: 'center' }}>Dismiss</Text>
				</TouchableOpacity>
			</View>
		</View>
	)
}

export default AddThisContact
