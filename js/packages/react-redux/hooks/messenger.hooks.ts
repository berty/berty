import * as m from '@berty-tech/redux/reducers/messenger.reducer'

import { useAppSelector } from '../core'

export const useAccount = () => {
	return useAppSelector(m.selectAccount)
}

export const useConversationInteractions = (convPk: string) => {
	return useAppSelector(state => m.selectConversationInteractions(state, convPk))
}

export const useAllInteractions = () => {
	return useAppSelector(m.selectAllInteractions)
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
