import React, { useState } from 'react'
import { StatusBar, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Icon, Layout } from '@ui-kitten/components'
import { SafeAreaView } from 'react-native-safe-area-context'

import beapi from '@berty-tech/api'
import { ScreenFC } from '@berty-tech/navigation'
import { useStyles } from '@berty-tech/styles'
import {
	useContactList,
	useConversation,
	useConvMemberList,
	useMessengerContext,
	useThemeColor,
} from '@berty-tech/store'

import { FooterCreateGroup } from '../main/CreateGroupFooter'
import { Header, MemberList } from '../main/CreateGroupAddMembers'
import { ContactPicker } from '../shared-components'

export const MultiMemberSettingsAddMembers: ScreenFC<'Group.MultiMemberSettingsAddMembers'> = ({
	route,
	navigation,
}) => {
	const [{ flex, margin }, { scaleHeight, scaleSize }] = useStyles()
	const colors = useThemeColor()
	const ctx = useMessengerContext()
	const { t }: { t: any } = useTranslation()

	const conv = useConversation(route.params.convPK)
	const convMembers = useConvMemberList(route.params.convPK)
	const initialMembers = convMembers.filter(member => !member.isMe)
	const [members, setMembers] = useState(initialMembers)
	const accountContacts = useContactList()

	const onRemoveMember = (id: string) => {
		const filtered = members.filter(member => member.publicKey !== id)
		if (filtered.length !== members.length) {
			setMembers(filtered)
		}
	}
	const onSetMember = (contact: any) => {
		if (members.find(member => member.publicKey === contact.publicKey)) {
			return
		}
		setMembers([...members, contact])
	}

	const invitationsToGroup = React.useCallback(async () => {
		try {
			const buf = beapi.messenger.AppMessage.GroupInvitation.encode({ link: conv?.link }).finish()
			await members.forEach(member => {
				ctx.client?.interact({
					conversationPublicKey: member.conversationPublicKey,
					type: beapi.messenger.AppMessage.Type.TypeGroupInvitation,
					payload: buf,
				})
			})
		} catch (e) {
			console.warn(e)
		}
	}, [ctx.client, conv, members])

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
				<MemberList
					initialMembers={initialMembers}
					members={members}
					onRemoveMember={onRemoveMember}
				/>
			</SafeAreaView>
			<View style={{ flex: 1, backgroundColor: colors['main-background'] }}>
				<View style={{ top: -30 * scaleHeight, flex: 1 }}>
					<Header title={t('chat.add-members.contacts')} first style={[margin.bottom.scale(-1)]} />
					<ContactPicker
						members={members}
						onSetMember={onSetMember}
						onRemoveMember={onRemoveMember}
						accountContacts={accountContacts}
					/>
				</View>
			</View>
			<FooterCreateGroup
				title={t('chat.add-members.add')}
				icon='arrow-forward-outline'
				action={async () => {
					await invitationsToGroup()
					navigation.goBack()
				}}
			/>
		</Layout>
	)
}
