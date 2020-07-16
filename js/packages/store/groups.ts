import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { put, all, select, fork, takeEvery, cancel, call } from 'typed-redux-saga'
import { Task } from 'redux-saga'

import { makeDefaultCommandsSagas, strToBuf, bufToStr } from './utils'
import { transactions as clientTransactions, events as clientEvents } from './protocol/client'

export type SubscribeOptions = {
	metadata?: boolean
	messages?: boolean
}

export type Entity = {
	publicKey: string
	cids: { [key: string]: true | undefined }
	membersDevices: { [key: string]: string[] | undefined }
} & SubscribeOptions

export type State = { [key: string]: Entity }

export type GlobalState = {
	groups: State
}

// Commands

export namespace Commands {
	export type Open = void
	export type Subscribe = { publicKey: string } & SubscribeOptions
	export type Unsubscribe = { publicKey: string } & SubscribeOptions
}

type CommandCaseReducer<P> = CaseReducer<undefined, PayloadAction<P>>

export type CommandsReducer = {
	open: CommandCaseReducer<Commands.Open>
	subscribe: CommandCaseReducer<Commands.Subscribe>
	unsubscribe: CommandCaseReducer<Commands.Unsubscribe>
}

const commandsHandler = createSlice<undefined, CommandsReducer>({
	name: 'groups/commands',
	initialState: undefined,
	reducers: {
		open: (state) => state,
		subscribe: (state) => state,
		unsubscribe: (state) => state,
	},
})

export const commands = commandsHandler.actions

// Events

export namespace Events {
	export type Updated = { publicKey: string } & SubscribeOptions
	export type CIDRead = { publicKey: string; cid: string }
	export type MemberDeviceAdded = {
		groupPublicKey: string
		memberPublicKey: string
		devicePublicKey: string
	}
}

type EventCaseReducer<P> = CaseReducer<State, PayloadAction<P>>

export type EventsReducer = {
	updated: EventCaseReducer<Events.Updated>
	cidRead: EventCaseReducer<Events.CIDRead>
	memberDeviceAdded: EventCaseReducer<Events.MemberDeviceAdded>
}

const eventsHandler = createSlice<State, EventsReducer>({
	name: 'groups/events',
	initialState: {},
	reducers: {
		updated: (state: State, { payload }) => {
			const { publicKey, metadata, messages } = payload
			const group = state[payload.publicKey]
			if (!group) {
				state[payload.publicKey] = {
					publicKey,
					metadata,
					messages,
					cids: {},
					membersDevices: {},
				}
				return state
			}
			group.metadata = metadata
			group.messages = messages
			return state
		},
		cidRead: (state: State, { payload: { cid, publicKey } }) => {
			if (!state[publicKey]) {
				state[publicKey] = {
					publicKey,
					cids: { [cid]: true },
					membersDevices: {},
				}
			}
			state[publicKey].cids[cid] = true
			return state
		},
		memberDeviceAdded: (
			state: State,
			{ payload: { groupPublicKey, memberPublicKey, devicePublicKey } },
		) => {
			if (!state[groupPublicKey]) {
				state[groupPublicKey] = {
					publicKey: groupPublicKey,
					cids: {},
					membersDevices: {},
				}
			}
			const group = state[groupPublicKey]
			const devices = group.membersDevices[memberPublicKey]
			if (!devices) {
				group.membersDevices[memberPublicKey] = [devicePublicKey]
				return state
			}
			if (devices.indexOf(devicePublicKey) === -1) {
				devices.push(devicePublicKey)
			}
			return state
		},
	},
})

export const events = eventsHandler.actions

// Queries

type Query<Props, Return> = (state: GlobalState, query: Props) => Return

export type Queries = {
	list: Query<void, Entity[]>
	get: Query<{ groupId: string }, Entity | undefined>
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
} & {
	isCIDRead: ({
		cid,
		publicKey,
	}: {
		cid: string
		publicKey: string
	}) => Generator<unknown, true | undefined>
}

type SubscribeTasks = { metadataTask?: Task; messagesTask?: Task }

export const transactions: Transactions = {
	open: function* () {
		const allTasks: { [key: string]: SubscribeTasks | undefined } = {}
		const optsList = yield* select(queries.list)
		for (const opts of optsList) {
			const groupPk = strToBuf(opts.publicKey)
			if (opts.messages || opts.metadata) {
				yield* call(clientTransactions.activateGroup, { groupPk })
			}
			const tasks: SubscribeTasks = {}
			if (opts.messages) {
				tasks.messagesTask = yield* fork(clientTransactions.listenToGroupMessages, { groupPk })
			}
			if (opts.metadata) {
				tasks.metadataTask = yield* fork(clientTransactions.listenToGroupMetadata, { groupPk })
			}
			allTasks[opts.publicKey] = tasks
		}
		yield put({ type: 'GROUPS_OPENED' })
		yield* all([
			takeEvery(commands.subscribe, function* ({ payload }) {
				const tasks: SubscribeTasks = allTasks[payload.publicKey] || {}
				const groupPk = strToBuf(payload.publicKey)
				if (!tasks.messagesTask && payload.messages) {
					tasks.messagesTask = yield* fork(clientTransactions.listenToGroupMessages, { groupPk })
				}
				if (!tasks.metadataTask && payload.metadata) {
					tasks.metadataTask = yield* fork(clientTransactions.listenToGroupMetadata, { groupPk })
				}
				allTasks[payload.publicKey] = tasks
				yield* put(events.updated(payload))
			}),
			takeEvery(commands.unsubscribe, function* ({ payload }) {
				const tasks = allTasks[payload.publicKey] || {}
				if (tasks.messagesTask && payload.messages) {
					yield* cancel(tasks.messagesTask)
					delete tasks.messagesTask
				}
				if (tasks.metadataTask && payload.metadata) {
					yield* cancel(tasks.metadataTask)
					delete tasks.metadataTask
				}
				allTasks[payload.publicKey] = tasks
				yield* put(
					events.updated({ ...payload, messages: !payload.messages, metadata: !payload.metadata }),
				)
			}),
			takeEvery('STOP_CLIENT', function* () {
				for (const task of Object.values(allTasks)) {
					task?.messagesTask?.cancel()
					task?.metadataTask?.cancel()
				}
				yield put({ type: 'GROUPS_STOPED' })
			}),
		])
	},
	isCIDRead: function* ({ cid, publicKey }) {
		return yield* select((state: GlobalState) => state.groups[publicKey]?.cids[cid])
	},
	subscribe: function* () {
		// handled in 'open' transaction
	},
	unsubscribe: function* () {
		// handled in 'open' transaction
	},
}

export function* orchestrator() {
	yield* all([
		...makeDefaultCommandsSagas(commands, transactions),
		takeEvery(clientEvents.groupMemberDeviceAdded, function* ({ payload }) {
			const {
				event: { devicePk, memberPk },
				eventContext: { groupPk },
			} = payload
			if (!(devicePk && memberPk && groupPk)) {
				return
			}
			yield* put(
				events.memberDeviceAdded({
					groupPublicKey: bufToStr(groupPk),
					memberPublicKey: bufToStr(memberPk),
					devicePublicKey: bufToStr(devicePk),
				}),
			)
		}),
	])
}

// Exports

export const reducers = { groups: eventsHandler.reducer }
