import { createSlice } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { all, select, put } from 'redux-saga/effects'
import { berty } from '@berty-tech/api'
import { makeDefaultReducers, makeDefaultCommandsSagas } from '../utils'
import { BertyNodeConfig } from '../protocol/client'
import * as protocol from '../protocol'

export type Entity = {
	id: string
	nodeConfig: BertyNodeConfig
	systemInfo?: berty.messenger.v1.SystemInfo.IReply
}

export type State = { [key: string]: Entity }

export type GlobalState = {
	settings: {
		main: State
	}
}

export type Commands = {
	create: (state: State, action: { payload: Entity }) => State
	set: (state: State, action: { payload: { id: string; key: string; value: any } }) => State
	delete: (state: State, action: { payload: { id: string } }) => State
	toggleTracing: (state: State, action: { payload: { id: string } }) => State
	systemInfo: (state: State, action: { payload: { id: string } }) => State
}

export type Queries = {
	get: (state: GlobalState, payload: { id: string }) => Entity | undefined
	getAll: (state: GlobalState) => Entity[]
}

export type Events = {
	created: (state: State, action: { payload: Entity }) => State
	nodeConfigUpdated: (state: State, action: { payload: BertyNodeConfig & { id: string } }) => State
	systemInfoUpdated: (
		state: State,
		action: { payload: { info: berty.messenger.v1.SystemInfo.IReply; id: string } },
	) => State
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

const initialState: State = {}

const commandsNames = ['create', 'set', 'delete', 'toggleTracing', 'systemInfo']

const commandHandler = createSlice<State, Commands>({
	name: 'settings/main/command',
	initialState,
	// we don't change state on commands
	reducers: makeDefaultReducers(commandsNames),
})

const eventsNames = ['created', 'nodeConfigUpdated'] as string[]

const eventHandler = createSlice<State, Events>({
	name: 'settings/main/event',
	initialState,
	reducers: {
		...makeDefaultReducers(eventsNames),
		created: (state, { payload }) => {
			const { id } = payload
			if (!state[id]) {
				state[id] = payload
			}
			return state
		},
		nodeConfigUpdated: (state, { payload }) => {
			const { id } = payload
			if (!state[id]) {
				return state
			}
			state[id].nodeConfig = payload
			return state
		},
		systemInfoUpdated: (state, { payload }) => {
			state[payload.id].systemInfo = payload.info
			return state
		},
		// put reducer implementaion here
	},
})

export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)
export const commands = commandHandler.actions
export const events = eventHandler.actions
export const queries: Queries = {
	get: (state, { id }) => state.settings.main[id],
	getAll: (state) => Object.values(state.settings.main),
}

export function* getMainSettings(id: string) {
	const mainSettings = (yield select((state: GlobalState) => queries.get(state, { id }))) as
		| Entity
		| undefined
	if (!mainSettings) {
		throw new Error(`main settings not found for ${id}`)
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
	toggleTracing: function* ({ id }) {
		const { nodeConfig } = yield* getMainSettings(id)
		if (nodeConfig.type === 'external') {
			return
		}
		const tracingPreviously = nodeConfig.opts.tracing
		const act = events.nodeConfigUpdated({
			id,
			...nodeConfig,
			opts: { ...nodeConfig.opts, tracing: !tracingPreviously },
		})
		yield put(act)
	},
	systemInfo: function* ({ id }) {
		const info = yield* protocol.transactions.client.systemInfo({
			id,
		})
		yield put(
			events.systemInfoUpdated({
				id,
				info,
			}),
		)
	},
}

export function* orchestrator() {
	yield all([...makeDefaultCommandsSagas(commands, transactions)])
}
