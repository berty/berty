import { useContext, useMemo, useEffect, useCallback } from 'react'
import { omitBy } from 'lodash'
import flatten from 'lodash/flatten'
import { useNavigation } from '@react-navigation/native'

import { messenger as messengerpb } from '@berty-tech/api/index.js'

import methods from './methods'
import { MsgrContext, useMsgrContext } from './context'
import {
	fakeContacts,
	fake1To1Conversations,
	fakeMultiMemberConversations,
	fakeMessages,
} from './faker'

const AppMessageType = messengerpb.AppMessage.Type

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
	const conversations = useSortedConversationList()

	if (!searchText) {
		return []
	}

	// map all messages to conversation ID

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

export const useClient = () => {
	const ctx = useMsgrContext()
	return ctx.client
}

export const useOneToOneContact = (convPk = '') => {
	const ctx = useMsgrContext()
	const conversation = ctx.conversations[convPk]
	try {
		return ctx.contacts[conversation.contactPublicKey]
	} catch (e) {
		return null
	}
}

export const useContact = (contactPk = '') => {
	const ctx = useMsgrContext()
	return ctx.contacts[contactPk] || null
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

export const useConversationList = () => {
	const ctx = useMsgrContext()
	return Object.values(ctx.conversations)
}

const sortByTimestamp = (key) => (a, b) => parseInt(a[key], 10) - parseInt(b[key], 10)
const reverseSortByTimestamp = (key) => (a, b) => parseInt(b[key], 10) - parseInt(a[key], 10)

export const useSortedConversationList = () => {
	const convs = useConversationList()
	return useMemo(() => convs.sort(reverseSortByTimestamp('lastUpdate')), [convs])
}

export const useConversation = (publicKey) => {
	const ctx = useMsgrContext()
	return ctx.conversations[publicKey]
}

export const useConvInteractions = (publicKey) => {
	const ctx = useMsgrContext()
	return ctx.interactions[publicKey] || {}
}

export const useSortedConvInteractions = (publicKey) => {
	const intes = useConvInteractions(publicKey)
	return Object.values(intes).sort(sortByTimestamp('sentDate'))
}

export const useInteraction = (cid, convPk) => {
	const intes = useConvInteractions(convPk)
	return intes && intes[cid]
}

export const useConversationLength = () => {
	return useConversationList().length
}

export const useConvMembers = (publicKey) => {
	const ctx = useMsgrContext()
	return ctx.members[publicKey] || {}
}

export const useConvMemberList = (publicKey) => {
	const members = useConvMembers()
	return Object.values(members)
}

export const usePersistentOptions = () => {
	const ctx = useMsgrContext()
	return ctx.persistentOptions
}

//
// Fake data generation
//

// Generate n fake conversations with n fake contacts, one UserMessage per conv
export const useGenerateFakeContacts = () => {
	const ctx = useMsgrContext()
	const prevFakeCount = Object.values(ctx.contacts).reduce((r, c) => (c.fake ? r + 1 : r), 0)
	return (length = 10) => {
		const payload = fakeContacts(length, prevFakeCount)
		ctx.dispatch({
			type: 'ADD_FAKE_DATA',
			payload,
		})
	}
}

export const useGenerateFakeMultiMembers = () => {
	const ctx = useMsgrContext()
	const prevFakeCount = Object.values(ctx.conversations).reduce(
		(r, c) => (c.fake && c.type === messengerpb.Conversation.Type.MultiMemberType ? r + 1 : r),
		0,
	)
	return (length = 10) => {
		const payload = fakeMultiMemberConversations(length, prevFakeCount)
		ctx.dispatch({
			type: 'ADD_FAKE_DATA',
			payload,
		})
	}
}

// Generate n fake messages for all fake conversations
export const useGenerateFakeMessages = () => {
	const ctx = useMsgrContext()
	const fakeConversationList = useConversationList().filter((c) => c.fake === true)
	const fakeMembersListList = fakeConversationList.map((conv) =>
		Object.values(ctx.members[conv.publicKey] || {}).filter((member) => member.fake),
	)
	console.log('fakeConvCount', fakeConversationList.length)
	const prevFakeCount = fakeConversationList.reduce(
		(r, fakeConv) =>
			Object.values(ctx.interactions[fakeConv.publicKey] || {}).reduce(
				(r2, inte) => (inte.fake ? r2 + 1 : r2),
				r,
			),
		0,
	)
	console.log('prevFakeCount', prevFakeCount)
	return (length = 10) => {
		ctx.dispatch({
			type: 'ADD_FAKE_DATA',
			payload: {
				interactions: fakeMessages(
					length,
					fakeConversationList,
					fakeMembersListList,
					prevFakeCount,
				),
			},
		})
	}
}

// Delete all fake data
export const useDeleteFakeData = () => {
	const ctx = useMsgrContext()
	return () =>
		ctx.dispatch({
			type: 'DELETE_FAKE_DATA',
		})
}

export const useLastConvInteraction = (convPublicKey, filterFunc) => {
	let intes = useSortedConvInteractions(convPublicKey)
	if (filterFunc) {
		intes = intes.filter(filterFunc)
	}
	if (intes.length <= 0) {
		return null
	}
	return intes[intes.length - 1]
}

export const useReadEffect = (publicKey, timeout) => {
	// timeout is the duration (in ms) that the user must stay on the page to set messages as read
	const navigation = useNavigation()

	const ctx = useMsgrContext()

	const fake = useConversation(publicKey)?.fake || false

	useEffect(() => {
		if (fake) {
			return
		}
		let timeoutID = null
		const handleStart = () => {
			if (timeoutID === null) {
				timeoutID = setTimeout(() => {
					timeoutID = null
					ctx.client.conversationOpen({ groupPk: publicKey }).catch((err) => {
						console.warn('failed to open conversation,', err)
					})
				}, timeout)
			}
		}
		handleStart()
		const unsubscribeFocus = navigation.addListener('focus', handleStart)
		const handleStop = () => {
			if (timeoutID !== null) {
				clearTimeout(timeoutID)
				timeoutID = null
			}
			ctx.client.conversationClose({ groupPk: publicKey }).catch((err) => {
				console.warn('failed to close conversation,', err)
			})
		}
		const unsubscribeBlur = navigation.addListener('blur', handleStop)
		return () => {
			unsubscribeFocus()
			unsubscribeBlur()
			handleStop()
		}
	}, [ctx.client, fake, navigation, publicKey, timeout])
}
