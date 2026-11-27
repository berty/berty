import React, { useCallback } from 'react'
import { useTranslation } from 'react-i18next'
import { Alert, StyleSheet, View } from 'react-native'

import beapi from '@berty/api'
import { ConversationAvatar } from '@berty/components/avatars'
import { useStyles } from '@berty/contexts/styles'
import { useAppSelector, useOneToOneContact, useLastConvInteraction } from '@berty/hooks'
import { selectChatInputText } from '@berty/redux/reducers/chatInputs.reducer'
import { selectChatInputIsSending } from '@berty/redux/reducers/chatInputsVolatile.reducer'
import { ParsedInteraction } from '@berty/utils/api'
import { hideConversation } from '@berty/utils/conversation/hiddenConversations'
import { pbDateToNum } from '@berty/utils/convert/time'

import { ConversationButton } from './ConversationButton'
import { ConversationDescStatus } from './ConversationDescStatus'
import { ConversationTitle } from './ConversationTitle'

const interactionsFilter = (inte: ParsedInteraction) =>
	inte.type === beapi.messenger.AppMessage.Type.TypeUserMessage ||
	inte.type === beapi.messenger.AppMessage.Type.TypeGroupInvitation

export const ConversationItem: React.FC<
	beapi.messenger.IConversation & { fake?: boolean; isLast: boolean }
> = React.memo(function ConversationItem(props) {
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

	// long press: hide the conversation from the list (nothing is deleted, it comes back
	// with the next message)
	const handleLongPress = useCallback(() => {
		if (fake) {
			return
		}
		Alert.alert(
			t('main.home.conversations.hide-title'),
			t('main.home.conversations.hide-desc'),
			[
				{ text: t('main.home.conversations.hide-cancel'), style: 'cancel' },
				{
					text: t('main.home.conversations.hide-confirm'),
					style: 'destructive',
					onPress: () => hideConversation({ publicKey, lastUpdate, createdDate }),
				},
			],
			{ cancelable: true },
		)
	}, [fake, t, publicKey, lastUpdate, createdDate])

	if (chatInputIsSending) {
		description = t('chat.sending')
	} else if (chatInputText) {
		description = t('main.home.conversations.draft', {
			message: chatInputText,
			interpolation: { escapeValue: false },
		})
	}

	return !isIncoming ? (
		<ConversationButton
			publicKey={publicKey}
			isAccepted={isAccepted}
			type={type}
			isLast={isLast}
			onLongPress={handleLongPress}
		>
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
