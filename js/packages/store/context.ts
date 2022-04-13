import { createContext, useContext } from 'react'
import { MessengerState } from './types'

export const initialState = {
	streamError: null,
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
	playSound: () => {},
	accounts: [],
	addReaction: () => undefined,
	removeReaction: () => undefined,
	networkConfig: {},
	setNetworkConfig: () => {},
	handledLink: false,
	setHandledLink: () => {},
}

export const MessengerContext = createContext<MessengerState>(initialState)

export default MessengerContext

export const useMessengerContext = (): MessengerState => useContext(MessengerContext)
