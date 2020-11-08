import React from 'react'
import { View, ScrollView } from 'react-native'
import { Layout } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting } from '../shared-components/SettingsButtons'
import { useNavigation } from '@react-navigation/native'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'

import { useStyles } from '@berty-tech/styles'
import { globals } from '@berty-tech/config'

const BodyAddContactList = () => {
	const { t } = useTranslation()
	const [{ color, padding, flex, margin }] = useStyles()
	const navigation = useNavigation()

	return (
		<View style={[padding.medium, flex.tiny, margin.bottom.small]}>
			{Object.values(globals.berty.contacts).map((value) => {
				return (
					<ButtonSetting
						key={value.link}
						name={t('settings.add-contact-list.add') + value.name}
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
	const { t } = useTranslation()
	const [{ color, padding, flex, background }] = useStyles()
	const { goBack } = useNavigation()

	return (
		<Layout style={[background.white, flex.tiny]}>
			<SwipeNavRecognizer>
				<ScrollView bounces={false} contentContainerStyle={padding.bottom.scale(90)}>
					<HeaderSettings
						title={t('settings.add-contact-list.title')}
						bgColor={color.dark.grey}
						undo={goBack}
					/>
					<BodyAddContactList />
				</ScrollView>
			</SwipeNavRecognizer>
		</Layout>
	)
}
