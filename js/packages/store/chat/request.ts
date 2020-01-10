import { createSlice } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { put, all, takeLeading } from 'redux-saga/effects'

import * as conversation from './conversation'
import * as contact from './contact'

export type Entity = {
	kind: conversation.Entity | contact.Entity
}

export type Event = {}

export type Log = Array<Event>

export type State = {
	logs: { [key: string]: Log }
	aggregates: { [key: string]: Entity }
}

export type Commands = {
	send: (state: State) => State
	accept: (state: State) => State
	remove: (state: State) => State
}

export type Events = {
	sendPending: (state: State) => State
	sendSucceed: (state: State) => State
	sendFailed: (state: State) => State

	acceptPending: (state: State) => State
	acceptSucceed: (state: State) => State
	acceptFailed: (state: State) => State

	removePending: (state: State) => State
	removeSucceed: (state: State) => State
	removeFailed: (state: State) => State
}

const initialState: State = {
	logs: {},
	aggregates: {},
}

const commandHandler = createSlice<State, Commands>({
	name: 'chat/request/command',
	initialState,
	reducers: {
		send: (state: State) => state,
		accept: (state: State) => state,
		remove: (state: State) => state,
	},
})

const eventHandler = createSlice<State, Events>({
	name: 'chat/request/event',
	initialState,
	reducers: {
		sendPending: (state: State) => state,
		sendSucceed: (state: State) => state,
		sendFailed: (state: State) => state,

		acceptPending: (state: State) => state,
		acceptSucceed: (state: State) => state,
		acceptFailed: (state: State) => state,

		removePending: (state: State) => state,
		removeSucceed: (state: State) => state,
		removeFailed: (state: State) => state,
	},
})

export const commands = commandHandler.actions
export const events = eventHandler.actions
export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)

export function* orchestrator() {
	yield all([
		takeLeading(commands.send, function*() {
			yield put(events.sendPending())
			// TODO: send request
			// yield put(events.sendSucceed())
			// yield put(events.sendFailed())
		}),
		takeLeading(commands.accept, function*() {
			yield put(events.acceptPending())
			// TODO: accept request
			// yield put(events.acceptSucceed())
			// yield put(events.acceptFailed())
		}),
		takeLeading(commands.remove, function*() {
			yield put(events.removePending())
			// TODO: remove request
			// yield put(events.removeSucceed())
			// yield put(events.removeFailed())
		}),
	])
}
