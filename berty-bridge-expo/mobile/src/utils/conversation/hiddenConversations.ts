import AsyncStorage from '@react-native-async-storage/async-storage'
import { useSyncExternalStore } from 'react'

import beapi from '@berty/api'
import { pbDateToNum } from '@berty/utils/convert/time'

// Conversations hidden from the chat list by the user (long press on a conversation).
// Nothing is deleted: the conversation and its messages stay in the account, and the
// conversation comes back in the list as soon as it is updated again (e.g. a new message).
// Stored on this device only: publicKey -> time of the last update of the conversation (ms)
// when it was hidden.

const STORAGE_KEY = 'hiddenConversations'

type HiddenConversations = { [publicKey: string]: number }

let hidden: HiddenConversations = {}
let loaded = false
const listeners = new Set<() => void>()

const emit = () => listeners.forEach(listener => listener())

const load = async () => {
	if (loaded) {
		return
	}
	loaded = true
	try {
		const raw = await AsyncStorage.getItem(STORAGE_KEY)
		const stored = raw ? JSON.parse(raw) : null
		if (stored && typeof stored === 'object') {
			// keep what was hidden while loading
			hidden = { ...stored, ...hidden }
			emit()
		}
	} catch (e) {
		console.warn('hiddenConversations: cannot load', e)
	}
}

const save = async () => {
	try {
		await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(hidden))
	} catch (e) {
		console.warn('hiddenConversations: cannot save', e)
	}
}

const subscribe = (listener: () => void) => {
	listeners.add(listener)
	load()
	return () => {
		listeners.delete(listener)
	}
}

const getSnapshot = () => hidden

// time of the last change of a conversation, in ms
export const conversationUpdateTime = (conv: beapi.messenger.IConversation): number =>
	pbDateToNum(conv.lastUpdate || conv.createdDate) || 0

export const hideConversation = (conv: beapi.messenger.IConversation) => {
	if (!conv.publicKey) {
		return
	}
	hidden = { ...hidden, [conv.publicKey]: conversationUpdateTime(conv) }
	emit()
	save()
}

export const useHiddenConversations = (): HiddenConversations =>
	useSyncExternalStore(subscribe, getSnapshot, getSnapshot)

// hidden, and not updated since it was hidden
export const isConversationHidden = (
	hiddenConversations: HiddenConversations,
	conv: beapi.messenger.IConversation,
): boolean => {
	const hiddenAt = conv.publicKey ? hiddenConversations[conv.publicKey] : undefined
	return hiddenAt !== undefined && conversationUpdateTime(conv) <= hiddenAt
}
