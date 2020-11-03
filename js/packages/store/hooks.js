import { useContext, useMemo, useEffect, useCallback } from 'react'
import { useNavigation } from '@react-navigation/native'

import { messenger as messengerpb } from '@berty-tech/api/index.js'

import { MsgrContext, useMsgrContext } from './context'
import { fakeContacts, fakeMultiMemberConversations, fakeMessages } from './faker'
import { pbDateToNum } from '@berty-tech/components/helpers'
import { MessengerActions } from '@berty-tech/store/context'

export { useMsgrContext }

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

export const useSortedConversationList = () => {
	const convs = useConversationList()
	return useMemo(
		() =>
			convs.sort(
				(a, b) =>
					pbDateToNum(b.lastUpdate || b.createdDate) - pbDateToNum(a.lastUpdate || a.createdDate),
			),
		[convs],
	)
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
	return Object.values(intes).sort((a, b) => {
		return parseInt(a.sentDate, 10) - parseInt(b.sentDate, 10)
	})
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
	return ctx.persistentOptions || {}
}

export const useRestart = () => {
	const ctx = useMsgrContext()
	return useCallback(() => ctx.dispatch({ type: MessengerActions.Restart }), [ctx])
}

export const useDeleteAccount = () => {
	const ctx = useMsgrContext()
	return useCallback(() => ctx.dispatch({ type: MessengerActions.SetStateDeleting }), [ctx])
}

export const useSwitchToAccount = () => {
	const ctx = useMsgrContext()

	return useCallback(
		(accountID) => ctx.dispatch({ type: MessengerActions.SetNextAccount, payload: accountID }),
		[ctx],
	)
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
			type: MessengerActions.AddFakeData,
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
			type: MessengerActions.AddFakeData,
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
			type: MessengerActions.AddFakeData,
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
			type: MessengerActions.DeleteFakeData,
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

	const conv = useConversation(publicKey)
	const fake = (conv && conv.fake) || false

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

export const useMountEffect = (effect) => useEffect(effect, [])
