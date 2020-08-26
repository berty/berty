import React, { useContext, useMemo } from 'react'
import { MsgrContext, useMsgrContext } from './context'
import flatten from 'lodash/flatten'
import { messenger as messengerpb } from '@berty-tech/api/index.js'
import { fakeContacts, fakeConversations, fakeMessages } from '@berty-tech/components/faker'
import { omitBy } from 'lodash'

const AppMessageType = messengerpb.AppMessage.Type

const listHuman = (state) => {
	return Object.values(state.conversations)
}

export { useMsgrContext }

const searchOne = (state, { searchText, convId, id }) => {
	const intes = state.interactions[convId]
	if (!intes) {
		return undefined
	}
	const inte = intes[id]
	return inte &&
		inte.type === AppMessageType.TypeUserMessage &&
		inte.payload.body &&
		inte.payload.body.toLowerCase().includes(searchText.toLowerCase())
		? inte
		: undefined
}

const messageToConvMapper = (conv) => (inte, messageIndex) => ({
	conversationId: conv.publicKey,
	id: inte.cid,
	conversationTitle: conv.displayName,
	messageIndex,
	interaction: inte,
})

export const useGetMessageSearchResultWithMetadata = (searchText) => {
	const ctx = useContext(MsgrContext)

	if (!searchText) {
		return []
	}

	// map all messages to conversation ID

	const conversations = listHuman(ctx)

	if (conversations.length > 30) {
		console.warn(
			'useGetMessageSearchResultWithMetadata: You have more than 30 conversations, this might take a while...',
		)
	}

	const messagesWithConv = flatten(
		conversations.map((conv) =>
			Object.values(ctx.interactions[conv.publicKey] || {}).map(messageToConvMapper(conv)),
		),
	)

	if (messagesWithConv.length > 200) {
		console.warn(
			'useGetMessageSearchResultWithMetadata: You have more than 200 messages, this might take a while...',
		)
	}

	// search messages for search match
	const messageIdsForConversationsWithMatch = messagesWithConv
		.map(({ conversationId, conversationTitle, messageIndex, id }) => ({
			id,
			conversationId,
			conversationTitle,
			messageIndex,
			message: searchOne(ctx, { searchText, convId: conversationId, id }),
		}))
		.filter(({ message }) => !!message && message.type === AppMessageType.TypeUserMessage)
		.sort(
			({ message: { sentDate: sentDateA } }, { message: { sentDate: sentDateB } }) =>
				sentDateB - sentDateA,
		)

	return messageIdsForConversationsWithMatch
}

export const useGetMessage = (id, convId) => {
	const ctx = useContext(MsgrContext)
	const intes = ctx.interactions[convId]
	if (!intes) {
		return undefined
	}
	return intes[id]
}

export const useAccountContactSearchResults = (searchText) => {
	const ctx = useContext(MsgrContext)
	if (!searchText) {
		return []
	}
	return Object.values(ctx.contacts).filter((contact) =>
		contact.displayName.toLowerCase().includes(searchText.toLowerCase()),
	)
}

export const useFirstConversationWithContact = (contactPk) => {
	const ctx = useContext(MsgrContext)
	const conversations = ctx.conversations
	const contact = ctx.contacts[contactPk]
	if (!contact) {
		return undefined
	}
	return conversations[contact.conversationPublicKey]
}

export const useAccount = () => {
	const ctx = useMsgrContext()
	return ctx.account
}

export const useContacts = () => {
	const ctx = useMsgrContext()
	return ctx.contacts
}

export const useContactsList = () => {
	const contacts = useContacts()
	return Object.values(contacts)
}

const ContactState = messengerpb.Contact.State

export const useIncomingContactRequests = () => {
	const contacts = useContactsList()
	return useMemo(() => contacts.filter((c) => c.state === ContactState.IncomingRequest), [contacts])
}

export const useOutgoingContactRequests = () => {
	const contacts = useContactsList()
	return useMemo(
		() =>
			contacts.filter((c) =>
				[ContactState.OutgoingRequestEnqueued, ContactState.OutgoingRequestSent].includes(c.state),
			),
		[contacts],
	)
}

// TODO: See how to use 1-1's already generated in event stream
export const useConversationList = () => {
	const ctx = useMsgrContext()

	const oneToOneConversations = [
		...Object.values(ctx.contacts)
			.filter((c) => c.state === messengerpb.Contact.State.Established)
			.filter((c) => !ctx.conversations[c.conversationPublicKey])
			.map((c) => ({
				publicKey: c.conversationPublicKey,
				displayName: c.displayName,
				kind: '1to1',
			})),
	]
	const conversationList = [
		...Object.values(ctx.conversations).map((c) => ({ ...c, kind: 'multi' })),
		...Object.values(oneToOneConversations),
	]
	return conversationList
}

export const useConversationLength = () => {
	const ctx = useMsgrContext()
	return (
		Object.values(ctx.conversations).length +
		Object.values(ctx.contacts).filter((c) => c.state === messengerpb.Contact.State.Established)
			.length
	)
}

//
// Fake data generation
//

let globalFakeLengthModifier = 0

// Generate n fake conversations with n fake contacts, one UserMessage per conv
export const useGenerateFakeConversations = () => {
	const ctx = useMsgrContext()

	return (length = 10) => {
		globalFakeLengthModifier += length
		const contacts = fakeContacts(length, globalFakeLengthModifier)
		const conversations = fakeConversations(contacts)
		ctx.dispatch({
			type: 'ADD_FAKE_CONVERSATIONS',
			payload: {
				conversations,
				contacts,
			},
		})
	}
}

// Generate n fake messages for all fake conversations
export const useGenerateFakeMessages = () => {
	const ctx = useMsgrContext()
	const fakeConversationList = useConversationList().filter((c) => c.fake === true)

	return (length = 10) => {
		globalFakeLengthModifier += length * fakeConversationList.length
		const interactions = fakeMessages(length, fakeConversationList, globalFakeLengthModifier)
		ctx.dispatch({
			type: 'ADD_FAKE_MESSAGES',
			payload: {
				interactions,
			},
		})
	}
}

// Delete all fake conversations
export const useDeleteFakeData = () => {
	const ctx = useMsgrContext()
	globalFakeLengthModifier = 0
	return () =>
		ctx.dispatch({
			type: 'DELETE_FAKE_DATA',
			payload: {
				conversations: omitBy(ctx.conversations, (c) => c.fake === true),
				contacts: omitBy(ctx.contacts, (c) => c.fake === true),
				interactions: omitBy(ctx.interactions, (msg) => msg.fake === true),
			},
		})
}
