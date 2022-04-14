import { createContext, useContext } from 'react'
import { MessengerState } from './types'

export const initialState: MessengerState = {
	notificationsInhibitors: [],
	dispatch: () => {},
	restart: async () => {},
	addReaction: () => undefined,
	removeReaction: () => undefined,
}

export const MessengerContext = createContext<MessengerState>(initialState)

export const useMessengerContext = (): MessengerState => useContext(MessengerContext)
