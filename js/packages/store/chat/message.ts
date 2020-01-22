import { createSlice } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { put, all, takeLeading } from 'redux-saga/effects'

export type Entity = {
	body: string
	reactions: Array<{ member: number; emoji: string }>
	attachments: Array<{ uri: string }>
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
		message: State
	}
}

export namespace Command {
	export type Send = void
	export type Hide = void
}

export namespace Query {
	export type List = {}
	export type Get = { id: string }
	export type GetLength = void
}

export namespace Event {
	export type Sent = { aggregateId: string; name: string }
	export type Hidden = { aggregateId: string }
}

export type CommandsReducer = {
	send: (state: State) => State
	hide: (state: State) => State
}

export type QueryReducer = {
	list: (state: GlobalState, query: Query.List) => Array<Entity>
	get: (state: GlobalState, query: Query.Get) => Entity
	getLength: (state: GlobalState) => number
}

export type EventsReducer = {
	sent: (state: State) => State
	hidden: (state: State) => State
}

const initialState: State = {
	events: [],
	aggregates: {},
}

const commandHandler = createSlice<State, CommandsReducer>({
	name: 'chat/message/command',
	initialState,
	reducers: {
		send: (state: State) => state,
		hide: (state: State) => state,
	},
})

const eventHandler = createSlice<State, EventsReducer>({
	name: 'chat/message/event',
	initialState,
	reducers: {
		sent: (state: State) => state,
		hidden: (state: State) => state,
	},
})

export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)
export const commands = commandHandler.actions
export const events = eventHandler.actions
export const queries: QueryReducer = {
	list: (state) => Object.values(state.chat.message.aggregates),
	get: (state, { id }) => state.chat.message.aggregates[id],
	getLength: (state) => Object.keys(state.chat.message.aggregates).length,
}

export function* orchestrator() {
	yield all([
		takeLeading(commands.send, function*() {
			// TODO: send message
			// yield put(events.sent())
		}),
		takeLeading(commands.hide, function*() {
			// TODO: hide message
			// yield put(events.hidden())
		}),
	])
}
