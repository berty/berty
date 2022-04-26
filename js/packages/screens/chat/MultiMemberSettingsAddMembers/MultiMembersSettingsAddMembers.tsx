import React from 'react'
import { StatusBar, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Icon, Layout } from '@ui-kitten/components'
import { SafeAreaView } from 'react-native-safe-area-context'
import Long from 'long'

import beapi from '@berty/api'
import { ScreenFC } from '@berty/navigation'
import { useStyles } from '@berty/contexts/styles'
import { useMessengerClient, useThemeColor } from '@berty/store'
import { selectInvitationListMembers } from '@berty/redux/reducers/groupCreationForm.reducer'
import { useAllContacts, useAppDispatch, useAppSelector, useConversation } from '@berty/hooks'

import { FooterCreateGroup } from '@berty/components/create-group/CreateGroupFooter'
import { ContactPicker } from '@berty/components/shared-components'
import { Header } from '@berty/components/create-group/CreateGroupHeader'
import { MemberList } from '@berty/components/create-group/CreateGroupMemberList'
import { useAppDimensions } from '@berty/contexts/app-dimensions.context'

export const MultiMemberSettingsAddMembers: ScreenFC<'Chat.MultiMemberSettingsAddMembers'> = ({
	route,
	navigation,
}) => {
	const { flex, margin } = useStyles()
	const { scaleHeight, scaleSize } = useAppDimensions()
	const colors = useThemeColor()
	const { t } = useTranslation()
	const client = useMessengerClient()
	const conv = useConversation(route.params.convPK)
	const accountContacts = useAllContacts()
	const members = useAppSelector(selectInvitationListMembers)
	const dispatch = useAppDispatch()

	const sendInvitations = React.useCallback(async () => {
		try {
			if (!client) {
				throw new Error('no client')
			}
			const buf = beapi.messenger.AppMessage.GroupInvitation.encode({ link: conv?.link }).finish()
			await Promise.all(
				members.map(async member => {
					const reply = await client.interact({
						conversationPublicKey: member.conversationPublicKey,
						type: beapi.messenger.AppMessage.Type.TypeGroupInvitation,
						payload: buf,
					})
					const optimisticInteraction: beapi.messenger.IInteraction = {
						cid: reply.cid,
						isMine: true,
						conversationPublicKey: member.conversationPublicKey,
						type: beapi.messenger.AppMessage.Type.TypeGroupInvitation,
						payload: buf,
						sentDate: Long.fromNumber(Date.now()).toString() as unknown as Long,
					}
					dispatch({
						type: 'messenger/InteractionUpdated',
						payload: { interaction: optimisticInteraction },
					})
				}),
			)
		} catch (e) {
			console.warn('failed to send invitations:', e)
		}
	}, [client, conv, members, dispatch])

	React.useLayoutEffect(() => {
		navigation.setOptions({
			headerRight: () => (
				<Icon
					name='users'
					pack='custom'
					width={35 * scaleSize}
					height={35 * scaleSize}
					fill={colors['reverted-main-text']}
				/>
			),
		})
	})

	return (
		<Layout style={[flex.tiny]}>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<SafeAreaView style={{ backgroundColor: colors['background-header'] }}>
				<MemberList />
			</SafeAreaView>
			<View style={{ flex: 1, backgroundColor: colors['main-background'] }}>
				<View style={{ top: -30 * scaleHeight, flex: 1 }}>
					<Header title={t('chat.add-members.contacts')} first style={[margin.bottom.scale(-1)]} />
					<ContactPicker accountContacts={accountContacts} />
				</View>
			</View>
			<FooterCreateGroup
				title={t('chat.add-members.add')}
				icon='arrow-forward-outline'
				action={async () => {
					await sendInvitations()
					navigation.goBack()
				}}
			/>
		</Layout>
	)
}
