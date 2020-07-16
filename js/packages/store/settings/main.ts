import { createSlice } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { all, select, put } from 'redux-saga/effects'
import { berty } from '@berty-tech/api'
import { makeDefaultReducers, makeDefaultCommandsSagas, strToBuf } from '../utils'
import { BertyNodeConfig } from '../protocol/client'
import * as protocol from '../protocol'

export type State = {
	nodeConfig: BertyNodeConfig
	systemInfo?: berty.messenger.v1.SystemInfo.IReply
	debugGroup?: {
		state: string
		peerIds?: string[]
		error?: any
	}
} | null

export type GlobalState = {
	settings: {
		main: State
	}
}

export type Commands = {
	create: (state: State, action: { payload: State }) => State
	set: (state: State, action: { payload: { key: string; value: any } }) => State
	delete: (state: State, action: { payload: void }) => State
	toggleTracing: (state: State, action: { payload: void }) => State
	systemInfo: (state: State, action: { payload: void }) => State
	debugGroup: (state: State, action: { payload: { pk: string } }) => State
}

export type Queries = {
	get: (state: GlobalState) => State
}

export type Events = {
	created: (state: State, action: { payload: State }) => State
	nodeConfigUpdated: (state: State, action: { payload: BertyNodeConfig }) => State
	systemInfoUpdated: (
		state: State,
		action: { payload: { info: berty.messenger.v1.SystemInfo.IReply } },
	) => State
	groupDebugged: (state: State, action: { payload: { peerIds?: string[]; error?: any } }) => State
}

export type Transactions = {
	[K in keyof Commands]: Commands[K] extends (
		state: State,
		action: { payload: infer TPayload },
	) => State
		? (payload: TPayload) => Generator
		: never
} & {
	// put custom transactions here
}

const initialState: State = null

const commandsNames = ['create', 'set', 'delete', 'toggleTracing', 'systemInfo', 'debugGroup']

const commandHandler = createSlice<State, Commands>({
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

const eventsNames = ['created', 'nodeConfigUpdated'] as string[]

const eventHandler = createSlice<State, Events>({
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

export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)
export const commands = commandHandler.actions
export const events = eventHandler.actions
export const queries: Queries = {
	get: (state) => state.settings.main,
}

export function* getMainSettings() {
	const mainSettings = (yield select(queries.get)) as ReturnType<typeof queries.get>
	if (!mainSettings) {
		throw new Error('main settings not found')
	}
	return mainSettings
}

export const transactions: Transactions = {
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
