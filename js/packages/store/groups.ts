import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { put, all, select, fork, takeEvery, cancel, call } from 'typed-redux-saga'
import { Task } from 'redux-saga'

import { makeDefaultCommandsSagas, strToBuf } from './utils'
import { transactions as clientTransactions } from './protocol/client'

export type SubscribeOptions = {
	publicKey: string
	metadata?: boolean
	messages?: boolean
}

export type State = { [key: string]: SubscribeOptions }

export type GlobalState = {
	groups: State
}

// Commands

export namespace Commands {
	export type Open = { clientId: string }
	export type Subscribe = { clientId: string } & SubscribeOptions
	export type Unsubscribe = { clientId: string } & SubscribeOptions
}

type CommandCaseReducer<P> = CaseReducer<{}, PayloadAction<P>>

export type CommandsReducer = {
	open: CommandCaseReducer<Commands.Open>
	subscribe: CommandCaseReducer<Commands.Subscribe>
	unsubscribe: CommandCaseReducer<Commands.Unsubscribe>
}

const commandsHandler = createSlice<State, CommandsReducer>({
	name: 'groups/commands',
	initialState: {},
	reducers: {
		open: (state: State) => state,
		subscribe: (state: State) => state,
		unsubscribe: (state: State) => state,
	},
})

export const commands = commandsHandler.actions

// Events

export namespace Events {
	export type Subscribed = { publicKey: string } & SubscribeOptions
	export type Unsubscribed = { publicKey: string } & SubscribeOptions
}

type EventCaseReducer<P> = CaseReducer<State, PayloadAction<P>>

export type EventsReducer = {
	subscribed: EventCaseReducer<Events.Subscribed>
	unsubscribed: EventCaseReducer<Events.Unsubscribed>
}

const eventsHandler = createSlice<State, EventsReducer>({
	name: 'groups/events',
	initialState: {},
	reducers: {
		subscribed: (state: State, { payload }) => {
			const opts = state[payload.publicKey]
			if (opts) {
				opts.metadata = opts.metadata || payload.metadata
				opts.messages = opts.messages || payload.messages
			} else {
				state[payload.publicKey] = payload
			}
			return state
		},
		unsubscribed: (state: State, { payload }) => {
			const opts = state[payload.publicKey]
			if (opts) {
				if (payload.metadata) {
					delete opts.metadata
				}
				if (payload.messages) {
					delete opts.messages
				}
			}
			return state
		},
	},
})

export const events = eventsHandler.actions

// Queries

type Query<Props, Return> = (state: GlobalState, query: Props) => Return

export type Queries = {
	list: Query<{ clientId: string }, SubscribeOptions[]>
	get: Query<{ groupId: string }, SubscribeOptions | undefined>
}

export const queries: Queries = {
	list: (state) => Object.values(state.groups),
	get: (state, { groupId }) => state.groups[groupId],
}

// Transactions

export type Transactions = {
	[K in keyof CommandsReducer]: CommandsReducer[K] extends CommandCaseReducer<infer TPayload>
		? (payload: TPayload) => Generator
		: never
}

type SubscribeTasks = { metadataTask?: Task; messagesTask?: Task }

export const transactions: Transactions = {
	open: function* ({ clientId }) {
		const allTasks: { [key: string]: SubscribeTasks | undefined } = {}
		const optsList = yield* select((state) => queries.list(state, { clientId }))
		for (const opts of optsList) {
			if (opts.messages || opts.metadata) {
				yield* call(clientTransactions.activateGroup, {
					id: clientId,
					groupPk: strToBuf(opts.publicKey),
				})
			}
			const tasks: SubscribeTasks = {}
			if (opts.messages) {
				tasks.messagesTask = yield* fork(clientTransactions.listenToGroupMessages, {
					clientId,
					groupPk: strToBuf(opts.publicKey),
				})
			}
			if (opts.metadata) {
				tasks.metadataTask = yield* fork(clientTransactions.listenToGroupMetadata, {
					clientId,
					groupPk: strToBuf(opts.publicKey),
				})
			}
			allTasks[opts.publicKey] = tasks
		}
		yield* takeEvery(commands.subscribe, function* ({ payload }) {
			if (payload.clientId !== clientId) {
				return
			}
			const tasks: SubscribeTasks = allTasks[payload.publicKey] || {}
			if (!tasks.messagesTask && payload.messages) {
				tasks.messagesTask = yield* fork(clientTransactions.listenToGroupMessages, {
					clientId,
					groupPk: strToBuf(payload.publicKey),
				})
			}
			if (!tasks.metadataTask && payload.metadata) {
				tasks.metadataTask = yield* fork(clientTransactions.listenToGroupMetadata, {
					clientId,
					groupPk: strToBuf(payload.publicKey),
				})
			}
			yield* put(events.subscribed(payload))
		})
		yield* takeEvery(commands.unsubscribe, function* ({ payload }) {
			if (payload.clientId !== clientId) {
				return
			}
			const tasks: SubscribeTasks = allTasks[payload.publicKey] || {}
			if (tasks.messagesTask && payload.messages) {
				yield* cancel(tasks.messagesTask)
				delete tasks.messagesTask
			}
			if (tasks.metadataTask && payload.metadata) {
				yield* cancel(tasks.metadataTask)
				delete tasks.metadataTask
			}
			yield* put(events.unsubscribed(payload))
		})
	},
	subscribe: function* () {
		// handled in 'open' transaction
	},
	unsubscribe: function* () {
		// handled in 'open' transaction
	},
}

export function* orchestrator() {
	yield* all([...makeDefaultCommandsSagas(commands, transactions)])
}

// Exports

export const reducers = { groups: eventsHandler.reducer }
