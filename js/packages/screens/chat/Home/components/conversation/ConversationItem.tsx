import React from 'react'
import { useTranslation } from 'react-i18next'
import { StyleSheet, View } from 'react-native'

import beapi from '@berty/api'
import { ConversationAvatar } from '@berty/components/avatars'
import { useStyles } from '@berty/contexts/styles'
import { useAppSelector, useOneToOneContact, useLastConvInteraction } from '@berty/hooks'
import { selectChatInputText } from '@berty/redux/reducers/chatInputs.reducer'
import { selectChatInputIsSending } from '@berty/redux/reducers/chatInputsVolatile.reducer'
import { ParsedInteraction } from '@berty/utils/api'
import { pbDateToNum } from '@berty/utils/convert/time'

import { ConversationButton } from './ConversationButton'
import { ConversationDescStatus } from './ConversationDescStatus'
import { ConversationTitle } from './ConversationTitle'

const interactionsFilter = (inte: ParsedInteraction) =>
	inte.type === beapi.messenger.AppMessage.Type.TypeUserMessage ||
	inte.type === beapi.messenger.AppMessage.Type.TypeGroupInvitation

export const ConversationItem: React.FC<
	beapi.messenger.IConversation & { fake?: boolean; isLast: boolean }
> = React.memo(props => {
	const {
		fake = false,
		type = beapi.messenger.Conversation.Type.ContactType,
		unreadCount,
		createdDate,
		lastUpdate,
		isLast,
	} = props

	const publicKey = props.publicKey || ''
	const displayName = props.displayName || ''

	const { t } = useTranslation()

	const lastInte = useLastConvInteraction(publicKey, interactionsFilter)
	const displayDate = lastUpdate || createdDate ? pbDateToNum(lastUpdate || createdDate) : null

	const contact = useOneToOneContact(publicKey)
	const isAccepted = contact && contact.state === beapi.messenger.Contact.State.Accepted
	const isIncoming = contact && contact.state === beapi.messenger.Contact.State.IncomingRequest

	const { row, flex, margin } = useStyles()
	const chatInputText = useAppSelector(state => selectChatInputText(state, publicKey))
	const chatInputIsSending = useAppSelector(state => selectChatInputIsSending(state, publicKey))

	let description
	if (lastInte?.type === beapi.messenger.AppMessage.Type.TypeUserMessage) {
		description = lastInte.payload?.body
	} else if (lastInte?.type === beapi.messenger.AppMessage.Type.TypeGroupInvitation) {
		description = lastInte.isMine
			? 'You sent group invitation!'
			: 'You received new group invitation!'
	} else {
		if (contact?.state === beapi.messenger.Contact.State.OutgoingRequestSent) {
			description = t('main.home.conversations.request-sent')
		} else {
			description = ''
		}
	}

	const userDisplayName =
		type === beapi.messenger.Conversation.Type.MultiMemberType
			? displayName
			: contact?.displayName || ''

	if (chatInputIsSending) {
		description = t('chat.sending')
	} else if (chatInputText) {
		description = t('main.home.conversations.draft', {
			message: chatInputText,
		})
	}

	return !isIncoming ? (
		<ConversationButton publicKey={publicKey} isAccepted={isAccepted} type={type} isLast={isLast}>
			<View
				style={[
					row.item.center,
					flex.align.center,
					flex.justify.center,
					margin.right.small,
					styles.avatarWrapper,
				]}
			>
				<ConversationAvatar size={40} publicKey={publicKey} />
			</View>

			<View style={[flex.justify.spaceAround, styles.content]}>
				<ConversationTitle
					unreadCount={unreadCount ?? undefined}
					fake={fake}
					displayDate={displayDate}
					userDisplayName={userDisplayName}
				/>
				<ConversationDescStatus
					lastInte={lastInte}
					chatInputIsSending={chatInputIsSending}
					chatInputText={chatInputText}
					description={description ?? ''}
					unreadCount={unreadCount ?? undefined}
					isAccepted={isAccepted || type === beapi.messenger.Conversation.Type.MultiMemberType}
				/>
			</View>
		</ConversationButton>
	) : null
})

const styles = StyleSheet.create({
	avatarWrapper: {
		flexBasis: 45,
		flexGrow: 0,
		flexShrink: 0,
	},
	content: {
		flexBasis: 2,
		flexGrow: 2,
		flexShrink: 0,
	},
})
