import { createSlice } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { all, takeEvery } from 'redux-saga/effects'

export type Entity = {
	id: number
}

export type Event = {}

export type Log = Array<Event>

export type State = {
	logs: { [key: string]: Log }
	aggregates: { [key: string]: Entity }
}

export type Commands = {
	start: (state: State) => State
	stop: (state: State) => State
	instanceExportData: (state: State) => State
	instanceGetConfiguration: (state: State) => State
	groupCreate: (state: State) => State
	groupJoin: (state: State) => State
	groupLeave: (state: State) => State
	groupInvite: (state: State) => State
	devicePair: (state: State) => State
	contactRequestReference: (state: State) => State
	contactRequestDisable: (state: State) => State
	contactRequestEnable: (state: State) => State
	contactRequestResetReference: (state: State) => State
	contactRequestEnqueue: (state: State) => State
	contactRequestAccept: (state: State) => State
	contactRemove: (state: State) => State
	contactBlock: (state: State) => State
	contactUnblock: (state: State) => State
	groupSettingSetgroup: (state: State) => State
	groupSettingSetMember: (state: State) => State
	groupMessageSend: (state: State) => State
	accountAppendAppSpecificEvent: (state: State) => State
	accountSubscribe: (state: State) => State
	groupSettingSubscribe: (state: State) => State
	groupMessageSubscribe: (state: State) => State
	groupMemberSubscribe: (state: State) => State
}

export type Events = {
	started: (state: State) => State
	stopped: (state: State) => State
	accountUndefined: (state: State) => State
	accountGroupJoined: (state: State) => State
	accountGroupLeft: (state: State) => State
	accountDevicePaired: (state: State) => State
	accountContactRequestDisabled: (state: State) => State
	accountContactRequestEnabled: (state: State) => State
	accountContactRequestReferenceReset: (state: State) => State
	accountContactRequestEnqueued: (state: State) => State
	accountContactRequested: (state: State) => State
	accountContactAccepted: (state: State) => State
	accountContactRemoved: (state: State) => State
	accountContactBlocked: (state: State) => State
	accountContactUnblocked: (state: State) => State
	accountAppSpecified: (state: State) => State
}

const initialState: State = {
	logs: {},
	aggregates: {},
}

const commandHandler = createSlice<State, Commands>({
	name: 'protocol/instance/command',
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
	name: 'protocol/instance/event',
	initialState,
	reducers: {
		started: (state) => state,
		stopped: (state) => state,
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
	yield all([
		takeEvery(commands.start, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.stop, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.instanceExportData, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.instanceGetConfiguration, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.groupCreate, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.groupJoin, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.groupLeave, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.groupInvite, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.devicePair, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.contactRequestReference, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.contactRequestDisable, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.contactRequestEnable, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.contactRequestResetReference, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.contactRequestEnqueue, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.contactRequestAccept, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.contactRemove, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.contactBlock, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.contactUnblock, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.groupSettingSetgroup, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.groupSettingSetMember, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.groupMessageSend, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.accountAppendAppSpecificEvent, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.accountSubscribe, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.groupSettingSubscribe, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.groupMessageSubscribe, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeEvery(commands.groupMemberSubscribe, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
	])
}
