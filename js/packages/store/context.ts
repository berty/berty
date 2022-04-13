import { createContext, useContext } from 'react'
import { MessengerState } from './types'

export const initialState: MessengerState = {
	addNotificationListener: () => {},
	removeNotificationListener: () => {},
	notificationsInhibitors: [],
	daemonAddress: '',
	dispatch: () => {},
	getUsername: async () => {
		return null
	},
	restart: async () => {},
	addReaction: () => undefined,
	removeReaction: () => undefined,
	handledLink: false,
	setHandledLink: () => {},
}

export const MessengerContext = createContext<MessengerState>(initialState)

export const useMessengerContext = (): MessengerState => useContext(MessengerContext)
