import { ProtocolServiceClient, ProtocolServiceHandler, mockBridge } from '@berty-tech/grpc-bridge'
import { createSlice, Action } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { all, takeLeading, put, cps, select, fork, takeEvery } from 'redux-saga/effects'
import * as gen from './client.gen'
import * as api from '@berty-tech/api'
import { Buffer } from 'buffer'
import Case from 'case'

export type Entity = {
	id: string

	// needed for mvp
	accountPk: string
	devicePk: string
	accountGroupPk: string
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

export type Commands = gen.Commands<State> & {}

export type Queries = {
	get: (state: GlobalState, payload: { id: string }) => Entity
	getAll: (state: GlobalState) => Entity[]
}

export type Events = gen.Events<State> & {
	instanceGotConfiguration: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				accountPk: Uint8Array
				devicePk: Uint8Array
				accountGroupPk: Uint8Array
			}
		},
	) => State
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

		contactRequestReference: (state) => state,
		contactRequestDisable: (state) => state,
		contactRequestEnable: (state) => state,
		contactRequestResetReference: (state) => state,
		contactRequestSend: (state) => state,
		contactRequestAccept: (state) => state,
		contactRequestDiscard: (state) => state,

		contactBlock: (state) => state,
		contactUnblock: (state) => state,
		contactAliasKeySend: (state) => state,

		multiMemberGroupCreate: (state) => state,
		multiMemberGroupJoin: (state) => state,
		multiMemberGroupLeave: (state) => state,
		multiMemberGroupAliasResolverDisclose: (state) => state,
		multiMemberGroupAdminRoleGrant: (state) => state,

		multiMemberGroupInvitationCreate: (state) => state,

		appMetadataSend: (state) => state,
		appMessageSend: (state) => state,
		groupMetadataSubscribe: (state) => state,
		groupMessageSubscribe: (state) => state,
	},
})

const eventHandler = createSlice<State, Events>({
	name: 'protocol/client/event',
	initialState,
	reducers: {
		instanceGotConfiguration: (state, action) => {
			state.aggregates[action.payload.aggregateId] = {
				id: action.payload.aggregateId,
				accountPk: Buffer.from(action.payload.accountPk).toString(),
				devicePk: Buffer.from(action.payload.devicePk).toString(),
				accountGroupPk: Buffer.from(action.payload.accountGroupPk).toString(),
			}
			return state
		},

		undefined: (state) => state,

		groupMemberDeviceAdded: (state) => state,
		groupDeviceSecretAdded: (state) => state,

		accountGroupJoined: (state) => state,
		accountGroupLeft: (state) => state,

		accountContactRequestDisabled: (state) => state,
		accountContactRequestEnabled: (state) => state,
		accountContactRequestReferenceReset: (state) => state,
		accountContactRequestOutgoingEnqueued: (state) => state,
		accountContactRequestOutgoingSent: (state) => state,
		accountContactRequestIncomingReceived: (state) => state,
		accountContactRequestIncomingDiscarded: (state) => state,
		accountContactRequestIncomingAccepted: (state) => state,
		accountContactBlocked: (state) => state,
		accountContactUnblocked: (state) => state,

		contactAliasKeyAdded: (state) => state,

		multiMemberGroupAliasResolverAdded: (state) => state,
		multiMemberGroupInitialMemberAnnounced: (state) => state,
		multiMemberGroupAdminRoleGranted: (state) => state,

		groupMetadataPayloadSent: (state) => state,
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
						accountPk: client.accountPk,
						devicePk: client.devicePk,
						accountGroupPk: client.accountGroupPk,
					}),
				)
				// subcribe to account log
				yield put(
					commands.groupMetadataSubscribe({
						id: client.id,
						groupPk: new Buffer(client.accountGroupPk),
						since: new Uint8Array(),
						until: new Uint8Array(),
						goBackwards: false,
					}),
				)
			}
		},
		takeLeading(commands.instanceExportData, function*() {
			// TODO: do protocol things
		}),
		takeLeading(commands.instanceGetConfiguration, function*(action) {
			const client = yield select((state) => queries.get(state, { id: action.payload.id }))
			let [accountPk, devicePk, accountGroupPk] = [
				new Buffer(client?.accountPk || ''),
				new Buffer(client?.devicePk || ''),
				new Buffer(client?.accountGroupPk || ''),
			]
			if (client == null) {
				services[action.payload.id] = new ProtocolServiceClient(mockBridge(ProtocolServiceHandler))
				const reply: api.berty.protocol.InstanceGetConfiguration.IReply = yield cps(
					services[action.payload.id]?.instanceGetConfiguration,
					{},
				)
				accountPk = Buffer.from(reply.accountPk as Uint8Array)
				devicePk = Buffer.from(reply.devicePk as Uint8Array)
				accountGroupPk = Buffer.from(reply.accountGroupPk as Uint8Array)
			}

			yield put(
				events.instanceGotConfiguration({
					aggregateId: action.payload.id,
					accountPk,
					devicePk,
					accountGroupPk,
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
		takeLeading(commands.contactRequestDiscard, function*() {
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

		takeLeading(commands.multiMemberGroupCreate, function*() {
			// TODO: do protocol things
		}),
		takeLeading(commands.multiMemberGroupJoin, function*() {
			// TODO: do protocol things
		}),
		takeLeading(commands.multiMemberGroupLeave, function*() {
			// TODO: do protocol things
		}),
		takeLeading(commands.multiMemberGroupAliasResolverDisclose, function*() {
			// TODO: do protocol things
		}),
		takeLeading(commands.multiMemberGroupAdminRoleGrant, function*() {
			// TODO: do protocol things
		}),

		takeLeading(commands.multiMemberGroupInvitationCreate, function*() {
			// TODO: do protocol things
		}),
		takeLeading(commands.appMetadataSend, function*(action) {
			yield cps(services[action.payload.id]?.appMetadataSend, {
				groupPk: action.payload.groupPk,
				payload: action.payload.payload,
			})
		}),
		takeLeading(commands.appMessageSend, function*() {
			// TODO: do protocol things
		}),
		takeLeading(commands.groupMetadataSubscribe, function*(action) {
			services[action.payload.id]?.groupMetadataSubscribe(
				{
					groupPk: action.payload.groupPk,
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
						api.berty.protocol.EventType.EventTypeGroupMetadataPayloadSent
					) {
						put(JSON.parse(Buffer.from(response?.event).toString()))
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
		takeLeading(commands.groupMetadataSubscribe, function*() {
			// TODO: do protocol things
		}),
	])
}
