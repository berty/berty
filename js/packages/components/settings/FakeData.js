import React from 'react'
import { View, ScrollView } from 'react-native'
import { Layout } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import { useNavigation } from '@berty-tech/navigation'
import { useStyles } from '@berty-tech/styles'
import {
	useGenerateFakeContacts,
	useGenerateFakeMultiMembers,
	useDeleteFakeData,
	useGenerateFakeMessages,
	useThemeColor,
} from '@berty-tech/store/hooks'

import { HeaderSettings } from '../shared-components/Header'
import { ButtonSetting } from '../shared-components/SettingsButtons'
import { SwipeNavRecognizer } from '../shared-components/SwipeNavRecognizer'

const BodyFakeData = () => {
	const { t } = useTranslation()
	const [{ padding, flex, margin }] = useStyles()
	const colors = useThemeColor()

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
				iconColor={colors['alt-secondary-background-header']}
				actionIcon={null}
				onPress={() => generateFakeContacts(5)}
			/>
			<ButtonSetting
				name={t('settings.fake-data.multi-members-button')}
				icon='book-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				actionIcon={null}
				onPress={() => generateFakeMM(5)}
			/>
			<ButtonSetting
				name={t('settings.fake-data.messages-button')}
				icon='book-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				actionIcon={null}
				onPress={() => convGenMsg(3)}
			/>
			<ButtonSetting
				name={t('settings.fake-data.delete-button')}
				icon='book-outline'
				iconSize={30}
				iconColor={colors['alt-secondary-background-header']}
				actionIcon={null}
				onPress={() => deleteFake()}
			/>
		</View>
	)
}

export const FakeData = () => {
	const colors = useThemeColor()
	const { goBack } = useNavigation()
	const { t } = useTranslation()

	return (
		<Layout style={{ flex: 1, backgroundColor: colors['main-background'] }}>
			<SwipeNavRecognizer>
				<ScrollView bounces={false}>
					<HeaderSettings
						title={t('settings.fake-data.title')}
						bgColor={colors['alt-secondary-background-header']}
						undo={goBack}
					/>
					<BodyFakeData />
				</ScrollView>
			</SwipeNavRecognizer>
		</Layout>
	)
}
