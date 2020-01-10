import { createSlice } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { put, all, take, takeEvery, takeLeading, fork, select } from 'redux-saga/effects'
import * as protocol from '../protocol'

export type Entity = {
	id: number
	protocolClient: number
	name: string
	requests: Array<number>
	conversations: Array<number>
	contacts: Array<number>
}

export type State = {
	aggregates: { [key: string]: Entity }
}

export type GlobalState = {
	chat: {
		account: State
	}
}

declare namespace Command {
	export type Create = { name: string }
	export type Delete = { id: number }
	export type Open = { id: number }
	export type Close = { id: number }
}

declare namespace Event {
	export type Created = { id: number; name: string; protocolClient: number }
	export type Deleted = { id: number }
	export type Opened = { id: number }
	export type Closed = { id: number }
}

export type CommandsReducer = {
	create: (state: State, action: { payload: Command.Create }) => State
	delete: (state: State, action: { payload: Command.Delete }) => State
	open: (state: State, action: { payload: Command.Open }) => State
	close: (state: State, action: { payload: Command.Close }) => State
}

export type EventsReducer = {
	created: (state: State, action: { payload: Event.Created }) => State
	deleted: (state: State, action: { payload: Event.Deleted }) => State
	opened: (state: State, action: { payload: Event.Opened }) => State
	closed: (state: State, action: { payload: Event.Closed }) => State
}

const initialState = {
	aggregates: {},
}

const commandHandler = createSlice<State, CommandsReducer>({
	name: 'chat/account/command',
	initialState,
	reducers: {
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
			state.aggregates[payload.id] = { ...payload, requests: [], conversations: [], contacts: [] }
			return state
		},
		deleted: (state, { payload }) => {
			delete state.aggregates[payload.id]
			return state
		},
		opened: (state) => state,
		closed: (state) => state,
	},
})

export const commands = commandHandler.actions
export const events = eventHandler.actions
export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)
export const selectors = {
	getLength: (state: State) => state.aggregates.length,
	byProtocolClientId: (state: State, protocolClientId: number): Entity | null => {
		const index = Object.keys(state.aggregates).findIndex(
			(k) => state.aggregates[k].protocolClient === protocolClientId,
		)
		if (index === -1) {
			return null
		}
		return state.aggregates[index]
	},
}

export function* orchestrator() {
	yield all([
		takeLeading(commands.create, function*({ payload: { name } }) {
			// handle protocol client started
			yield fork(function*() {
				const {
					payload: { id },
				} = yield take(protocol.events.client.started)
				// create account
				yield put(
					events.created({
						id: yield select((state: GlobalState) => selectors.getLength(state.chat.account)),
						name,
						protocolClient: id,
					}),
				)
			})
			// start protocol client
			yield put(protocol.commands.client.start())
		}),
		takeLeading(commands.delete, function*() {
			// TODO: delete account
			// yield put(events.deleteSucceed())
		}),
		takeLeading(commands.open, function*() {
			// TODO: open account
			// yield put(events.openSucceed())
		}),
		takeLeading(commands.close, function*() {
			// TODO: close account
			// yield put(events.closeSucceed())
		}),

		// eventHandler
		takeEvery(protocol.events.client.started, function*() {
			const account = yield select((state: GlobalState) => selectors.getLength(state.chat.account))
			if (account == null) {
				// warn
				return
			}
			yield put(events.opened({ id: account.id }))
		}),
		takeEvery(protocol.events.client.stopped, function*(action) {
			yield put(
				events.closed({
					id: yield select((state: GlobalState) =>
						selectors.byProtocolClientId(state.chat.account, action.payload.id),
					),
				}),
			)
		}),
	])
}
