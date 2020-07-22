import { createSlice } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { all, select, put } from 'redux-saga/effects'
import { makeDefaultReducers, makeDefaultCommandsSagas, strToBuf } from '../utils'
import * as protocol from '../protocol'
import { messenger } from '..'

const initialState = null

const commandsNames = ['create', 'set', 'delete', 'toggleTracing', 'systemInfo', 'debugGroup']

const commandsSlice = createSlice({
	name: 'settings/main/command',
	initialState,
	reducers: {
		...makeDefaultReducers(commandsNames),
		debugGroup: (state) => {
			if (state) {
				state.debugGroup = { ...state.debugGroup, state: 'fetching' }
			}
			return state
		},
	},
})

const eventsNames = ['created', 'nodeConfigUpdated']

const eventHandler = createSlice({
	name: 'settings/main/event',
	initialState,
	reducers: {
		...makeDefaultReducers(eventsNames),
		created: (state, { payload }) => {
			if (!state) {
				state = payload
			}
			return state
		},
		nodeConfigUpdated: (state, { payload }) => {
			if (!state) {
				return state
			}
			state.nodeConfig = payload
			return state
		},
		systemInfoUpdated: (state, { payload }) => {
			if (!state) {
				return state
			}
			state.systemInfo = payload.info
			return state
		},
		groupDebugged: (state, { payload }) => {
			if (state) {
				if (payload.peerIds) {
					state.debugGroup = {
						peerIds: payload.peerIds,
						state: 'done',
					}
				} else if (payload.error) {
					state.debugGroup = {
						error: payload.error,
						state: 'error',
					}
				}
			}
			return state
		},
		// put reducer implementaion here
	},
})

export const reducer = composeReducers(commandsSlice.reducer, eventHandler.reducer)
export const commands = commandsSlice.actions
export const events = eventHandler.actions
export const queries = {
	get: (state) => state.settings.main,
}

export function* getMainSettings() {
	const mainSettings = yield select(queries.get)
	if (!mainSettings) {
		throw new Error('main settings not found')
	}
	return mainSettings
}

export const transactions = {
	create: function* () {
		throw new Error('not implemented')
	},
	set: function* () {
		throw new Error('not implemented')
	},
	delete: function* () {
		throw new Error('not implemented')
	},
	toggleTracing: function* () {
		const { nodeConfig } = yield* getMainSettings()
		if (nodeConfig.type === 'external') {
			return
		}
		const tracingPreviously = nodeConfig.opts.tracing
		const act = events.nodeConfigUpdated({
			...nodeConfig,
			opts: { ...nodeConfig.opts, tracing: !tracingPreviously },
		})
		yield put(act)
	},
	systemInfo: function* () {
		const info = yield* protocol.transactions.client.systemInfo()
		yield put(events.systemInfoUpdated({ info }))
	},
	debugGroup: function* ({ pk }) {
		try {
			// does not support multi devices per account
			const group = yield* protocol.transactions.client.debugGroup({ groupPk: strToBuf(pk) })
			yield put(events.groupDebugged({ peerIds: group.peerIds }))
		} catch (error) {
			yield put(events.groupDebugged({ error }))
		}
	},
}

export function* orchestrator() {
	yield all([...makeDefaultCommandsSagas(commands, transactions)])
}
