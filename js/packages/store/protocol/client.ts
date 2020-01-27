import { ProtocolServiceClient, ProtocolServiceHandler, mockBridge } from '@berty-tech/grpc-bridge'
import { createSlice, Action } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { all, takeLeading, put, cps, select, fork, takeEvery } from 'redux-saga/effects'
import * as api from '@berty-tech/api'
import { Buffer } from 'buffer'
import Case from 'case'

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
	appSendPermanentMessage: (
		state: State,
		action: {
			payload: {
				id: string
				groupPk: string
				payload: {}
			}
		},
	) => State
	appSendSecureMessage: (state: State) => State
	groupMetadataSubscribe: (
		state: State,
		action: { payload: { id: string; groupPk: string } },
	) => State
	groupSecureMessageSubscribe: (
		state: State,
		action: { payload: { id: string; groupPk: string } },
	) => State
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
		appSendSecureMessage: (state) => state,
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

	yield all([
		function*() {
			// start services
			const clients = (yield select(queries.getAll)) as Entity[]
			for (const client of clients) {
				services[client.id] = new ProtocolServiceClient(
					// TODO: use bridge instead of mockBridge when bertyprotocol will be done
					mockBridge(ProtocolServiceHandler, {
						accountGroupPk: client.accountGroupPk,
						accountDevicePk: client.accountDevicePk,
					}),
				)
				// subcribe to account log
				yield put(
					commands.groupSecureMessageSubscribe({ id: client.id, groupPk: client.accountGroupPk }),
				)
			}
		},
		takeLeading(commands.instanceExportData, function*() {
			// TODO: do protocol things
		}),
		takeLeading(commands.instanceGetConfiguration, function*() {
			// TODO: do protocol things
		}),
		takeLeading(commands.instanceLinkToExistingAccount, function*() {
			// TODO: do protocol things
		}),
		takeLeading(commands.instanceInitiateNewAccount, function*(action) {
			services[action.payload.id] = new ProtocolServiceClient(mockBridge(ProtocolServiceHandler))
			yield cps(services[action.payload.id]?.instanceInitiateNewAccount, {})
			// needed for fake protocol handler to work
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
		}),
		takeLeading(commands.contactRequestDisable, function*() {
			// TODO: do protocol things
		}),
		takeLeading(commands.contactRequestEnable, function*() {
			// TODO: do protocol things
		}),
		takeLeading(commands.contactRequestResetReference, function*() {
			// TODO: do protocol things
		}),
		takeLeading(commands.contactRequestSend, function*() {
			// TODO: do protocol things
		}),
		takeLeading(commands.contactRequestAccept, function*() {
			// TODO: do protocol things
		}),
		takeLeading(commands.contactRequestIgnore, function*() {
			// TODO: do protocol things
		}),
		takeLeading(commands.contactRequestRefuse, function*() {
			// TODO: do protocol things
		}),

		takeLeading(commands.contactBlock, function*() {
			// TODO: do protocol things
		}),
		takeLeading(commands.contactUnblock, function*() {
			// TODO: do protocol things
		}),
		takeLeading(commands.contactAliasKeySend, function*() {
			// TODO: do protocol things
		}),

		takeLeading(commands.multiMemberCreate, function*() {
			// TODO: do protocol things
		}),
		takeLeading(commands.multiMemberJoin, function*() {
			// TODO: do protocol things
		}),
		takeLeading(commands.multiMemberLeave, function*() {
			// TODO: do protocol things
		}),
		takeLeading(commands.multiMemberAliasProofDisclose, function*() {
			// TODO: do protocol things
		}),
		takeLeading(commands.multiMemberAdminRoleGrant, function*() {
			// TODO: do protocol things
		}),

		takeLeading(commands.multiMemberCreateInvitation, function*() {
			// TODO: do protocol things
		}),
		takeLeading(commands.appSendPermanentMessage, function*(action) {
			yield cps(services[action.payload.id]?.appSecureMessage, {
				groupPk: new Buffer(action.payload.groupPk, 'base64'),
				payload: new Buffer(JSON.stringify(action.payload.payload), 'base64'),
			})
		}),
		takeLeading(commands.appSendSecureMessage, function*() {
			// TODO: do protocol things
		}),
		takeLeading(commands.groupMetadataSubscribe, function*(action) {
			services[action.payload.id]?.groupMetadataSubscribe(
				{
					groupPk: new Buffer(action.payload.groupPk, 'base64'),
				},
				(error, response) => {
					if (error) {
						// TODO: log error
						return
					}
					if (!response?.event) {
						return
					}
					if (!response?.metadata?.eventType) {
						return
					}
					// if the event is defined by chat
					if (
						response?.metadata?.eventType ===
						api.berty.protocol.EventType.EventTypeAppNotSecureEvent
					) {
						put(JSON.parse(Buffer.from(response?.event).toString('base64')))
						return
					}
					const eventType = response?.metadata?.eventType
						.toString()
						.split('EventType')
						.pop()
					if (eventType == null) {
						return
					}
					put({
						type: `${eventHandler.name}/${Case.camel(eventType)}`,
						payload: {
							aggregateId: action.payload.id,
							eventContext: response.eventContext,
							headers: response.metadata,
							event: (api.berty.protocol as { [key: string]: any })[eventType].decode(
								response.event,
							),
						},
					})
				},
			)
		}),
		takeLeading(commands.groupSecureMessageSubscribe, function*() {
			// TODO: do protocol things
		}),

		// hack inexistant events from protocol api
		takeEvery(events.instanceInitiatedNewAccount, function*(action) {
			yield put(
				commands.appSendPermanentMessage({
					id: action.payload.aggregateId,
					groupPk: action.payload.accountGroupPk,
					payload: action,
				}),
			)
			// subscribe to account log
			yield put(
				commands.groupSecureMessageSubscribe({
					id: action.payload.aggregateId,
					groupPk: action.payload.accountGroupPk,
				}),
			)
		}),
	])
}
