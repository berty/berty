import React, { useState } from 'react'
import { StatusBar, TouchableOpacity, View } from 'react-native'
import { useTranslation } from 'react-i18next'
import { Icon, Layout, Text } from '@ui-kitten/components'
import { SafeAreaView } from 'react-native-safe-area-context'

import beapi from '@berty-tech/api'
import { useStyles } from '@berty-tech/styles'
import { useNavigation } from '@berty-tech/navigation'
import { SwipeNavRecognizer } from '@berty-tech/components/shared-components/SwipeNavRecognizer'
import { FooterCreateGroup } from '@berty-tech/components/main/CreateGroupFooter'
import { Header, MemberList } from '@berty-tech/components/main/CreateGroupAddMembers'
import { ContactPicker } from '@berty-tech/components/shared-components'
import {
	useContactList,
	useConversation,
	useConvMemberList,
	useMsgrContext,
	useThemeColor,
} from '@berty-tech/store/hooks'

const _iconArrowBackSize = 30
const _titleSize = 25

export const AddMembersHeader: React.FC<{}> = () => {
	const navigation = useNavigation()
	const [{ padding, margin, text }, { scaleSize }] = useStyles()
	const colors = useThemeColor()
	const { t }: { t: any } = useTranslation()
	return (
		<View
			style={[
				padding.medium,
				margin.bottom.small,
				{
					flexDirection: 'row',
					justifyContent: 'space-between',
					alignItems: 'center',
				},
			]}
		>
			<View
				style={[
					{
						flexDirection: 'row',
						alignItems: 'center',
					},
				]}
			>
				<TouchableOpacity
					onPress={navigation.goBack}
					style={{
						padding: 7,
						alignItems: 'center',
						justifyContent: 'center',
					}}
				>
					<Icon
						name='arrow-back-outline'
						width={_iconArrowBackSize * scaleSize}
						height={_iconArrowBackSize * scaleSize}
						fill={colors['reverted-main-text']}
					/>
				</TouchableOpacity>
				<Text
					style={[
						text.size.huge,
						{
							fontWeight: '700',
							lineHeight: 1.25 * _titleSize,
							marginLeft: 10,
							color: colors['reverted-main-text'],
						},
					]}
				>
					{t('chat.add-members.members')}
				</Text>
			</View>
			<Icon
				name='users'
				pack='custom'
				width={35 * scaleSize}
				height={35 * scaleSize}
				fill={colors['reverted-main-text']}
			/>
		</View>
	)
}

export const MultiMemberSettingsAddMembers: React.FC<{
	route: { params: { convPK: string } }
}> = ({ route }) => {
	const [{ flex, margin }, { scaleHeight }] = useStyles()
	const colors = useThemeColor()
	const navigation = useNavigation()
	const ctx = useMsgrContext()
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

	return (
		<Layout style={[flex.tiny]}>
			<StatusBar backgroundColor={colors['background-header']} barStyle='light-content' />
			<SwipeNavRecognizer onSwipeRight={() => navigation.goBack()}>
				<SafeAreaView style={{ backgroundColor: colors['background-header'] }}>
					<AddMembersHeader />
					<MemberList
						initialMembers={initialMembers}
						members={members}
						onRemoveMember={onRemoveMember}
					/>
				</SafeAreaView>
				<View style={{ flex: 1, backgroundColor: colors['main-background'] }}>
					<View style={{ top: -30 * scaleHeight, flex: 1 }}>
						<Header
							title={t('chat.add-members.contacts')}
							first
							style={[margin.bottom.scale(-1)]}
						/>
						<ContactPicker
							members={members}
							onSetMember={onSetMember}
							onRemoveMember={onRemoveMember}
							accountContacts={accountContacts}
						/>
					</View>
				</View>
			</SwipeNavRecognizer>
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
