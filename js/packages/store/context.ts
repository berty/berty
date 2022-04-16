import { createContext, useContext } from 'react'
import { MessengerState } from './types'

const initialState: MessengerState = {
	restart: async () => {},
}

export const MessengerContext = createContext<MessengerState>(initialState)

export const useMessengerContext = (): MessengerState => useContext(MessengerContext)
