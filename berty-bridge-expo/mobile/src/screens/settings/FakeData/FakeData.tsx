import { Layout } from '@ui-kitten/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, ScrollView } from 'react-native'

import { ButtonSetting } from '@berty/components/shared-components/SettingsButtons'
import { useStyles } from '@berty/contexts/styles'
import {
	useThemeColor,
	useGenerateFakeContacts,
	useGenerateFakeMultiMembers,
	useDeleteFakeData,
	// useGenerateFakeMessages,
} from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'

const BodyFakeData = () => {
	const { t } = useTranslation()
	const { padding, flex, margin } = useStyles()
	const colors = useThemeColor()

	const generateFakeContacts = useGenerateFakeContacts()
	const generateFakeMM = useGenerateFakeMultiMembers()
	const deleteFake = useDeleteFakeData()
	// const convGenMsg = useGenerateFakeMessages()

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
				/*onPress={() => convGenMsg(3)}*/
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

export const FakeData: ScreenFC<'Settings.FakeData'> = () => {
	const colors = useThemeColor()

	return (
		<Layout style={{ flex: 1, backgroundColor: colors['main-background'] }}>
			<ScrollView bounces={false}>
				<BodyFakeData />
			</ScrollView>
		</Layout>
	)
}
