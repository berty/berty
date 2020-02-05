import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { all, select, put, takeLeading } from 'redux-saga/effects'

export type Entity = {
	id: string
	name: string
	conversation: string
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
	export type Create = { name: string; members: Array<number> }
	export type Invite = void
	export type Remove = void
}

export namespace Query {
	export type List = {}
	export type Get = { id: string }
	export type GetLength = void
}

export namespace Event {
	export type Created = { aggregateId: string; name: string }
	export type Invited = { aggregateId: string; name: string }
	export type Removed = { aggregateId: string }
}

type SimpleCaseReducer<P> = CaseReducer<State, PayloadAction<P>>

export type CommandsReducer = {
	create: SimpleCaseReducer<Command.Create>
	invite: SimpleCaseReducer<Command.Invite>
	remove: SimpleCaseReducer<Command.Remove>
}

export type QueryReducer = {
	list: (state: GlobalState, query: Query.List) => Array<Entity>
	get: (state: GlobalState, query: Query.Get) => Entity
	getLength: (state: GlobalState) => number
}

export type EventsReducer = {
	created: SimpleCaseReducer<Event.Created>
	invited: SimpleCaseReducer<Event.Invited>
	removed: SimpleCaseReducer<Event.Removed>
}

const initialState: State = {
	events: [],
	aggregates: {},
}

export type Transactions = {
	[K in keyof CommandsReducer]: CommandsReducer[K] extends SimpleCaseReducer<infer TPayload>
		? (payload: TPayload) => Generator
		: never
}

const commandHandler = createSlice<State, CommandsReducer>({
	name: 'chat/member/command',
	initialState,
	reducers: {
		create: (state: State) => state,
		invite: (state: State) => state,
		remove: (state: State) => state,
	},
})

const eventHandler = createSlice<State, EventsReducer>({
	name: 'chat/member/event',
	initialState,
	reducers: {
		created: (state: State) => state,
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

export const transactions: Transactions = {
	create: function*() {
		// TODO: create multiMemberGroup
	},
	invite: function*() {
		// TODO: create invitation for multiMemberGrouo
	},
	remove: function*() {
		// TODO: remove multiMemberGroup
	},
}

export function* orchestrator() {
	yield all([
		takeLeading(commands.create, function*(action) {
			yield* transactions.create(action.payload)
		}),
		takeLeading(commands.invite, function*(action) {
			yield* transactions.invite(action.payload)
		}),
		takeLeading(commands.remove, function*(action) {
			yield* transactions.remove(action.payload)
		}),
	])
}
