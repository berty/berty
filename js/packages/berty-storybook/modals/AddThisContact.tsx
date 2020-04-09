import React from 'react'
import { View, TouchableOpacity } from 'react-native'
import { Text } from 'react-native-ui-kitten'
import { useNavigation } from '@react-navigation/native'
import { Chat } from '@berty-tech/hooks'
import { useStyles } from '@berty-tech/styles'
import { ProceduralCircleAvatar } from '../shared-components/ProceduralCircleAvatar'

const AddThisContact: React.FC<{ name: string; rdvSeed: string; pubKey: string }> = ({
	name,
	rdvSeed,
	pubKey,
}) => {
	const [{ border, row }] = useStyles()
	const navigation = useNavigation()
	const sendContactRequest = Chat.useAccountSendContactRequest()
	return (
		<View style={{ justifyContent: 'center', alignItems: 'center', height: '100%' }}>
			<View style={{ backgroundColor: 'white', padding: 20, borderRadius: 10 }}>
				<Text style={{ textAlign: 'center' }}>{name}</Text>
				<ProceduralCircleAvatar
					seed={pubKey}
					style={[border.shadow.big, row.center]}
					diffSize={30}
				/>
				<Text style={{ textAlign: 'center' }}>{pubKey}</Text>
				<TouchableOpacity
					onPress={() => {
						sendContactRequest(name, rdvSeed, pubKey)
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
