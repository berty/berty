import React from 'react'
import { View, ScrollView } from 'react-native'
import { Layout } from 'react-native-ui-kitten'
import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting } from '../shared-components/SettingsButtons'
import { useNavigation } from '@berty-tech/navigation'
import { useStyles } from '@berty-tech/styles'
// import { Messenger } from '@berty-tech/store/oldhooks'
import {
	useGenerateFakeContacts,
	useGenerateFakeMultiMembers,
	useDeleteFakeData,
	useGenerateFakeMessages,
} from '@berty-tech/store/hooks'

const BodyFakeData = () => {
	const [{ color, padding, flex, margin }] = useStyles()
	const generateFakeContacts = useGenerateFakeContacts()
	const generateFakeMM = useGenerateFakeMultiMembers()
	const deleteFake = useDeleteFakeData()
	const convGenMsg = useGenerateFakeMessages()

	return (
		<View style={[padding.medium, flex.tiny, margin.bottom.small]}>
			<ButtonSetting
				name='Gen fake contacts'
				icon='book-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				actionIcon={null}
				onPress={() => generateFakeContacts(5)}
			/>
			<ButtonSetting
				name='Gen fake multi-members'
				icon='book-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				actionIcon={null}
				onPress={() => generateFakeMM(5)}
			/>
			<ButtonSetting
				name='Gen fake messages'
				icon='book-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				actionIcon={null}
				onPress={() => convGenMsg(3)}
			/>
			<ButtonSetting
				name='Delete fake data'
				icon='book-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				actionIcon={null}
				onPress={() => deleteFake()}
			/>
		</View>
	)
}

export const FakeData = () => {
	const [{ color, padding, flex, background }] = useStyles()
	const { goBack } = useNavigation()

	return (
		<Layout style={[background.white, flex.tiny]}>
			<ScrollView bounces={false} contentContainerStyle={padding.bottom.scale(90)}>
				<HeaderSettings title='Generate fake data' bgColor={color.dark.grey} undo={goBack} />
				<BodyFakeData />
			</ScrollView>
		</Layout>
	)
}
