import { createSlice } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { put, all, takeLeading } from 'redux-saga/effects'

import * as member from './member'

export type Entity = {
	name: string
	account: number
	members: Array<number>
	messages: Array<number>
}

export type Event = {
	id: string
	version: number
	aggregateId: string
}

export type State = {
	events: Array<Event>
	aggregates: { [key: string]: Entity }
}

export type GlobalState = {
	chat: {
		conversation: State
	}
}

export namespace Command {
	export type Create = void
	export type Delete = void
}

export namespace Query {
	export type List = {}
	export type Get = { id: string }
	export type GetLength = void
}

export namespace Event {
	export type Created = { aggregateId: string; name: string }
	export type Deleted = { aggregateId: string }
}

export type CommandsReducer = {
	create: (state: State) => State
	delete: (state: State) => State
}

export type QueryReducer = {
	list: (state: GlobalState, query: Query.List) => Array<Entity>
	get: (state: GlobalState, query: Query.Get) => Entity
	getLength: (state: GlobalState) => number
}

export type EventsReducer = {
	created: (state: State) => State
	deleted: (state: State) => State
}

const initialState: State = {
	events: [],
	aggregates: {},
}

const commandHandler = createSlice<State, CommandsReducer>({
	name: 'chat/conversation/command',
	initialState,
	reducers: {
		create: (state: State) => state,
		delete: (state: State) => state,
	},
})

const eventHandler = createSlice<State, EventsReducer>({
	name: 'chat/conversation/event',
	initialState,
	reducers: {
		created: (state: State) => state,
		deleted: (state: State) => state,
	},
})

export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)
export const commands = commandHandler.actions
export const events = eventHandler.actions
export const queries: QueryReducer = {
	list: (state) => Object.values(state.chat.conversation.aggregates),
	get: (state, { id }) => state.chat.conversation.aggregates[id],
	getLength: (state) => Object.keys(state.chat.conversation.aggregates).length,
}

export function* orchestrator() {
	yield all([
		takeLeading(commands.create, function*() {
			// TODO: create conversation
			// yield put(events.created())
		}),
		takeLeading(commands.delete, function*() {
			// TODO: delete conversation
			// yield put(events.deleted())
		}),
	])
}
