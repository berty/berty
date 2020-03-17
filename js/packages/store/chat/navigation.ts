import { createSlice } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'

export type GlobalState = {
	stack: string
}

export type Commands = {
	set: (state: GlobalState, action: { payload: GlobalState }) => GlobalState
}

export type Queries = {
	get: (state: GlobalState) => GlobalState
}

const initialState: GlobalState = {
	stack: '',
}

const commandHandler = createSlice<GlobalState, Commands>({
	name: 'navigation/command',
	initialState,
	reducers: {
		set: (state, { payload }) => {
			state.stack = payload.stack
			return state
		},
	},
})

export const reducer = composeReducers(commandHandler.reducer)
export const commands = commandHandler.actions
export const queries: Queries = {
	get: (state) => state,
}
