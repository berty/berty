import { ProtocolServiceClient, ProtocolServiceHandler, mockBridge } from '@berty-tech/grpc-bridge'

import { createSlice } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { all, takeLeading, put } from 'redux-saga/effects'

export type Entity = {
	id: string
}

export type Event = {}

export type State = {
	events: Array<Event>
	aggregates: { [key: string]: Entity }
}

export type GlobalState = {
	protocol: {
		client: State
	}
}

export type Commands = {
	start: (
		state: State,
		action: {
			payload: { id: string }
		},
	) => State
	stop: (
		state: State,
		action: {
			payload: { id: string }
		},
	) => State
	instanceExportData: (state: State, action: { payload: { id: string } }) => State
	instanceGetConfiguration: (state: State, action: { payload: { id: string } }) => State
	groupCreate: (state: State, action: { payload: { id: string } }) => State
	groupJoin: (state: State, action: { payload: { id: string } }) => State
	groupLeave: (state: State, action: { payload: { id: string } }) => State
	groupInvite: (state: State, action: { payload: { id: string } }) => State
	devicePair: (state: State, action: { payload: { id: string } }) => State
	contactRequestReference: (state: State, action: { payload: { id: string } }) => State
	contactRequestDisable: (state: State, action: { payload: { id: string } }) => State
	contactRequestEnable: (state: State, action: { payload: { id: string } }) => State
	contactRequestResetReference: (state: State, action: { payload: { id: string } }) => State
	contactRequestEnqueue: (state: State, action: { payload: { id: string } }) => State
	contactRequestAccept: (state: State, action: { payload: { id: string } }) => State
	contactRemove: (state: State, action: { payload: { id: string } }) => State
	contactBlock: (state: State, action: { payload: { id: string } }) => State
	contactUnblock: (state: State, action: { payload: { id: string } }) => State
	groupSettingSetgroup: (state: State, action: { payload: { id: string } }) => State
	groupSettingSetMember: (state: State, action: { payload: { id: string } }) => State
	groupMessageSend: (state: State, action: { payload: { id: string } }) => State
	accountAppendAppSpecificEvent: (state: State, action: { payload: { id: string } }) => State
	accountSubscribe: (state: State, action: { payload: { id: string } }) => State
	groupSettingSubscribe: (state: State, action: { payload: { id: string } }) => State
	groupMessageSubscribe: (state: State, action: { payload: { id: string } }) => State
	groupMemberSubscribe: (state: State, action: { payload: { id: string } }) => State
}

export type Events = {
	started: (state: State, action: { payload: { aggregateId: string } }) => State
	alreadyStarted: (
		state: State,
		action: {
			payload: { aggregateId: string }
		},
	) => State
	stopped: (state: State, action: { payload: { aggregateId: string } }) => State
	accountUndefined: (state: State, action: { payload: { aggregateId: string } }) => State
	accountGroupJoined: (state: State, action: { payload: { aggregateId: string } }) => State
	accountGroupLeft: (state: State, action: { payload: { aggregateId: string } }) => State
	accountDevicePaired: (state: State, action: { payload: { aggregateId: string } }) => State
	accountContactRequestDisabled: (
		state: State,
		action: { payload: { aggregateId: string } },
	) => State
	accountContactRequestEnabled: (
		state: State,
		action: { payload: { aggregateId: string } },
	) => State
	accountContactRequestReferenceReset: (
		state: State,
		action: { payload: { aggregateId: string } },
	) => State
	accountContactRequestEnqueued: (
		state: State,
		action: { payload: { aggregateId: string } },
	) => State
	accountContactRequested: (state: State, action: { payload: { aggregateId: string } }) => State
	accountContactAccepted: (state: State, action: { payload: { aggregateId: string } }) => State
	accountContactRemoved: (state: State, action: { payload: { aggregateId: string } }) => State
	accountContactBlocked: (state: State, action: { payload: { aggregateId: string } }) => State
	accountContactUnblocked: (state: State, action: { payload: { aggregateId: string } }) => State
	accountAppSpecified: (state: State, action: { payload: { aggregateId: string } }) => State
}

const initialState: State = {
	events: [],
	aggregates: {},
}

const commandHandler = createSlice<State, Commands>({
	name: 'protocol/client/command',
	initialState,
	reducers: {
		start: (state) => state,
		stop: (state) => state,
		instanceExportData: (state) => state,
		instanceGetConfiguration: (state) => state,
		groupCreate: (state) => state,
		groupJoin: (state) => state,
		groupLeave: (state) => state,
		groupInvite: (state) => state,
		devicePair: (state) => state,
		contactRequestReference: (state) => state,
		contactRequestDisable: (state) => state,
		contactRequestEnable: (state) => state,
		contactRequestResetReference: (state) => state,
		contactRequestEnqueue: (state) => state,
		contactRequestAccept: (state) => state,
		contactRemove: (state) => state,
		contactBlock: (state) => state,
		contactUnblock: (state) => state,
		groupSettingSetgroup: (state) => state,
		groupSettingSetMember: (state) => state,
		groupMessageSend: (state) => state,
		accountAppendAppSpecificEvent: (state) => state,
		accountSubscribe: (state) => state,
		groupSettingSubscribe: (state) => state,
		groupMessageSubscribe: (state) => state,
		groupMemberSubscribe: (state) => state,
	},
})

const eventHandler = createSlice<State, Events>({
	name: 'protocol/client/event',
	initialState,
	reducers: {
		started: (state, { payload }) => {
			state.aggregates[payload.aggregateId] = { id: payload.aggregateId }
			return state
		},
		alreadyStarted: (state, { payload }) => {
			state.aggregates[payload.aggregateId] = { id: payload.aggregateId }
			return state
		},
		stopped: (state, { payload }) => {
			delete state.aggregates[payload.aggregateId]
			return state
		},
		accountUndefined: (state) => state,
		accountGroupJoined: (state) => state,
		accountGroupLeft: (state) => state,
		accountDevicePaired: (state) => state,
		accountContactRequestDisabled: (state) => state,
		accountContactRequestEnabled: (state) => state,
		accountContactRequestReferenceReset: (state) => state,
		accountContactRequestEnqueued: (state) => state,
		accountContactRequested: (state) => state,
		accountContactAccepted: (state) => state,
		accountContactRemoved: (state) => state,
		accountContactBlocked: (state) => state,
		accountContactUnblocked: (state) => state,
		accountAppSpecified: (state) => state,
	},
})

export const commands = commandHandler.actions
export const events = eventHandler.actions
export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)

export function* orchestrator() {
	const clients: { [key: string]: ProtocolServiceClient } = {}

	yield all([
		takeLeading(commands.start, function*(action) {
			const id = action.payload.id
			if (clients[id] != null) {
				yield put(events.alreadyStarted({ aggregateId: id }))
				return
			}
			clients[id] = new ProtocolServiceClient(
				mockBridge(ProtocolServiceHandler, { id: id.toString() }),
			)
			yield put(events.started({ aggregateId: id }))
		}),
		takeLeading(commands.stop, function*(action) {
			delete clients[action.payload.id]
			yield put(events.stopped({ aggregateId: action.payload.id }))
		}),
		takeLeading(commands.instanceExportData, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.instanceGetConfiguration, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.groupCreate, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.groupJoin, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.groupLeave, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.groupInvite, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.devicePair, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.contactRequestReference, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.contactRequestDisable, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.contactRequestEnable, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.contactRequestResetReference, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.contactRequestEnqueue, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.contactRequestAccept, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.contactRemove, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.contactBlock, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.contactUnblock, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.groupSettingSetgroup, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.groupSettingSetMember, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.groupMessageSend, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.accountAppendAppSpecificEvent, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.accountSubscribe, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.groupSettingSubscribe, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.groupMessageSubscribe, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.groupMemberSubscribe, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
	])
}
