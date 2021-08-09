import { EffectCallback, useContext, useEffect, useMemo } from 'react'
import { useNavigation } from '@react-navigation/native'

import beapi from '@berty-tech/api'
import { pbDateToNum } from '@berty-tech/components/helpers'
import { Routes } from '@berty-tech/navigation'
import colors from '@berty-tech/styles/colors.json'

import {
	MessengerActions,
	MessengerAppState,
	MsgrContext,
	NotificationsInhibitor,
	useMsgrContext,
} from './context'
import { fakeContacts, fakeMessages, fakeMultiMemberConversations } from './faker'
import { ParsedInteraction } from './types.gen'

export { useMsgrContext }

export type Maybe<T> = T | null | undefined

export const useGetMessage = (id: Maybe<string>, convId: Maybe<string>) => {
	const ctx = useContext(MsgrContext)
	const intes = ctx.interactions[convId as string]
	if (!intes) {
		return undefined
	}
	return intes.find((i) => i.cid === id)
}

export const useFirstConversationWithContact = (contactPk: Maybe<string>) => {
	const ctx = useContext(MsgrContext)
	const conversations = ctx.conversations
	const contact = ctx.contacts[contactPk as string]
	if (!contact) {
		return undefined
	}
	return conversations[contact.conversationPublicKey as string]
}

export const useAccount = () => {
	const ctx = useMsgrContext()
	return ctx.account
}

export const useClient = () => {
	const ctx = useMsgrContext()
	return ctx.client
}

export const useOneToOneContact = (convPk: Maybe<string>) => {
	const conv = useConversation(convPk)
	return useContact(conv?.contactPublicKey)
}

export const useContact = (contactPk: Maybe<string>) => {
	const ctx = useMsgrContext()
	if (!contactPk) {
		return undefined
	}
	return ctx.contacts[contactPk]
}

export const useContacts = () => {
	const ctx = useMsgrContext()
	return ctx.contacts
}

export const useContactList = () => {
	const contacts = useContacts()
	return Object.values(contacts) as beapi.messenger.IContact[]
}

const ContactState = beapi.messenger.Contact.State

export const useIncomingContactRequests = () => {
	const contacts = useContactList()
	return useMemo(() => contacts.filter((c) => c.state === ContactState.IncomingRequest), [contacts])
}

export const useOutgoingContactRequests = () => {
	const contacts = useContactList()
	return useMemo(
		() =>
			contacts.filter(
				(c) =>
					c.state &&
					[ContactState.OutgoingRequestEnqueued, ContactState.OutgoingRequestSent].includes(
						c.state,
					),
			),
		[contacts],
	)
}

export const useAccountContactSearchResults = (searchText: Maybe<string>) => {
	const contacts = useContactList()
	if (!searchText) {
		return []
	}
	return contacts.filter((contact) =>
		contact.displayName?.toLowerCase().includes(searchText.toLowerCase()),
	)
}

export const useConversationList = () => {
	const ctx = useMsgrContext()
	return Object.values(ctx.conversations) as beapi.messenger.IConversation[]
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

export const useConversation = (publicKey: Maybe<string>) => {
	const ctx = useMsgrContext()
	if (!publicKey) {
		return undefined
	}
	return ctx.conversations[publicKey]
}

export const useConvInteractions = (publicKey: Maybe<string>) => {
	const { interactions } = useMsgrContext()
	return interactions[publicKey as string] || []
}

export const useConversationsCount = () => {
	return useConversationList().length
}

export const useConvMembers = (publicKey: Maybe<string>) => {
	const ctx = useMsgrContext()
	return ctx.members[publicKey as string] || {}
}

export const useMember = <
	T extends { publicKey: Maybe<string>; conversationPublicKey: Maybe<string> },
>(
	props: T,
) => {
	const { publicKey, conversationPublicKey } = props
	const members = useConvMembers(conversationPublicKey)
	return members[publicKey as string]
}

export const useConvMemberList = (publicKey: Maybe<string>) => {
	const members = useConvMembers(publicKey)
	return Object.values(members) as beapi.messenger.IMember[]
}

export const usePersistentOptions = () => {
	const ctx = useMsgrContext()
	return ctx.persistentOptions || {}
}

export const useThemeColor = () => {
	const ctx = useMsgrContext()
	let collectionColors = {}
	Object.entries(ctx.persistentOptions?.themeColor.collection).map((value) => {
		if (value[0] === ctx.persistentOptions?.themeColor.selected) {
			collectionColors = value[1]?.colors
		}
	})
	return Object.entries(ctx.persistentOptions?.themeColor.collection).length &&
		ctx.appState !== MessengerAppState.OnBoarding &&
		ctx.appState !== MessengerAppState.GetStarted
		? collectionColors
		: colors
}

//
// Fake data generation
//

// Generate n fake conversations with n fake contacts, one UserMessage per conv
export const useGenerateFakeContacts = () => {
	const ctx = useMsgrContext()
	const prevFakeCount: number = Object.values(ctx.contacts).reduce(
		(r, c) => ((c as any).fake ? r + 1 : r),
		0,
	)
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
		(r, c) =>
			(c as any).fake && c?.type === beapi.messenger.Conversation.Type.MultiMemberType ? r + 1 : r,
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
	const fakeConversationList = useConversationList().filter((c) => (c as any).fake === true)
	const fakeMembersListList = fakeConversationList.map((conv) =>
		Object.values(ctx.members[conv.publicKey || ''] || {}).filter((member: any) => member.fake),
	)
	const prevFakeCount: number = fakeConversationList.reduce(
		(r, fakeConv) =>
			Object.values(ctx.interactions[fakeConv.publicKey || ''] || {}).reduce(
				(r2, inte) => ((inte as any).fake ? r2 + 1 : r2),
				r,
			),
		0,
	)
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

export type SortedConvsFilter = Parameters<ReturnType<typeof useConvInteractions>['filter']>[0]

export const useLastConvInteraction = (
	convPublicKey: Maybe<string>,
	filterFunc?: Maybe<SortedConvsFilter>,
) => {
	let intes = useConvInteractions(convPublicKey)

	if (intes.length <= 0) {
		return null
	}

	if (!filterFunc) {
		return intes[0]
	}

	return intes.find(filterFunc) || null
}

const useDispatch = () => {
	const ctx = useMsgrContext()
	return ctx.dispatch
}

export const useNotificationsInhibitor = (inhibitor: Maybe<NotificationsInhibitor>) => {
	const dispatch = useDispatch()
	const navigation = useNavigation()
	useMountEffect(() => {
		if (!inhibitor) {
			return
		}

		const inhibit = () =>
			dispatch({ type: MessengerActions.AddNotificationInhibitor, payload: { inhibitor } })
		const revert = () =>
			dispatch({ type: MessengerActions.RemoveNotificationInhibitor, payload: { inhibitor } })

		const unsubscribeBlur = navigation.addListener('blur', revert)
		const unsubscribeFocus = navigation.addListener('focus', inhibit)

		inhibit()

		return () => {
			unsubscribeFocus()
			unsubscribeBlur()
			revert()
		}
	})
}

export const useReadEffect = (publicKey: Maybe<string>, timeout: Maybe<number>) => {
	// timeout is the duration (in ms) that the user must stay on the page to set messages as read
	const navigation = useNavigation()

	const ctx = useMsgrContext()

	const conv = useConversation(publicKey)
	const fake = (conv && (conv as any).fake) || false

	useEffect(() => {
		if (fake) {
			return
		}
		let timeoutID: ReturnType<typeof setTimeout> | null = null
		const handleStart = () => {
			if (timeoutID === null) {
				let t = timeout
				if (typeof t !== 'number') {
					t = 1000
				}
				timeoutID = setTimeout(() => {
					timeoutID = null
					ctx.client?.conversationOpen({ groupPk: publicKey }).catch((err: unknown) => {
						console.warn('failed to open conversation,', err)
					})
				}, t)
			}
		}
		handleStart()
		const unsubscribeFocus = navigation.addListener('focus', handleStart)
		const handleStop = () => {
			if (timeoutID !== null) {
				clearTimeout(timeoutID)
				timeoutID = null
			}

			// Not marking a conversation as closed if still in the navigation stack
			const { routes } = navigation.getState()
			for (let route of routes) {
				if (
					(route.name === Routes.Chat.OneToOne || route.name === Routes.Chat.Group) &&
					route.params?.convId === publicKey
				) {
					return
				}
			}

			ctx.client?.conversationClose({ groupPk: publicKey }).catch((err: unknown) => {
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

// eslint-disable-next-line react-hooks/exhaustive-deps
export const useMountEffect = (effect: EffectCallback) => useEffect(effect, [])

export const fetchMore = ({
	setFetchingFrom,
	setFetchedFirst,
	fetchingFrom,
	fetchedFirst,
	oldestMessage,
	client,
	convPk,
}: {
	setFetchingFrom: (value: string | null) => void
	setFetchedFirst: (value: boolean) => void
	fetchingFrom: string | null
	fetchedFirst: boolean
	oldestMessage?: ParsedInteraction
	client: any
	convPk: string
}) => {
	if (fetchingFrom !== null || fetchedFirst) {
		return
	}

	let refCid: string | undefined
	if (oldestMessage) {
		refCid = oldestMessage.cid!
	}

	setFetchingFrom(refCid || '')

	client
		?.conversationLoad({
			options: {
				amount: 30,
				conversationPk: convPk,
				refCid: refCid,
			},
		})
		.catch(() => setFetchedFirst(true))
}
