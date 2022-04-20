import React from 'react'
import { View, StatusBar } from 'react-native'
import { Layout } from '@ui-kitten/components'
import { useTranslation } from 'react-i18next'

import { ScreenFC, useNavigation } from '@berty/navigation'
import { useStyles } from '@berty/contexts/styles'
import { useThemeColor } from '@berty/store'
import { useAllContacts } from '@berty/hooks'
import { ContactPicker } from '@berty/components/shared-components'
import { FooterCreateGroup } from '@berty/components/create-group/CreateGroupFooter'
import { Header } from '@berty/components/create-group/CreateGroupHeader'
import { MemberList } from '@berty/components/create-group/CreateGroupMemberList'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

export const CreateGroupAddMembers: ScreenFC<'Chat.CreateGroupAddMembers'> = () => {
	const { flex, margin } = useStyles()
	const { scaleHeight } = useAppDimensions()
	const colors = useThemeColor()
	const navigation = useNavigation()
	const { t } = useTranslation()
	const accountContacts = useAllContacts()

	return (
		<Layout style={[flex.tiny]}>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<View style={{ backgroundColor: colors['background-header'] }}>
				<MemberList />
			</View>
			<View style={{ flex: 1, backgroundColor: colors['main-background'] }}>
				<View style={{ top: -30 * scaleHeight, flex: 1 }}>
					<Header
						title={t('main.home.create-group.add-members')}
						first
						style={[margin.bottom.scale(-1)]}
					/>
					<ContactPicker accountContacts={accountContacts} />
				</View>
			</View>
			<FooterCreateGroup
				title={t('main.home.create-group.continue')}
				titleStyle={{ textTransform: 'uppercase' }}
				icon='arrow-forward-outline'
				action={() => navigation.navigate('Chat.CreateGroupFinalize')}
			/>
		</Layout>
	)
}
