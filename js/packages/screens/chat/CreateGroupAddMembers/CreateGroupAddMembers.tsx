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
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'
import { useStyles } from '@berty/contexts/styles'
import { useAllContacts, useThemeColor } from '@berty/hooks'
import { ScreenFC, useNavigation } from '@berty/navigation'

export const CreateGroupAddMembers: ScreenFC<'Chat.CreateGroupAddMembers'> = () => {
	const { flex, margin } = useStyles()
	const { scaleHeight } = useAppDimensions()
	const colors = useThemeColor()
	const navigation = useNavigation()
	const { t } = useTranslation()
	const accountContacts = useAllContacts()

	return (
		<Layout style={[flex.tiny, { backgroundColor: '#FFFFFF' }]}>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<View style={{ backgroundColor: colors['background-header'] }}>
				<CreateGroupMemberList />
			</View>
			<View style={{ flex: 1, backgroundColor: '#FFFFFF' }}>
				<View style={{ top: -30 * scaleHeight, flex: 1 }}>
					<CreateGroupHeader
						title={t('main.home.create-group.add-members')}
						first
						style={[margin.bottom.scale(-1)]}
					/>
					<ContactPicker accountContacts={accountContacts} />
				</View>
			</View>
			<CreateGroupFooterWithIcon
				title={t('main.home.create-group.continue')}
				icon='arrow-forward-outline'
				action={() => navigation.navigate('Chat.CreateGroupFinalize')}
			/>
		</Layout>
	)
}
