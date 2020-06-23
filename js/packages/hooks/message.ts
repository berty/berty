/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { messenger } from '@berty-tech/store'
import { useGetConversation, useConversationList } from './conversation'
import { Entity as ConversationEntity } from '@berty-tech/store/messenger/conversation'
import { flatten } from 'lodash'
import { UserMessage } from '@berty-tech/store/messenger'

// messages commands
export const useMessageSend = () => {
	const dispatch = useDispatch()
	return useMemo(
		() => (payload: messenger.message.Command.Send) =>
			dispatch(messenger.message.commands.send(payload)),
		[dispatch],
	)
}

export const useMessageSendToAll = () => {
	const dispatch = useDispatch()
	return useMemo(() => () => dispatch(messenger.message.commands.sendToAll()), [dispatch])
}

export const useMessageHide = () => {
	const dispatch = useDispatch()
	return useMemo(() => () => dispatch(messenger.message.commands.hide()), [dispatch])
}

export const useMessageDelete = () => {
	const dispatch = useDispatch()
	return useMemo(
		() => (payload: messenger.message.Command.Delete) =>
			dispatch(messenger.message.commands.delete(payload)),
		[dispatch],
	)
}
// messages queries
export const useGetMessage = (id: string): messenger.message.Entity | undefined => {
	const selector = useMemo(
		() => (state: messenger.message.GlobalState) => messenger.message.queries.get(state, { id }),
		[id],
	)
	const message = useSelector(selector)
	return message
}

export const useGetListMessage = (list: any): messenger.message.Entity[] => {
	const selector = useMemo(
		() => (state: messenger.message.GlobalState) =>
			messenger.message.queries.getList(state, { list }),
		[list],
	)
	const messages = useSelector(selector)
	return messages
}

export const useGetDateLastContactMessage = (id: string) => {
	const conversation = useGetConversation(id)
	const messages = useGetListMessage(conversation?.messages)
	if (!(conversation && messages)) {
		return null
	}
	let lastDate
	conversation.kind !== 'fake' &&
		messages.length &&
		messages.map((message) => {
			if (message && message.type === messenger.AppMessageType.UserMessage && !message.isMe) {
				lastDate = message.receivedDate
			}
		})
	return lastDate || null
}

// search hooks

export type MessageSearchMatch = {
	conversationId: string
	id: messenger.message.Entity['id'] // need for react unique key for .map
	message: messenger.UserMessage // TODO: Probably just need sentDate and body, not entire message
	conversationTitle?: string
	messageIndex?: number
}

// TODO: Optimize

// TODO: (Maybe) Add to UserMessage `conversation: messenger.conversation.Entity['id'] instead...
// Also might have been smarter to search all messages first,
//     then search for corresponding conversations
// Also caching of some kind
// Also return in batches
export const useGetMessageSearchResultWithMetadata = (searchText: string): MessageSearchMatch[] => {
	// map all messages to conversation ID
	const messagesWithConv = useSelector((state: messenger.conversation.GlobalState) => {
		const conversations = messenger.conversation.queries.listHuman(state)

		if (conversations.length > 30) {
			console.warn(
				'useGetMessageSearchResultWithMetadata: You have more than 30 conversations, this might take a while...',
			)
		}
		const mapMessageToConv = (conv: messenger.conversation.Entity) => (
			id: string,
			messageIndex: number,
		) => ({
			conversationId: conv.id,
			id,
			conversationTitle: conv.title,
			messageIndex,
		})

		return flatten(conversations.map((conv) => conv.messages.map(mapMessageToConv(conv))))
	})

	if (messagesWithConv.length > 200) {
		console.warn(
			'useGetMessageSearchResultWithMetadata: You have more than 200 messages, this might take a while...',
		)
	}

	// search messages for search match
	const messageIdsForConversationsWithMatch = useSelector(
		(state: messenger.message.GlobalState): MessageSearchMatch[] => {
			return messagesWithConv
				.map(({ conversationId, conversationTitle, messageIndex, id }) => ({
					id,
					conversationId,
					conversationTitle,
					messageIndex,
					message: messenger.message.queries.searchOne(state, {
						searchText,
						id,
					}) as UserMessage,
				}))
				.filter(({ message }) => !!message && message.type === messenger.AppMessageType.UserMessage)
				.sort(
					({ message: { sentDate: sentDateA } }, { message: { sentDate: sentDateB } }) =>
						sentDateB - sentDateA,
				)
		},
	)
	return !searchText ? [] : messageIdsForConversationsWithMatch
}
