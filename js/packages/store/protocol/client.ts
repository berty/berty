import { ProtocolServiceClient, ProtocolServiceHandler, mockBridge } from '@berty-tech/grpc-bridge'
import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { all, takeLeading, put, cps, select, takeEvery, take } from 'redux-saga/effects'
import { channel } from 'redux-saga'
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
	[key: string]: any
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
	contactRequestReferenceUpdated: CaseReducer<
		State,
		PayloadAction<{ aggregateId: string; reference?: Uint8Array }>
	>
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
		contactRequestReferenceUpdated: (state) => state,
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

const eventNameFromValue = (value: number) => {
	if (typeof value !== 'number') {
		throw new Error(`client.ts: eventNameFromValue: expected number argument, got ${typeof value}`)
	}
	return api.berty.protocol.EventType[value]
}

export function* orchestrator() {
	const services: { [key: string]: ProtocolServiceClient } = {}
	const getService = (id: string) => {
		const service = services[id]
		if (!service) {
			throw new Error(`Service ${id} not found`)
		}
		return service
	}

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
				// subcribe to account log, this is never called as far as I'm aware
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
		takeEvery(events.instanceGotConfiguration, function*({ payload }) {
			yield put(
				commands.groupMetadataSubscribe({
					id: payload.aggregateId,
					groupPk: new Buffer(payload.accountGroupPk),
					since: new Uint8Array(),
					until: new Uint8Array(),
					goBackwards: false,
				}),
			)
		}),
		takeLeading(commands.contactRequestReference, function*() {
			throw new Error('Not implemented since there is no way to propagate the reply properly')
		}),
		takeLeading(commands.contactRequestDisable, function*({ payload }) {
			yield cps(getService(payload.id).contactRequestDisable, {})
			yield put(
				events.contactRequestReferenceUpdated({
					aggregateId: payload.id,
					reference: undefined,
				}),
			)
		}),
		takeLeading(commands.contactRequestEnable, function*({ payload }) {
			const reply = yield cps(getService(payload.id).contactRequestEnable, {})
			if (!reply.reference) {
				throw new Error(`Invalid reference ${reply.reference}`)
			}
			yield put(
				events.contactRequestReferenceUpdated({
					aggregateId: payload.id,
					reference: reply.reference,
				}),
			)
		}),
		takeLeading(commands.contactRequestResetReference, function*({ payload }) {
			const reply = yield cps(getService(payload.id).contactRequestResetReference, {})
			if (!reply.reference) {
				throw new Error(`Invalid reference ${reply.reference}`)
			}
			yield put(
				events.contactRequestReferenceUpdated({
					aggregateId: payload.id,
					reference: reply.reference,
				}),
			)
		}),
		takeLeading(commands.contactRequestSend, function*({ payload }) {
			yield cps(getService(payload.id).contactRequestSend, {
				reference: payload.reference,
				contactMetadata: payload.contactMetadata,
			})
		}),
		takeLeading(commands.contactRequestAccept, function*({ payload }) {
			yield cps(getService(payload.id).contactRequestAccept, {
				contactPk: payload.contactPk,
			})
		}),
		takeLeading(commands.contactRequestDiscard, function*({ payload }) {
			yield cps(getService(payload.id).contactRequestDiscard, {
				contactPk: payload.contactPk,
			})
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
		takeLeading(commands.appMetadataSend, function*({ payload }) {
			yield cps(getService(payload.id).appMetadataSend, {
				groupPk: payload.groupPk,
				payload: payload.payload,
			})
		}),
		takeLeading(commands.appMessageSend, function*() {
			// TODO: do protocol things
		}),
		takeEvery(commands.groupMetadataSubscribe, function*({ payload }) {
			const eventsChannel = channel()
			getService(payload.id).groupMetadataSubscribe(
				{
					groupPk: payload.groupPk,
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

					const eventType = response?.metadata?.eventType
					if (eventType == null) {
						return
					}

					if (eventType === api.berty.protocol.EventType.EventTypeGroupMetadataPayloadSent) {
						eventsChannel.put(JSON.parse(Buffer.from(response.event).toString()))
						return
					}

					const eventsMap: { [key: string]: string } = {
						EventTypeAccountContactRequestIncomingReceived: 'AccountContactRequestReceived',
						EventTypeAccountContactRequestIncomingAccepted: 'AccountContactRequestAccepted',
						EventTypeAccountContactRequestIncomingDiscarded: 'AccountContactRequestDiscarded',
						EventTypeAccountContactRequestOutgoingEnqueued: 'AccountContactRequestEnqueued',
						EventTypeAccountContactRequestOutgoingSent: 'AccountContactRequestSent',
					}
					const eventName = eventNameFromValue(eventType)
					if (eventName === undefined) {
						throw new Error(`Invalid event type ${eventType}`)
					}
					const protocol: { [key: string]: any } = api.berty.protocol
					const event = protocol[eventName] || protocol[eventsMap[eventName]]
					if (!event) {
						console.warn("Don't know how to decode", eventName)
						return
					}
					eventsChannel.put({
						type: `${eventHandler.name}/${Case.camel(eventName.replace('EventType', ''))}`,
						payload: {
							aggregateId: `${payload.id}`,
							eventContext: response.eventContext,
							headers: response.metadata,
							event: event.decode(response.event),
						},
					})
				},
			)
			while (true) {
				// TODO: need a way to cancel
				const action = yield take(eventsChannel)
				yield put(action)
			}
		}),
	])
}
