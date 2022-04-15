import { createContext, useContext } from 'react'
import { MessengerState } from './types'

export const initialState = {
	addNotificationListener: () => {},
	removeNotificationListener: () => {},
	notificationsInhibitors: [],
	daemonAddress: '',
	dispatch: () => {},
	setPersistentOption: async () => {},
	createNewAccount: async () => {},
	importAccount: async () => {},
	switchAccount: async () => {},
	updateAccount: async () => {},
	deleteAccount: async () => {},
	getUsername: async () => {
		return null
	},
	restart: async () => {},
	accounts: [],
	addReaction: () => undefined,
	removeReaction: () => undefined,
	networkConfig: {},
	setNetworkConfig: () => {},
	handledLink: false,
	setHandledLink: () => {},
}

export const MessengerContext = createContext<MessengerState>(initialState)

export const useMessengerContext = (): MessengerState => useContext(MessengerContext)
