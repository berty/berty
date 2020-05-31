import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { all, put } from 'redux-saga/effects'
import { Notification, Type } from './types'
import { makeDefaultCommandsSagas } from '../utils'

const QUEUE_LENGTH = 50

export type State = Notification[]

export type GlobalState = {
	notifications: State
}

export namespace Command {
	export type Notify = Notification
}

export namespace Query {
	export type Get = { index: number }
	export type GetLength = void
}

export namespace Event {
	export type Notified = Notification
}

type SimpleCaseReducer<P> = CaseReducer<State, PayloadAction<P>>

export type CommandsReducer = {
	notify: SimpleCaseReducer<Command.Notify>
}

export type QueryReducer = {
	list: (state: GlobalState) => Array<Notification>
	get: (state: GlobalState, query: Query.Get) => Notification
	getLength: (state: GlobalState) => number
}

export type EventsReducer = {
	notified: SimpleCaseReducer<Event.Notified>
}

const initialState: State = [] as Notification[]

export type Transactions = {
	[K in keyof CommandsReducer]: CommandsReducer[K] extends SimpleCaseReducer<infer TPayload>
		? (payload: TPayload) => Generator
		: never
}

const commandHandler = createSlice<State, CommandsReducer>({
	name: 'notifications/command',
	initialState,
	reducers: {
		notify: (state: State) => state,
	},
})

const eventHandler = createSlice<State, EventsReducer>({
	name: 'notifications/event',
	initialState,
	reducers: {
		notified: (state: State, { payload: notif }) => {
			state.unshift(notif)
			if (state.length > QUEUE_LENGTH) {
				state.pop()
			}
			return state
		},
	},
})

export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)
export const reducers = { notifications: reducer }

export const commands = commandHandler.actions
export const events = eventHandler.actions
export const queries: QueryReducer = {
	list: (state) => Object.values(state.notifications),
	get: (state, { index }) => state.notifications[index],
	getLength: (state) => Object.keys(state.notifications).length,
}

export const transactions: Transactions = {
	notify: function* (notif) {
		yield put(events.notified(notif))
	},
}

export function* orchestrator() {
	yield all([...makeDefaultCommandsSagas(commands, transactions)])
}

export type { Notification }
export { Type }
