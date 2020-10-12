import React from 'react'
import { View, ScrollView } from 'react-native'
import { Layout } from 'react-native-ui-kitten'

import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting } from '../shared-components/SettingsButtons'
import { useNavigation } from '@react-navigation/native'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'

import { useStyles } from '@berty-tech/styles'
import { globals } from '@berty-tech/config'

const BodyAddContactList = () => {
	const [{ color, padding, flex, margin }] = useStyles()
	const contactsName = Object.keys(globals.berty.contacts)
	const navigation = useNavigation()

	return (
		<View style={[padding.medium, flex.tiny, margin.bottom.small]}>
			{Object.values(globals.berty.contacts).map((value, key) => {
				return (
					<ButtonSetting
						name={'Add ' + contactsName[key]}
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

export const AddContactList = () => {
	const [{ color, padding, flex, background }] = useStyles()
	const { goBack } = useNavigation()

	return (
		<Layout style={[background.white, flex.tiny]}>
			<SwipeNavRecognizer>
				<ScrollView bounces={false} contentContainerStyle={padding.bottom.scale(90)}>
					<HeaderSettings title='Add contacts list' bgColor={color.dark.grey} undo={goBack} />
					<BodyAddContactList />
				</ScrollView>
			</SwipeNavRecognizer>
		</Layout>
	)
}
