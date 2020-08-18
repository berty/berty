import { createSlice } from '@reduxjs/toolkit'
import { put, all, select, fork, takeEvery, cancel, call } from 'redux-saga/effects'

import { makeDefaultCommandsSagas, strToBuf, bufToStr, createCommands } from './utils'
import { transactions as clientTransactions, events as clientEvents } from './protocol/client'

// Commands

const commandsHandler = createCommands('groups/commands', undefined, [
	'open',
	'subscribe',
	'unsubscribe',
])

export const commands = commandsHandler.actions

// Events

const eventsHandler = createSlice({
	name: 'groups/events',
	initialState: {},
	reducers: {
		updated: (state, { payload }) => {
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
		cidRead: (state, { payload: { cid, publicKey } }) => {
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
			state,
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

export const queries = {
	list: (state) => Object.values(state.groups),
	get: (state, { groupId }) => state.groups[groupId],
}

// Transactions

export const transactions = {
	open: function* () {
		const allTasks = {}
		const optsList = yield select(queries.list)
		for (const opts of optsList) {
			const groupPk = strToBuf(opts.publicKey)
			if (opts.messages || opts.metadata) {
				yield call(clientTransactions.activateGroup, { groupPk })
			}
			const tasks = {}
			if (opts.messages) {
				tasks.messagesTask = yield fork(clientTransactions.listenToGroupMessages, { groupPk })
			}
			if (opts.metadata) {
				tasks.metadataTask = yield fork(clientTransactions.listenToGroupMetadata, { groupPk })
			}
			allTasks[opts.publicKey] = tasks
		}
		yield put({ type: 'GROUPS_OPENED' })
		yield all([
			takeEvery(commands.subscribe, function* ({ payload }) {
				const tasks = allTasks[payload.publicKey] || {}
				const groupPk = strToBuf(payload.publicKey)
				if (!tasks.messagesTask && payload.messages) {
					tasks.messagesTask = yield fork(clientTransactions.listenToGroupMessages, { groupPk })
				}
				if (!tasks.metadataTask && payload.metadata) {
					tasks.metadataTask = yield fork(clientTransactions.listenToGroupMetadata, { groupPk })
				}
				allTasks[payload.publicKey] = tasks
				yield put(events.updated(payload))
			}),
			takeEvery(commands.unsubscribe, function* ({ payload }) {
				const tasks = allTasks[payload.publicKey] || {}
				if (tasks.messagesTask && payload.messages) {
					yield cancel(tasks.messagesTask)
					delete tasks.messagesTask
				}
				if (tasks.metadataTask && payload.metadata) {
					yield cancel(tasks.metadataTask)
					delete tasks.metadataTask
				}
				allTasks[payload.publicKey] = tasks
				yield put(
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
		return yield select((state) => state.groups[publicKey]?.cids[cid])
	},
	subscribe: function* () {
		// handled in 'open' transaction
	},
	unsubscribe: function* () {
		// handled in 'open' transaction
	},
}

export function* orchestrator() {
	yield all([
		...makeDefaultCommandsSagas(commands, transactions),
		takeEvery(clientEvents.groupMemberDeviceAdded, function* ({ payload }) {
			const {
				event: { devicePk, memberPk },
				eventContext: { groupPk },
			} = payload
			if (!(devicePk && memberPk && groupPk)) {
				return
			}
			yield put(
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
