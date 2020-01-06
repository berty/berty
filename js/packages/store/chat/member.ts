import { createSlice } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { put, all, takeLeading } from 'redux-saga/effects'

export type Entity = {
	name: string
	conversation: number
	messages: Array<number>
}

export type Event = {}

export type Log = Array<Event>

export type State = {
	logs: { [key: string]: Log }
	aggregates: { [key: string]: Entity }
}

export type Commands = {
	invite: (state: State) => State
	remove: (state: State) => State
}

export type Events = {
	invitePending: (state: State) => State
	inviteSucceed: (state: State) => State
	inviteFailed: (state: State) => State

	removePending: (state: State) => State
	removeSucceed: (state: State) => State
	removeFailed: (state: State) => State
}

const initialState: State = {
	logs: {},
	aggregates: {},
}

const commandHandler = createSlice<State, Commands>({
	name: 'chat/member/command',
	initialState,
	reducers: {
		invite: (state: State) => state,
		remove: (state: State) => state,
	},
})

const eventHandler = createSlice<State, Events>({
	name: 'chat/member/event',
	initialState,
	reducers: {
		invitePending: (state: State) => state,
		inviteSucceed: (state: State) => state,
		inviteFailed: (state: State) => state,

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
		takeLeading(commands.invite, function*() {
			yield put(events.invitePending())
			// TODO: invite member
			// yield put(events.inviteSucceed())
			// yield put(events.inviteFailed())
		}),
		takeLeading(commands.remove, function*() {
			yield put(events.removePending())
			// TODO: remove member
			// yield put(events.removeSucceed())
			// yield put(events.removeFailed())
		}),
	])
}
