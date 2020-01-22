import { createSlice } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { all, takeLeading } from 'redux-saga/effects'

export type Entity = {
	name: string
	conversation: number
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
		member: State
	}
}

export namespace Command {
	export type Invite = void
	export type Remove = void
}

export namespace Query {
	export type List = {}
	export type Get = { id: string }
	export type GetLength = void
}

export namespace Event {
	export type Invited = { aggregateId: string; name: string }
	export type Removed = { aggregateId: string }
}

export type CommandsReducer = {
	invite: (state: State) => State
	remove: (state: State) => State
}

export type QueryReducer = {
	list: (state: GlobalState, query: Query.List) => Array<Entity>
	get: (state: GlobalState, query: Query.Get) => Entity
	getLength: (state: GlobalState) => number
}

export type EventsReducer = {
	invited: (state: State) => State
	removed: (state: State) => State
}

const initialState: State = {
	events: [],
	aggregates: {},
}

const commandHandler = createSlice<State, CommandsReducer>({
	name: 'chat/member/command',
	initialState,
	reducers: {
		invite: (state: State) => state,
		remove: (state: State) => state,
	},
})

const eventHandler = createSlice<State, EventsReducer>({
	name: 'chat/member/event',
	initialState,
	reducers: {
		invited: (state: State) => state,
		removed: (state: State) => state,
	},
})

export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)
export const commands = commandHandler.actions
export const events = eventHandler.actions
export const queries: QueryReducer = {
	list: (state) => Object.values(state.chat.member.aggregates),
	get: (state, { id }) => state.chat.member.aggregates[id],
	getLength: (state) => Object.keys(state.chat.member.aggregates).length,
}

export function* orchestrator() {
	yield all([
		takeLeading(commands.invite, function*() {
			// TODO: invite member
			// yield put(events.invited())
		}),
		takeLeading(commands.remove, function*() {
			// TODO: remove member
			// yield put(events.removed())
		}),
	])
}
