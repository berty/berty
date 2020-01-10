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

export type Event = {}

export type Log = Array<Event>

export type State = {
	logs: { [key: string]: Log }
	aggregates: { [key: string]: Entity }
}

export type Commands = {
	create: (state: State) => State
	delete: (state: State) => State
}

export type Events = {
	createPending: (state: State) => State
	createSucceed: (state: State) => State
	createFailed: (state: State) => State

	deletePending: (state: State) => State
	deleteSucceed: (state: State) => State
	deleteFailed: (state: State) => State
}

const initialState: State = {
	logs: {},
	aggregates: {},
}

const commandHandler = createSlice<State, Commands>({
	name: 'chat/conversation/command',
	initialState,
	reducers: {
		create: (state: State) => state,
		delete: (state: State) => state,
	},
})

const eventHandler = createSlice<State, Events>({
	name: 'chat/conversation/event',
	initialState,
	reducers: {
		createPending: (state: State) => state,
		createSucceed: (state: State) => state,
		createFailed: (state: State) => state,

		deletePending: (state: State) => state,
		deleteSucceed: (state: State) => state,
		deleteFailed: (state: State) => state,
	},
})

export const commands = commandHandler.actions
export const events = eventHandler.actions
export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)

export function* orchestrator() {
	yield all([
		takeLeading(commands.create, function*() {
			yield put(events.createPending())
			// TODO: create conversation
			// yield put(events.createSucceed())
			// yield put(events.createFailed())
		}),
		takeLeading(commands.delete, function*() {
			yield put(events.deletePending())
			// TODO: delete conversation
			// yield put(events.deleteSucceed())
			// yield put(events.deleteFailed())
		}),
	])
}
