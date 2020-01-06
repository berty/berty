import { createSlice } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { put, all, takeLeading } from 'redux-saga/effects'

export type Entity = {
	id: number
	name: string
	requests: Array<number>
	conversations: Array<number>
	contacts: Array<number>
}

export type Event = {}

export type Log = Array<Event>

export type State = {
	logs: { [key: string]: Log }
	aggregates: { [key: string]: Entity }
}

export type Commands = {
	create: (state: State) => State
	delete: (state: State) => State
	open: (state: State) => State
	close: (state: State) => State
}

export type Events = {
	createPending: (state: State) => State
	createSucceed: (state: State) => State
	createFailed: (state: State) => State

	deletePending: (state: State) => State
	deleteSucceed: (state: State) => State
	deleteFailed: (state: State) => State

	openPending: (state: State) => State
	openSucceed: (state: State) => State
	openFailed: (state: State) => State

	closePending: (state: State) => State
	closeSucceed: (state: State) => State
	closeFailed: (state: State) => State
}

const initialState: State = {
	logs: {},
	aggregates: {},
}

const commandHandler = createSlice<State, Commands>({
	name: 'chat/account/command',
	initialState,
	reducers: {
		create: (state: State) => state,
		delete: (state: State) => state,
		open: (state: State) => state,
		close: (state: State) => state,
	},
})

const eventHandler = createSlice<State, Events>({
	name: 'chat/account/event',
	initialState,
	reducers: {
		createPending: (state: State) => state,
		createSucceed: (state: State) => state,
		createFailed: (state: State) => state,

		deletePending: (state: State) => state,
		deleteSucceed: (state: State) => state,
		deleteFailed: (state: State) => state,

		openPending: (state: State) => state,
		openSucceed: (state: State) => state,
		openFailed: (state: State) => state,

		closePending: (state: State) => state,
		closeSucceed: (state: State) => state,
		closeFailed: (state: State) => state,
	},
})

export const commands = commandHandler.actions
export const events = eventHandler.actions
export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)

export function* orchestrator() {
	yield all([
		takeLeading(commands.create, function*() {
			yield put(events.createPending())
			// TODO: create account
			// yield put(events.createSucceed())
			// yield put(events.createFailed())
		}),
		takeLeading(commands.delete, function*() {
			yield put(events.deletePending())
			// TODO: delete account
			// yield put(events.deleteSucceed())
			// yield put(events.deleteFailed())
		}),
		takeLeading(commands.open, function*() {
			yield put(events.openPending())
			// TODO: open account
			// yield put(events.openSucceed())
			// yield put(events.openFailed())
		}),
		takeLeading(commands.close, function*() {
			yield put(events.closePending())
			// TODO: close account
			// yield put(events.closeSucceed())
			// yield put(events.closeFailed())
		}),
	])
}
