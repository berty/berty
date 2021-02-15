import React from 'react'
import { View, ScrollView } from 'react-native'
import { Layout } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import { HeaderSettings } from '../common/Header'
import { ButtonSetting } from '../common/SettingsButtons'
import { SwipeNavRecognizer } from '../common/SwipeNavRecognizer'

import { useNavigation } from '@berty-tech/navigation'
import { useStyles } from '@berty-tech/styles'

import {
	useGenerateFakeContacts,
	useGenerateFakeMultiMembers,
	useDeleteFakeData,
	useGenerateFakeMessages,
} from '@berty-tech/store/hooks'

const BodyFakeData = () => {
	const { t } = useTranslation()
	const [{ color, padding, flex, margin }] = useStyles()
	const generateFakeContacts = useGenerateFakeContacts()
	const generateFakeMM = useGenerateFakeMultiMembers()
	const deleteFake = useDeleteFakeData()
	const convGenMsg = useGenerateFakeMessages()

	return (
		<View style={[padding.medium, flex.tiny, margin.bottom.small]}>
			<ButtonSetting
				name={t('settings.fake-data.contacts-button')}
				icon='book-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				actionIcon={null}
				onPress={() => generateFakeContacts(5)}
			/>
			<ButtonSetting
				name={t('settings.fake-data.multi-members-button')}
				icon='book-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				actionIcon={null}
				onPress={() => generateFakeMM(5)}
			/>
			<ButtonSetting
				name={t('settings.fake-data.messages-button')}
				icon='book-outline'
				iconSize={30}
				iconColor={color.dark.grey}
				actionIcon={null}
				onPress={() => convGenMsg(3)}
			/>
			<ButtonSetting
				name={t('settings.fake-data.delete-button')}
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
	const { t } = useTranslation()

	return (
		<Layout style={[background.white, flex.tiny]}>
			<SwipeNavRecognizer>
				<ScrollView bounces={false} contentContainerStyle={padding.bottom.scale(90)}>
					<HeaderSettings
						title={t('settings.fake-data.title')}
						bgColor={color.dark.grey}
						undo={goBack}
					/>
					<BodyFakeData />
				</ScrollView>
			</SwipeNavRecognizer>
		</Layout>
	)
}
