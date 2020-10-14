import React from 'react'
import { View, ScrollView } from 'react-native'
import { Layout } from 'react-native-ui-kitten'

import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting } from '../shared-components/SettingsButtons'
import { useNavigation } from '@react-navigation/native'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'

import { useStyles } from '@berty-tech/styles'
import { globals } from '@berty-tech/config'

const BodyAddConversationList = () => {
	const [{ color, padding, flex, margin }] = useStyles()
	const navigation = useNavigation()

	return (
		<View style={[padding.medium, flex.tiny, margin.bottom.small]}>
			{Object.values(globals.berty.conversations).map((value) => {
				return (
					<ButtonSetting
						name={'Add ' + value.name}
						icon='book-outline'
						iconSize={30}
						iconColor={color.dark.grey}
						actionIcon={null}
						onPress={() => {
							navigation.navigate('Main.Home')
							navigation.navigate('Modals', {
								screen: 'ManageDeepLink',
								params: { type: 'link', value: value.link },
							})
						}}
					/>
				)
			})}
		</View>
	)
}

export const AddConversationList = () => {
	const [{ color, padding, flex, background }] = useStyles()
	const { goBack } = useNavigation()

	return (
		<Layout style={[background.white, flex.tiny]}>
			<SwipeNavRecognizer>
				<ScrollView bounces={false} contentContainerStyle={padding.bottom.scale(90)}>
					<HeaderSettings title='Add contacts list' bgColor={color.dark.grey} undo={goBack} />
					<BodyAddConversationList />
				</ScrollView>
			</SwipeNavRecognizer>
		</Layout>
	)
}
