import { createSlice } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { put, all, takeLeading, select, take, takeEvery } from 'redux-saga/effects'
import faker from 'faker'
import { Buffer } from 'buffer'

import * as protocol from '../protocol'

export type Entity = {
	id: string
	pubkey: string
	name: string
	requests: Array<string>
	conversations: Array<string>
	contacts: Array<string>
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
		account: State
	}
}

export namespace Command {
	export type Generate = void
	export type Create = { name: string }
	export type Delete = { id: string }
}

export namespace Query {
	export type List = {}
	export type Get = { id: string }
	export type GetLength = undefined
}

export namespace Event {
	export type Created = { aggregateId: string; name: string; pubkey?: string }
	export type Deleted = { aggregateId: string }
	export type PubKeyUpdated = { aggregateId: string; pubkey: string }
}

export type CommandsReducer = {
	generate: (state: State, command: { payload: Command.Generate }) => State
	create: (state: State, command: { payload: Command.Create }) => State
	delete: (state: State, command: { payload: Command.Delete }) => State
}

export type QueryReducer = {
	list: (state: GlobalState, query: Query.List) => Array<Entity>
	get: (state: GlobalState, query: Query.Get) => Entity
	getLength: (state: GlobalState) => number
}

export type EventsReducer = {
	created: (state: State, event: { payload: Event.Created }) => State
	deleted: (state: State, event: { payload: Event.Deleted }) => State
	pubkeyUpdated: (state: State, event: { payload: Event.PubKeyUpdated }) => State
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
	},
})

const eventHandler = createSlice<State, EventsReducer>({
	name: 'chat/account/event',
	initialState,
	reducers: {
		created: (state, { payload }) => {
			state.aggregates[payload.aggregateId] = {
				id: payload.aggregateId,
				pubkey: payload.pubkey || '',
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
		pubkeyUpdated: (state, { payload }) => {
			if (state.aggregates[payload.aggregateId]) {
				state.aggregates[payload.aggregateId].pubkey = payload.pubkey
			}
			return state
		},
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

			yield put(protocol.commands.client.instanceInitiateNewAccount({ id }))

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
			// yield put(events.deleted())
		}),

		// send every chat account related events to protocol account log
		takeEvery(Object.values(events), function*(action: { type: string; payload: Event }) {
			const account = yield select((state) =>
				queries.get(state, { id: action.payload.aggregateId }),
			)
			yield put(
				protocol.commands.client.appSendPermanentMessage({
					id: account.id,
					groupPk: account.pubkey,
					payload: action,
				}),
			)
		}),

		takeEvery(protocol.events.client.instanceInitiatedNewAccount, function*(action) {
			yield put(
				events.pubkeyUpdated({
					aggregateId: action.payload.aggregateId,
					pubkey: action.payload.accountGroupPk,
				}),
			)
		}),
	])
}
