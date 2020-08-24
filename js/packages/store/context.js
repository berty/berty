import React from 'react'

export const initialState = {
	account: null,
	conversations: {},
	contacts: {},
	interactions: {},
	client: null,
	listDone: false,
	streamError: null,
}

export const MsgrContext = React.createContext(initialState)

export default MsgrContext

export const useMsgrContext = () => React.useContext(MsgrContext)
