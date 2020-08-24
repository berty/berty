import React from 'react'
import { View, ScrollView } from 'react-native'
import { Layout } from 'react-native-ui-kitten'
import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting } from '../shared-components/SettingsButtons'
import { useNavigation } from '@berty-tech/navigation'
import { useStyles } from '@berty-tech/styles'
import { Messenger } from '@berty-tech/store/oldhooks'

const BodyFakeDatas = () => {
	const [{ color, padding, flex, margin }] = useStyles()
	const generateFake = Messenger.useConversationGenerate()
	const deleteFake = Messenger.useConversationDeleteFake()
	const convGenMsg = Messenger.useConversationGenerateMsg()

	return (
		<View style={[padding.medium, flex.tiny, margin.bottom.small]}>
			<ButtonSetting
				name='Gen fake convs'
				icon='book-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				actionIcon={null}
				onPress={() => generateFake({ length: 20 })}
			/>
			<ButtonSetting
				name='Gen fake msgs in convs'
				icon='book-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				actionIcon={null}
				onPress={() => convGenMsg({ length: 10 })}
			/>
			<ButtonSetting
				name='Delete fake datas'
				icon='book-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				actionIcon={null}
				onPress={() => deleteFake()}
			/>
		</View>
	)
}

export const FakeDatas = () => {
	const [{ color, padding, flex, background }] = useStyles()
	const { goBack } = useNavigation()

	return (
		<Layout style={[background.white, flex.tiny]}>
			<ScrollView bounces={false} contentContainerStyle={padding.bottom.scale(90)}>
				<HeaderSettings title='Generate fake datas' bgColor={color.dark.grey} undo={goBack} />
				<BodyFakeDatas />
			</ScrollView>
		</Layout>
	)
}
