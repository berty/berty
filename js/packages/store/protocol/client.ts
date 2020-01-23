import { ProtocolServiceClient, ProtocolServiceHandler, mockBridge } from '@berty-tech/grpc-bridge'
import { createSlice } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { all, takeLeading, put, cps, select, fork } from 'redux-saga/effects'
import * as api from '@berty-tech/api'
import { Buffer } from 'buffer'

export type Entity = {
	id: string

	// needed for mvp
	accountGroupPk: string
	accountDevicePk: string
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
	instanceExportData: (state: State, action: { payload: { id: string } }) => State
	instanceGetConfiguration: (state: State, action: { payload: { id: string } }) => State
	instanceLinkToExistingAccount: (state: State, action: { payload: { id: string } }) => State
	instanceInitiateNewAccount: (state: State, action: { payload: { id: string } }) => State

	contactRequestReference: (state: State, action: { payload: { id: string } }) => State
	contactRequestDisable: (state: State, action: { payload: { id: string } }) => State
	contactRequestEnable: (state: State, action: { payload: { id: string } }) => State
	contactRequestResetReference: (state: State, action: { payload: { id: string } }) => State
	contactRequestSend: (state: State, action: { payload: { id: string } }) => State
	contactRequestAccept: (state: State, action: { payload: { id: string } }) => State
	contactRequestIgnore: (state: State, action: { payload: { id: string } }) => State
	contactRequestRefuse: (state: State, action: { payload: { id: string } }) => State

	contactBlock: (state: State, action: { payload: { id: string } }) => State
	contactUnblock: (state: State, action: { payload: { id: string } }) => State
	contactAliasKeySend: (state: State, action: { payload: { id: string } }) => State

	multiMemberCreate: (state: State, action: { payload: { id: string } }) => State
	multiMemberJoin: (state: State, action: { payload: { id: string } }) => State
	multiMemberLeave: (state: State, action: { payload: { id: string } }) => State
	multiMemberAliasProofDisclose: (state: State, action: { payload: { id: string } }) => State
	multiMemberAdminRoleGrant: (state: State, action: { payload: { id: string } }) => State

	multiMemberCreateInvitation: (state: State, action: { payload: { id: string } }) => State
	appSendPermanentMessage: (state: State, action: { payload: { id: string } }) => State
	groupMetadataSubscribe: (state: State, action: { payload: { id: string } }) => State
	groupSecureMessageSubscribe: (state: State, action: { payload: { id: string } }) => State
}

export type Queries = {
	get: (state: GlobalState, payload: { id: string }) => Entity
	getAll: (state: GlobalState) => Entity[]
}

export type Events = {
	instanceInitiatedNewAccount: (
		state: State,
		action: { payload: { aggregateId: string; accountGroupPk: string; accountDevicePk: string } },
	) => State

	groupAddMemberDevice: (state: State) => State
	groupAddDeviceSecret: (state: State) => State
	groupJoined: (state: State) => State
	groupLeft: (state: State) => State

	contactRequestDisabled: (state: State) => State
	contactRequestEnabled: (state: State) => State
	contactRequestReferenceReset: (state: State) => State
	contactRequestEnqueued: (state: State) => State
	contactRequestSent: (state: State) => State
	contactRequestReceived: (state: State) => State
	contactRequestRefused: (state: State) => State
	contactRequestAccepted: (state: State) => State
	contactBlocked: (state: State) => State
	contactUnblocked: (state: State) => State

	contactAddAliasKey: (state: State) => State

	multiMemberAddMemberAliasProof: (state: State) => State
	multiMemberInitialMember: (state: State) => State
	multiMemberGrantAdminRole: (state: State) => State

	appNotSecureEvent: (state: State) => State
}

const initialState: State = {
	events: [],
	aggregates: {},
}

const commandHandler = createSlice<State, Commands>({
	name: 'protocol/client/command',
	initialState,
	reducers: {
		instanceExportData: (state) => state,
		instanceGetConfiguration: (state) => state,
		instanceLinkToExistingAccount: (state) => state,
		instanceInitiateNewAccount: (state) => state,

		contactRequestReference: (state) => state,
		contactRequestDisable: (state) => state,
		contactRequestEnable: (state) => state,
		contactRequestResetReference: (state) => state,
		contactRequestSend: (state) => state,
		contactRequestAccept: (state) => state,
		contactRequestIgnore: (state) => state,
		contactRequestRefuse: (state) => state,

		contactBlock: (state) => state,
		contactUnblock: (state) => state,
		contactAliasKeySend: (state) => state,

		multiMemberCreate: (state) => state,
		multiMemberJoin: (state) => state,
		multiMemberLeave: (state) => state,
		multiMemberAliasProofDisclose: (state) => state,
		multiMemberAdminRoleGrant: (state) => state,

		multiMemberCreateInvitation: (state) => state,
		appSendPermanentMessage: (state) => state,
		groupMetadataSubscribe: (state) => state,
		groupSecureMessageSubscribe: (state) => state,
	},
})

const eventHandler = createSlice<State, Events>({
	name: 'protocol/client/event',
	initialState,
	reducers: {
		instanceInitiatedNewAccount: (state, action) => {
			state.aggregates[action.payload.aggregateId] = {
				id: action.payload.aggregateId,
				accountGroupPk: action.payload.accountGroupPk,
				accountDevicePk: action.payload.accountDevicePk,
			}
			return state
		},

		groupAddMemberDevice: (state) => state,
		groupAddDeviceSecret: (state) => state,
		groupJoined: (state) => state,
		groupLeft: (state) => state,

		contactRequestDisabled: (state) => state,
		contactRequestEnabled: (state) => state,
		contactRequestReferenceReset: (state) => state,
		contactRequestEnqueued: (state) => state,
		contactRequestSent: (state) => state,
		contactRequestReceived: (state) => state,
		contactRequestRefused: (state) => state,
		contactRequestAccepted: (state) => state,
		contactBlocked: (state) => state,
		contactUnblocked: (state) => state,

		contactAddAliasKey: (state) => state,

		multiMemberAddMemberAliasProof: (state) => state,
		multiMemberInitialMember: (state) => state,
		multiMemberGrantAdminRole: (state) => state,

		appNotSecureEvent: (state) => state,
	},
})

export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)
export const commands = commandHandler.actions
export const events = eventHandler.actions
export const queries: Queries = {
	get: (state, { id }) => state.protocol.client.aggregates[id],
	getAll: (state) => Object.values(state.protocol.client.aggregates),
}

export function* orchestrator() {
	const services: { [key: string]: ProtocolServiceClient } = {}

	// start services
	const clients = (yield select(queries.getAll)) as Entity[]
	for (const client of clients) {
		services[client.id] = new ProtocolServiceClient(
			mockBridge(ProtocolServiceHandler, {
				accountGroupPk: client.accountGroupPk,
				accountDevicePk: client.accountDevicePk,
			}),
		)
	}

	yield all([
		takeLeading(commands.instanceExportData, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.instanceGetConfiguration, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.instanceLinkToExistingAccount, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.instanceInitiateNewAccount, function*(action) {
			services[action.payload.id] = new ProtocolServiceClient(mockBridge(ProtocolServiceHandler))
			yield cps(services[action.payload.id]?.instanceInitiateNewAccount, {})
			const {
				accountGroupPk,
				accountDevicePk,
			}: api.berty.protocol.InstanceGetConfiguration.IReply = yield cps(
				services[action.payload.id]?.instanceGetConfiguration,
				{},
			)
			yield put(
				events.instanceInitiatedNewAccount({
					aggregateId: action.payload.id,
					accountGroupPk: Buffer.from(accountGroupPk as Uint8Array).toString('base64'),
					accountDevicePk: Buffer.from(accountDevicePk as Uint8Array).toString('base64'),
				}),
			)
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
		takeLeading(commands.contactRequestSend, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.contactRequestAccept, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.contactRequestIgnore, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.contactRequestRefuse, function*() {
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
		takeLeading(commands.contactAliasKeySend, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),

		takeLeading(commands.multiMemberCreate, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.multiMemberJoin, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.multiMemberLeave, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.multiMemberAliasProofDisclose, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.multiMemberAdminRoleGrant, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),

		takeLeading(commands.multiMemberCreateInvitation, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.appSendPermanentMessage, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.groupMetadataSubscribe, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
		takeLeading(commands.groupSecureMessageSubscribe, function*() {
			// TODO: do protocol things
			// yield put(events.started)
		}),
	])
}
