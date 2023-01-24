import { Icon, Layout } from '@ui-kitten/components'
import Long from 'long'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { StatusBar, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

import beapi from '@berty/api'
import {
	CreateGroupFooterWithIcon,
	CreateGroupMemberList,
	CreateGroupHeader,
} from '@berty/components'
import { ContactPicker } from '@berty/components/shared-components'
import { useStyles } from '@berty/contexts/styles'
import {
	useAllContacts,
	useAppDispatch,
	useAppSelector,
	useConversation,
	useMessengerClient,
	useThemeColor,
} from '@berty/hooks'
import { ScreenFC } from '@berty/navigation'
import { selectInvitationListMembers } from '@berty/redux/reducers/groupCreationForm.reducer'

export const MultiMemberSettingsAddMembers: ScreenFC<'Chat.MultiMemberSettingsAddMembers'> = ({
	route,
	navigation,
}) => {
	const { flex, margin } = useStyles()
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
					width={35}
					height={35}
					fill={colors['reverted-main-text']}
				/>
			),
		})
	})

	return (
		<Layout style={[flex.tiny, { backgroundColor: '#F2F2F2' }]}>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<SafeAreaView style={{ backgroundColor: colors['background-header'] }}>
				<CreateGroupMemberList />
			</SafeAreaView>
			<View style={{ flex: 1, backgroundColor: '#F2F2F2' }}>
				<View style={{ top: -30, flex: 1 }}>
					<CreateGroupHeader
						title={t('chat.add-members.contacts')}
						style={[margin.bottom.scale(-1)]}
					/>
					<ContactPicker accountContacts={accountContacts} />
				</View>
			</View>
			<CreateGroupFooterWithIcon
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
