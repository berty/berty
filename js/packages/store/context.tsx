import React from 'react'

type MsgrState = {
	account: any
	conversations: { [key: string]: any }
	contacts: { [key: string]: any }
	interactions: { [key: string]: { [key: string]: any } }
	members: { [key: string]: any }
	client: any
	listDone: boolean
	streamError: any
	addNotificationListener: (cb: (evt: any) => void) => void
	removeNotificationListener: (cb: (...args: any[]) => void) => void
}

export const initialState = {
	account: null,
	conversations: {},
	contacts: {},
	interactions: {},
	members: {},
	client: null,
	listDone: false,
	streamError: null,
	addNotificationListener: () => {},
	removeNotificationListener: () => {},
}

export const MsgrContext = React.createContext<MsgrState>(initialState)

export default MsgrContext

export const useMsgrContext = () => React.useContext(MsgrContext)
