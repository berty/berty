import * as m from '@berty/redux/reducers/messenger.reducer'
import { useMemo } from 'react'
import beapi from '@berty/api'
import { ParsedInteraction } from '@berty/store'

import { useAppSelector } from './core'

export const useAccount = () => {
	return useAppSelector(m.selectAccount)
}

export const useConversationInteractions = (convPk: string) => {
	return useAppSelector(state => m.selectConversationInteractions(state, convPk))
}

export const useConversationMembersDict = (convPk: string) => {
	return useAppSelector(state => m.selectConversationMembersDict(state, convPk))
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

export const useMedias = (cids: string[]) => {
	return useAppSelector(state => m.selectMedias(state, cids))
}

export const useMedia = (cid: string) => {
	return useAppSelector(state => m.selectMedia(state, cid))
}

export const useInteractionAuthor = (convPk: string, cid: string) => {
	return useAppSelector(state => m.selectInteractionAuthor(state, convPk, cid))
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
