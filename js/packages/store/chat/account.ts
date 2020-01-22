import { createSlice } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { put, all, take, takeLeading, fork, select } from 'redux-saga/effects'
import faker from 'faker'

import * as protocol from '../protocol'

export type Entity = {
	id: number
	name: string
	requests: Array<number>
	conversations: Array<number>
	contacts: Array<number>
}

export type Event = {
	id: number
	version: number
	aggregateId: number
}

export type State = {
	events: Array<Event>
	aggregates: { [key: string]: Entity }
}

export type GlobalState = {
	chat: {
		account: State
	}
}

export namespace Command {
	export type Generate = void
	export type Create = { name: string }
	export type Delete = { id: number }
	export type Open = { id: number }
	export type Close = { id: number }
}

export namespace Query {
	export type List = {}
	export type Get = { id: number }
	export type GetLength = undefined
}

export namespace Event {
	export type Created = { aggregateId: number; name: string }
	export type Deleted = { aggregateId: number }
	export type Opened = { aggregateId: number }
	export type Closed = { aggregateId: number }
}

export type CommandsReducer = {
	generate: (state: State, command: { payload: Command.Generate }) => State
	create: (state: State, command: { payload: Command.Create }) => State
	delete: (state: State, command: { payload: Command.Delete }) => State
	open: (state: State, command: { payload: Command.Open }) => State
	close: (state: State, command: { payload: Command.Close }) => State
}

export type QueryReducer = {
	list: (state: GlobalState, query: Query.List) => Array<Entity>
	get: (state: GlobalState, query: Query.Get) => Entity
	getLength: (state: GlobalState) => number
}

export type EventsReducer = {
	created: (state: State, event: { payload: Event.Created }) => State
	deleted: (state: State, event: { payload: Event.Deleted }) => State
	opened: (state: State, event: { payload: Event.Opened }) => State
	closed: (state: State, event: { payload: Event.Closed }) => State
}

const initialState = {
	events: [],
	aggregates: {},
}

const commandHandler = createSlice<State, CommandsReducer>({
	name: 'chat/account/command',
	initialState,
	reducers: {
		generate: (state) => state,
		create: (state) => state,
		delete: (state) => state,
		open: (state) => state,
		close: (state) => state,
	},
})

const eventHandler = createSlice<State, EventsReducer>({
	name: 'chat/account/event',
	initialState,
	reducers: {
		created: (state, { payload }) => {
			state.aggregates[payload.aggregateId] = {
				id: payload.aggregateId,
				name: payload.name,
				requests: [],
				conversations: [],
				contacts: [],
			}
			return state
		},
		deleted: (state, { payload }) => {
			delete state.aggregates[payload.aggregateId]
			return state
		},
		opened: (state) => state,
		closed: (state) => state,
	},
})

export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)
export const commands = commandHandler.actions
export const events = eventHandler.actions
export const queries: QueryReducer = {
	list: (state) => Object.values(state.chat.account.aggregates),
	get: (state, { id }) => state.chat.account.aggregates[id],
	getLength: (state) => Object.keys(state.chat.account.aggregates).length,
}

export function* orchestrator() {
	yield all([
		takeLeading(commands.generate, function*() {
			yield put(commands.create({ name: faker.name.firstName() }))
		}),

		takeLeading(commands.create, function*({ payload: { name } }) {
			// create an id for the account
			const id = yield select(queries.getLength)

			// send event
			yield put(
				events.created({
					aggregateId: id,
					name,
				}),
			)
		}),

		takeLeading(commands.delete, function*() {
			// TODO: delete account
			// yield put(events.deleteSucceed())
		}),

		takeLeading(commands.open, function*(action) {
			yield fork(function*() {
				// wait for protocol
				while (true) {
					const { payload } = yield take(protocol.events.client.started)
					if (payload.aggregateId === action.payload.id) {
						yield put(events.opened({ aggregateId: action.payload.id }))
						break
					}
				}
			})
			// start protocol client
			yield put(protocol.commands.client.start({ id: action.payload.id }))
		}),

		takeLeading(commands.close, function*() {
			// TODO: close account
			// yield put(events.closeSucceed())
		}),
	])
}
