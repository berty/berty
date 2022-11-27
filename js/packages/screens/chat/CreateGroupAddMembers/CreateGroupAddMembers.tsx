import { Layout } from '@ui-kitten/components'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { View, StatusBar } from 'react-native'

import {
	CreateGroupFooterWithIcon,
	CreateGroupHeader,
	CreateGroupMemberList,
} from '@berty/components'
import { ContactPicker } from '@berty/components/shared-components'
import { useStyles } from '@berty/contexts/styles'
import { useAllContacts, useThemeColor } from '@berty/hooks'
import { ScreenFC, useNavigation } from '@berty/navigation'

export const CreateGroupAddMembers: ScreenFC<'Chat.CreateGroupAddMembers'> = () => {
	const { flex, margin } = useStyles()
	const colors = useThemeColor()
	const navigation = useNavigation()
	const { t } = useTranslation()
	const accountContacts = useAllContacts()

	return (
		<Layout style={[flex.tiny, { backgroundColor: '#F2F2F2' }]}>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<View style={{ backgroundColor: colors['background-header'] }}>
				<CreateGroupMemberList />
			</View>
			<View style={{ flex: 1, backgroundColor: '#F2F2F2' }}>
				<View style={{ top: -30, flex: 1 }}>
					<CreateGroupHeader
						title={t('main.home.create-group.add-members')}
						style={[margin.bottom.scale(-1)]}
					/>
					<ContactPicker accountContacts={accountContacts} />
				</View>
			</View>
			<CreateGroupFooterWithIcon
				testID={t('main.home.create-group.continue')}
				title={t('main.home.create-group.continue')}
				icon='arrow-forward-outline'
				action={() => navigation.navigate('Chat.CreateGroupFinalize')}
			/>
		</Layout>
	)
}
