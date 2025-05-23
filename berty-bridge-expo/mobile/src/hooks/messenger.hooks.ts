import { useEffect, useMemo } from 'react'

import beapi from '@berty/api'
import { useNavigation } from '@berty/navigation'
import * as m from '@berty/redux/reducers/messenger.reducer'
import { ParsedInteraction } from '@berty/utils/api'
import { Maybe } from '@berty/utils/type/maybe'

import { useAppSelector } from './core.hooks'
import { useMessengerClient } from './ui.hooks'

export const useAccount = () => {
	return useAppSelector(m.selectAccount)
}

export const useConversationInteractions = (convPk: string) => {
	return useAppSelector(state => m.selectConversationInteractions(state, convPk))
}

export const useConversationMembersDict = (convPk: string) => {
	return useAppSelector(state => m.selectConversationMembersDict(state, convPk))
}

export const useConversationMembers = (convPk: string) => {
	return useAppSelector(state => m.selectConversationMembers(state, convPk))
}

export const useConversationsDict = () => {
	return useAppSelector(m.selectConversationsDict)
}

export const useAllConversations = () => {
	return useAppSelector(m.selectAllConversations)
}

export const useConversation = (publicKey: string | null | undefined) => {
	return useAppSelector(state => m.selectConversation(state, publicKey || ''))
}

export const useOneToOneContact = (convPk: string) => {
	return useAppSelector(state => m.selectConversationContact(state, convPk))
}

export const useContactConversation = (contactPk: string) => {
	return useAppSelector(state => m.selectContactConversation(state, contactPk))
}

export const useContact = (contactPk: string | null | undefined) => {
	return useAppSelector(state => m.selectContact(state, contactPk || ''))
}

export const useContactsDict = () => {
	return useAppSelector(m.selectContactsDict)
}

export const useAllContacts = () => {
	return useAppSelector(m.selectAllContacts)
}

export const useMember = (
	conversationPublicKey: string | null | undefined,
	publicKey: string | null | undefined,
) => {
	return useAppSelector(state =>
		m.selectMember(state, conversationPublicKey || '', publicKey || ''),
	)
}

export const useIncomingContactRequests = () => {
	const contacts = useAllContacts()
	return useMemo(
		() => contacts.filter(c => c.state === beapi.messenger.Contact.State.IncomingRequest),
		[contacts],
	)
}

const emptyList: never[] = []

export const useAllInteractions = () => {
	const buckets = useAppSelector(m.selectAllInteractionsBuckets)
	return useMemo(
		() =>
			buckets.reduce(
				(all, bucket) => [...all, ...m.interactionsSelectors.selectAll(bucket.interactions)],
				emptyList as ParsedInteraction[],
			),
		[buckets],
	)
}

export const useContactSearchResults = (searchText: string | null | undefined) => {
	const contacts = useAllContacts()
	return useMemo(() => {
		if (!searchText) {
			return emptyList
		}
		return contacts.filter(contact =>
			contact.displayName?.toLowerCase().includes(searchText.toLowerCase()),
		)
	}, [searchText, contacts])
}

type InteractionFilter = Parameters<ReturnType<typeof useConversationInteractions>['find']>[0]

export const useLastConvInteraction = (
	convPublicKey: string | null | undefined,
	filterFunc?: InteractionFilter | null | undefined,
) => {
	const intes = useConversationInteractions(convPublicKey || '')
	return useMemo(() => {
		if (intes.length <= 0) {
			return
		}
		if (typeof filterFunc !== 'function') {
			return intes[0]
		}
		return intes.find(filterFunc)
	}, [intes, filterFunc])
}

export const useReadEffect = (publicKey: Maybe<string>, timeout: Maybe<number>) => {
	// timeout is the duration (in ms) that the user must stay on the page to set messages as read
	const navigation = useNavigation()

	const client = useMessengerClient()

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
					client?.conversationOpen({ groupPk: publicKey }).catch((err: unknown) => {
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
					(route.name === 'Chat.OneToOne' || route.name === 'Chat.MultiMember') &&
					(route.params as any)?.convId === publicKey
				) {
					return
				}
			}

			client?.conversationClose({ groupPk: publicKey }).catch((err: unknown) => {
				console.warn('failed to close conversation,', err)
			})
		}
		const unsubscribeBlur = navigation.addListener('blur', handleStop)
		return () => {
			unsubscribeFocus()
			unsubscribeBlur()
			handleStop()
		}
	}, [client, fake, navigation, publicKey, timeout])
}

/*

// FIXME: find how to convert selector type to hook type, here is some experiments:

type ObjectSelectorsKeys<T> = keyof T & `select${any}`

type SelectorToHook<T> = T extends `select${infer R}` ? `use${R}` : never

type Testi = ObjectSelectorsKeys<typeof m>

type Testo = SelectorToHook<Testi>

type ObjectSelectors<T> = Pick<T, keyof T & `select${any}`>

type ObjectSelectorsToHooks<T> = {[key in SelectorToHook<ObjectSelectorsKeys<T>>]: T[ObjectSelectorsKeys<T>]}

type Selectors = ObjectSelectors<typeof m>

type No = ObjectSelectorsToHooks<typeof m>

const getObjectSelectors = <T>(obj: T): ObjectSelectors<T> => {
  const keys = Object.keys(obj).filter(k => k.startsWith('select'))
  return keys.reduce((o, k) => ({...o, [k]: (obj as any)[k as any] }), {} as any)
}

const test = getObjectSelectors(m)

*/
