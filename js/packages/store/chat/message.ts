import { createSlice } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { put, all, takeLeading } from 'redux-saga/effects'

export type Entity = {
	body: string
	reactions: Array<{ member: number; emoji: string }>
	attachments: Array<{ uri: string }>
}

export type Event = {}

export type Log = Array<Event>

export type State = {
	logs: { [key: string]: Log }
	aggregates: { [key: string]: Entity }
}

export type Commands = {
	send: (state: State) => State
	hide: (state: State) => State
}

export type Events = {
	sendPending: (state: State) => State
	sendSucceed: (state: State) => State
	sendFailed: (state: State) => State

	hidePending: (state: State) => State
	hideSucceed: (state: State) => State
	hideFailed: (state: State) => State
}

const initialState: State = {
	logs: {},
	aggregates: {},
}

const commandHandler = createSlice<State, Commands>({
	name: 'chat/message/command',
	initialState,
	reducers: {
		send: (state: State) => state,
		hide: (state: State) => state,
	},
})

const eventHandler = createSlice<State, Events>({
	name: 'chat/message/event',
	initialState,
	reducers: {
		sendPending: (state: State) => state,
		sendSucceed: (state: State) => state,
		sendFailed: (state: State) => state,

		hidePending: (state: State) => state,
		hideSucceed: (state: State) => state,
		hideFailed: (state: State) => state,
	},
})

export const commands = commandHandler.actions
export const events = eventHandler.actions
export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)

export function* orchestrator() {
	yield all([
		takeLeading(commands.send, function*() {
			yield put(events.sendPending())
			// TODO: send message
			// yield put(events.sendSucceed())
			// yield put(events.sendFailed())
		}),
		takeLeading(commands.hide, function*() {
			yield put(events.hidePending())
			// TODO: hide message
			// yield put(events.hideSucceed())
			// yield put(events.hideFailed())
		}),
	])
}
