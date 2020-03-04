import {
	ProtocolServiceClient,
	mockBridge,
	protocolServiceHandlerFactory,
} from '@berty-tech/grpc-bridge'
import { RPCImpl } from 'protobufjs'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import {
	all,
	takeLeading,
	put,
	putResolve,
	cps,
	takeEvery,
	take,
	call,
	select,
} from 'redux-saga/effects'
import { channel } from 'redux-saga'
import * as gen from './client.gen'
import * as api from '@berty-tech/api'
import { Buffer } from 'buffer'
import Case from 'case'

export type Entity = {
	id: string
	contactRequestReference?: string
	accountPk: string
	devicePk: string
	accountGroupPk: string
	lastMetadataCids: { [key: string]: string }
	//
	lastMessageCids: { [key: string]: string }
}

export type Event = {}

export type State = {
	aggregates: { [key: string]: Entity }
}

export type GlobalState = {
	protocol: {
		client: State
	}
}

export type Commands = gen.Commands<State> & {
	start: (state: State, action: { payload: { id: string } }) => State
	delete: (state: State, action: { payload: { id: string } }) => State
}

export type Queries = {
	get: (state: GlobalState, payload: { id: string }) => Entity
	getAll: (state: GlobalState) => Entity[]
}

export type Events = gen.Events<State> & {
	started: (
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
	contactRequestReferenceUpdated: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				reference: Uint8Array
			}
		},
	) => State
	lastMetadataCidUpdated: (
		state: State,
		action: { payload: { aggregateId: string; groupPk: string; cid: string } },
	) => State
	lastMessageCidUpdated: (
		state: State,
		action: { payload: { aggregateId: string; groupPk: string; cid: string } },
	) => State
	deleted: (state: State, action: PayloadAction<{ aggregateId: string }>) => State
}

export type Transactions = {
	[K in keyof Commands]: Commands[K] extends (
		state: State,
		action: { payload: infer TPayload },
	) => State
		? (payload: TPayload) => Generator
		: never
}

const initialState: State = {
	aggregates: {},
}

const commandHandler = createSlice<State, Commands>({
	name: 'protocol/client/command',
	initialState,
	reducers: {
		start: (state) => state,
		delete: (state) => state,
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

const intoBuffer = (
	thing: Buffer | Uint8Array | { [key: string]: number } | { [key: number]: number },
): Buffer => {
	// redux-test-recorder f up the Uint8Arrays so we have to use this monster
	if (thing instanceof Buffer) {
		return thing
	}
	if (thing instanceof Uint8Array) {
		return Buffer.from(thing)
	}
	return Buffer.from(Object.values(thing))
}

const eventHandler = createSlice<State, Events>({
	name: 'protocol/client/event',
	initialState,
	reducers: {
		started: (state, action) => {
			const client = state.aggregates[action.payload.aggregateId]
			state.aggregates[action.payload.aggregateId] = {
				id: action.payload.aggregateId,
				accountPk: Buffer.from(action.payload.accountPk).toString(),
				devicePk: Buffer.from(action.payload.devicePk).toString(),
				accountGroupPk: Buffer.from(action.payload.accountGroupPk).toString(),
				lastMetadataCids: client ? client.lastMetadataCids : {},
				lastMessageCids: client ? client.lastMessageCids : {},
				contactRequestReference: client ? client.contactRequestReference : undefined,
			}
			return state
		},
		contactRequestReferenceUpdated: (state, { payload }) => {
			state.aggregates[payload.aggregateId].contactRequestReference = intoBuffer(
				payload.reference,
			).toString('base64')
			return state
		},
		deleted: (state, action) => {
			delete state.aggregates[action.payload.aggregateId]
			return state
		},
		lastMetadataCidUpdated: (state, action) => {
			if (state.aggregates[action.payload.aggregateId]) {
				state.aggregates[action.payload.aggregateId].lastMetadataCids[action.payload.groupPk] =
					action.payload.cid
			}
			return state
		},
		lastMessageCidUpdated: (state, action) => {
			if (state.aggregates[action.payload.aggregateId]) {
				state.aggregates[action.payload.aggregateId].lastMessageCids[action.payload.groupPk] =
					action.payload.cid
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

const eventNameFromValue = (value: number) => {
	if (typeof value !== 'number') {
		throw new Error(`client.ts: eventNameFromValue: expected number argument, got ${typeof value}`)
	}
	return api.berty.protocol.EventType[value]
}

const services: { [key: string]: ProtocolServiceClient } = {}
const getService = (id: string) => {
	const service = services[id]
	if (!service) {
		throw new Error(`Service ${id} not found`)
	}
	return service
}

export const transactions: Transactions = {
	start: function*({ id }) {
		if (services[id] != null) {
			return
		}

		const client = (yield select((state) => queries.get(state, { id }))) as Entity | undefined
		const bridge = (yield call(mockBridge, protocolServiceHandlerFactory, !!client)) as RPCImpl
		services[id] = new ProtocolServiceClient(bridge)

		const { accountPk, devicePk, accountGroupPk } = (yield cps(
			services[id]?.instanceGetConfiguration,
			{},
		)) as api.berty.protocol.InstanceGetConfiguration.IReply
		yield putResolve(
			events.started({
				aggregateId: id,
				accountPk: accountPk as Uint8Array,
				devicePk: devicePk as Uint8Array,
				accountGroupPk: accountGroupPk as Uint8Array,
			}),
		)
	},
	delete: function*({ id }) {
		services[id]?.end()
		yield put(events.deleted({ aggregateId: id }))
	},
	instanceGetConfiguration: function*(payload) {
		// do protocol things
	},
	instanceExportData: function*(payload) {
		// do protocol things
	},
	contactRequestReference: function*(payload) {
		// do protocol things
	},
	contactRequestDisable: function*(payload) {
		// do protocol things
	},
	contactRequestEnable: function*(payload) {
		const reply = (yield cps(
			getService(payload.id).contactRequestEnable,
			{},
		)) as api.berty.protocol.ContactRequestEnable.IReply
		if (!reply.reference) {
			throw new Error(`Invalid reference ${reply.reference}`)
		}
		yield put(
			events.contactRequestReferenceUpdated({
				aggregateId: payload.id,
				reference: reply.reference,
			}),
		)
		return reply
	},
	contactRequestResetReference: function*(payload) {
		// do protocol things
	},
	contactRequestSend: function*(payload) {
		return yield cps(getService(payload.id).contactRequestSend, {
			reference: payload.reference,
			contactMetadata: payload.contactMetadata,
		})
	},
	contactRequestAccept: function*(payload) {
		return yield cps(getService(payload.id).contactRequestAccept, {
			contactPk: payload.contactPk,
		})
	},
	contactRequestDiscard: function*(payload) {
		return yield cps(getService(payload.id).contactRequestDiscard, {
			contactPk: payload.contactPk,
		})
	},

	contactBlock: function*(payload) {
		// do protocol things
	},
	contactUnblock: function*(payload) {
		// do protocol things
	},
	contactAliasKeySend: function*(payload) {
		// do protocol things
	},

	multiMemberGroupCreate: function*(payload) {
		return yield cps(getService(payload.id).multiMemberGroupCreate, {})
	},
	multiMemberGroupJoin: function*(payload) {
		return yield cps(getService(payload.id).multiMemberGroupJoin, { group: payload.group })
	},
	multiMemberGroupLeave: function*(payload) {
		// do protocol things
	},
	multiMemberGroupAliasResolverDisclose: function*(payload) {
		// do protocol things
	},
	multiMemberGroupAdminRoleGrant: function*(payload) {
		// do protocol things
	},

	multiMemberGroupInvitationCreate: function*(payload) {
		// do protocol things
	},
	appMetadataSend: function*(payload) {
		return yield cps(getService(payload.id).appMetadataSend, {
			groupPk: payload.groupPk,
			payload: payload.payload,
		})
	},
	appMessageSend: function*(payload) {
		return yield cps(getService(payload.id).appMessageSend, {
			groupPk: payload.groupPk,
			payload: payload.payload,
		})
	},
	groupMetadataSubscribe: function*(payload) {
		const eventsChannel = channel()
		const client = (yield select((state) => queries.get(state, { id: payload.id }))) as
			| Entity
			| undefined
		if (!client) {
			throw new Error(`Unknown client ${payload.id}`)
		}
		const groupPkStr = Buffer.from(payload.groupPk).toString('utf-8')
		const sinceStr = client.lastMetadataCids[groupPkStr]
		getService(payload.id).groupMetadataSubscribe(
			{
				groupPk: payload.groupPk,
				since: sinceStr ? Buffer.from(sinceStr, 'utf-8') : undefined,
			},
			(error, response) => {
				if (error) {
					// TODO: log error
					throw error
				}
				if (!response?.event) {
					console.error('No event')
					return
				}
				if (!response?.eventContext?.id) {
					console.error('No event cid')
					return
				}

				const cidStr = Buffer.from(response.eventContext.id).toString('utf-8')
				eventsChannel.put(
					events.lastMetadataCidUpdated({
						aggregateId: payload.id,
						groupPk: groupPkStr,
						cid: cidStr,
					}),
				)

				if (!response?.metadata?.eventType) {
					console.error('No eventtype')
					return
				}
				// if the event is defined by chat

				const eventType = response?.metadata?.eventType
				if (eventType == null) {
					return
				}
				if (eventType === api.berty.protocol.EventType.EventTypeGroupMetadataPayloadSent) {
					eventsChannel.put(
						events.groupMetadataPayloadSent({
							aggregateId: `${payload.id}`,
							eventContext: response.eventContext || {},
							metadata: response.metadata,
							event: JSON.parse(Buffer.from(response.event).toString()),
						}),
					)
					return
				}

				const eventsMap: { [key: string]: string } = {
					EventTypeAccountContactRequestIncomingReceived: 'AccountContactRequestReceived',
					EventTypeAccountContactRequestIncomingAccepted: 'AccountContactRequestAccepted',
					EventTypeAccountContactRequestIncomingDiscarded: 'AccountContactRequestDiscarded',
					EventTypeAccountContactRequestOutgoingEnqueued: 'AccountContactRequestEnqueued',
					EventTypeAccountContactRequestOutgoingSent: 'AccountContactRequestSent',
					EventTypeGroupMemberDeviceAdded: 'GroupAddMemberDevice',
				}
				const eventName = eventNameFromValue(eventType)
				if (eventName === undefined) {
					throw new Error(`Invalid event type ${eventType}`)
				}
				const protocol: { [key: string]: any } = api.berty.protocol
				const event = protocol[eventName.replace('EventType', '')] || protocol[eventsMap[eventName]]
				if (!event) {
					console.warn("Don't know how to decode", eventName)
					return
				}
				const type = `${eventHandler.name}/${Case.camel(eventName.replace('EventType', ''))}`
				eventsChannel.put({
					type,
					payload: {
						aggregateId: `${payload.id}`,
						eventContext: response.eventContext,
						headers: response.metadata,
						event: event.decode(response.event),
					},
				})
			},
		)
		return eventsChannel
	},
	groupMessageSubscribe: function*(payload) {
		const eventsChannel = channel()
		const client = (yield select((state) => queries.get(state, { id: payload.id }))) as
			| Entity
			| undefined
		if (!client) {
			throw new Error(`Unknown client ${payload.id}`)
		}
		const groupPkStr = Buffer.from(payload.groupPk).toString('utf-8')
		const sinceStr = client.lastMessageCids[groupPkStr]
		getService(payload.id).groupMessageSubscribe(
			{
				groupPk: payload.groupPk,
				since: sinceStr ? Buffer.from(sinceStr, 'utf-8') : undefined,
			},
			(error, response) => {
				if (error) {
					// TODO: log error
					throw error
				}

				if (!response?.eventContext?.id) {
					console.error('No event cid')
					return
				}

				const cidStr = Buffer.from(response.eventContext.id).toString('utf-8')
				eventsChannel.put(
					events.lastMessageCidUpdated({
						aggregateId: payload.id,
						groupPk: groupPkStr,
						cid: cidStr,
					}),
				)

				const type = 'protocol/GroupMessageEvent'
				eventsChannel.put({
					type,
					payload: {
						aggregateId: `${payload.id}`,
						eventContext: response.eventContext,
						headers: response.headers,
						message: response.message,
					},
				})
			},
		)
		return eventsChannel
	},
}

export function* orchestrator() {
	yield all([
		takeLeading(commands.start, function*(action) {
			yield* transactions.start(action.payload)
		}),
		takeLeading(commands.delete, function*(action) {
			yield* transactions.delete(action.payload)
		}),
		takeLeading(commands.instanceExportData, function*(action) {
			yield* transactions.instanceExportData(action.payload)
		}),

		takeLeading(commands.contactRequestReference, function*(action) {
			yield* transactions.contactRequestReference(action.payload)
		}),
		takeLeading(commands.contactRequestDisable, function*(action) {
			yield* transactions.contactRequestDisable(action.payload)
		}),
		takeLeading(commands.contactRequestEnable, function*(action) {
			yield* transactions.contactRequestEnable(action.payload)
		}),
		takeLeading(commands.contactRequestResetReference, function*(action) {
			yield* transactions.contactRequestResetReference(action.payload)
		}),
		takeLeading(commands.contactRequestSend, function*(action) {
			yield* transactions.contactRequestSend(action.payload)
		}),
		takeLeading(commands.contactRequestAccept, function*(action) {
			yield* transactions.contactRequestAccept(action.payload)
		}),
		takeLeading(commands.contactRequestDiscard, function*(action) {
			yield* transactions.contactRequestDiscard(action.payload)
		}),

		takeLeading(commands.contactBlock, function*(action) {
			yield* transactions.contactBlock(action.payload)
		}),
		takeLeading(commands.contactUnblock, function*(action) {
			yield* transactions.contactUnblock(action.payload)
		}),
		takeLeading(commands.contactAliasKeySend, function*(action) {
			yield* transactions.contactAliasKeySend(action.payload)
		}),

		takeLeading(commands.multiMemberGroupCreate, function*(action) {
			yield* transactions.multiMemberGroupCreate(action.payload)
		}),
		takeLeading(commands.multiMemberGroupJoin, function*(action) {
			yield* transactions.multiMemberGroupJoin(action.payload)
		}),
		takeLeading(commands.multiMemberGroupLeave, function*(action) {
			yield* transactions.multiMemberGroupLeave(action.payload)
		}),
		takeLeading(commands.multiMemberGroupAliasResolverDisclose, function*(action) {
			yield* transactions.multiMemberGroupAliasResolverDisclose(action.payload)
		}),
		takeLeading(commands.multiMemberGroupAdminRoleGrant, function*(action) {
			yield* transactions.multiMemberGroupAdminRoleGrant(action.payload)
		}),

		takeLeading(commands.multiMemberGroupInvitationCreate, function*(action) {
			yield* transactions.multiMemberGroupInvitationCreate(action.payload)
		}),
		takeLeading(commands.appMetadataSend, function*(action) {
			yield* transactions.appMetadataSend(action.payload)
		}),
		takeLeading(commands.appMessageSend, function*(action) {
			yield* transactions.appMessageSend(action.payload)
		}),
		takeEvery(commands.groupMetadataSubscribe, function*(action) {
			yield* transactions.groupMetadataSubscribe(action.payload)
		}),
		takeLeading(commands.groupMessageSubscribe, function*(action) {
			yield* transactions.groupMessageSubscribe(action.payload)
		}),
	])
}
