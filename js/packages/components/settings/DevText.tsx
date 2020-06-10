import React from 'react'
import { TextInput, SafeAreaView } from 'react-native'
import { Button } from 'react-native-ui-kitten'
import { useNavigation } from '@berty-tech/navigation'

export const DevText: React.FC<{ route: { params: { text: string } } }> = ({
	route: {
		params: { text },
	},
}) => {
	const { goBack } = useNavigation()
	return (
		<SafeAreaView>
			<TextInput value={text} editable={false} multiline style={{ height: '95%' }} />
			<Button style={{ height: '5%' }} onPress={goBack}>
				Go back
			</Button>
		</SafeAreaView>
	)
}
