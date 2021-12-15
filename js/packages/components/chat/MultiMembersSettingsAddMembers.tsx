import React from 'react'
import { StatusBar, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Icon, Layout } from '@ui-kitten/components'
import { SafeAreaView } from 'react-native-safe-area-context'
import Long from 'long'

import beapi from '@berty-tech/api'
import { ScreenFC } from '@berty-tech/navigation'
import { useStyles } from '@berty-tech/styles'
import {
	useContactList,
	useConversation,
	useConvMemberList,
	useMessengerClient,
	useMessengerContext,
	useThemeColor,
} from '@berty-tech/store'

import { FooterCreateGroup } from '../main/CreateGroupFooter'
import { Header, MemberList } from '../main/CreateGroupAddMembers'
import { ContactPicker } from '../shared-components'
import { useSelector } from 'react-redux'
import { selectInvitationListMembers } from '@berty-tech/redux/reducers/newGroup.reducer'

export const MultiMemberSettingsAddMembers: ScreenFC<'Group.MultiMemberSettingsAddMembers'> = ({
	route,
	navigation,
}) => {
	const [{ flex, margin }, { scaleHeight, scaleSize }] = useStyles()
	const colors = useThemeColor()
	const ctx = useMessengerContext()
	const { t } = useTranslation()
	const client = useMessengerClient()
	const conv = useConversation(route.params.convPK)
	const convMembers = useConvMemberList(route.params.convPK)
	const initialMembers = convMembers.filter(member => !member.isMe)
	const accountContacts = useContactList()
	const members = useSelector(selectInvitationListMembers)
	const messengerDispatch = ctx.dispatch

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
						sentDate: Long.fromNumber(Date.now()),
					}
					messengerDispatch({
						type: beapi.messenger.StreamEvent.Type.TypeInteractionUpdated,
						payload: { interaction: optimisticInteraction },
					})
				}),
			)
		} catch (e) {
			console.warn('failed to send invitations:', e)
		}
	}, [client, conv, members, messengerDispatch])

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
				<MemberList initialMembers={initialMembers} />
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
