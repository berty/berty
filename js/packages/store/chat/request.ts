import { createSlice } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { put, all, takeLeading } from 'redux-saga/effects'

import * as conversation from './conversation'
import * as contact from './contact'

export type Entity = {
	kind: conversation.Entity | contact.Entity
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
		request: State
	}
}

export namespace Command {
	export type Send = void
	export type Accept = void
	export type refuse = void
}

export namespace Query {
	export type List = {}
	export type Get = { id: string }
	export type GetLength = void
}

export namespace Event {
	export type Sent = { aggregateId: string; name: string }
	export type Accepted = { aggregateId: string }
	export type refuse = { aggregateId: string }
}

export type CommandsReducer = {
	send: (state: State) => State
	accept: (state: State) => State
	refuse: (state: State) => State
}

export type QueryReducer = {
	list: (state: GlobalState, query: Query.List) => Array<Entity>
	get: (state: GlobalState, query: Query.Get) => Entity
	getLength: (state: GlobalState) => number
}

export type EventsReducer = {
	sent: (state: State) => State
	accepted: (state: State) => State
	refused: (state: State) => State
}

const initialState: State = {
	events: [],
	aggregates: {},
}

const commandHandler = createSlice<State, CommandsReducer>({
	name: 'chat/request/command',
	initialState,
	reducers: {
		send: (state: State) => state,
		accept: (state: State) => state,
		refuse: (state: State) => state,
	},
})

const eventHandler = createSlice<State, EventsReducer>({
	name: 'chat/request/event',
	initialState,
	reducers: {
		sent: (state: State) => state,
		accepted: (state: State) => state,
		refused: (state: State) => state,
	},
})

export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)
export const commands = commandHandler.actions
export const events = eventHandler.actions
export const queries: QueryReducer = {
	list: (state) => Object.values(state.chat.request.aggregates),
	get: (state, { id }) => state.chat.request.aggregates[id],
	getLength: (state) => Object.keys(state.chat.request.aggregates).length,
}

export function* orchestrator() {
	yield all([
		takeLeading(commands.send, function*() {
			// TODO: send request
			// yield put(events.sent())
		}),
		takeLeading(commands.accept, function*() {
			// TODO: accept request
			// yield put(events.accepted())
		}),
		takeLeading(commands.refuse, function*() {
			// TODO: refuse request
			// yield put(events.refuseed())
		}),
	])
}
