import React from 'react'
import { berty } from '@berty-tech/api'

export type MsgrState = {
	account: any
	conversations: { [key: string]: any }
	contacts: { [key: string]: any }
	interactions: { [key: string]: { [key: string]: any } }
	members: { [key: string]: any }
	client: berty.messenger.v1.MessengerService
	listDone: boolean
	streamError: any
	addNotificationListener: (cb: (evt: any) => void) => void
	removeNotificationListener: (cb: (...args: any[]) => void) => void
	persistentOptions: any
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
	persistentOptions: {},
}

export const MsgrContext = React.createContext<MsgrState>(initialState)

export default MsgrContext

export const useMsgrContext = (): MsgrState => React.useContext(MsgrContext)
