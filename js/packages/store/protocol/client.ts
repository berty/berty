import { ProtocolServiceClient, WebsocketTransport, bridge } from '@berty-tech/grpc-bridge'
import { GoBridge, GoBridgeOpts } from '@berty-tech/grpc-bridge/orbitdb/native'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { all, put, putResolve, cps, takeEvery, call, delay } from 'redux-saga/effects'
import { channel, Channel } from 'redux-saga'
import * as gen from './client.gen'
import * as api from '@berty-tech/api'
import Case from 'case'
import * as evgen from '../types/events.gen'
import { makeDefaultReducers, makeDefaultCommandsSagas, bufToStr, bufToJSON } from '../utils'
import ExternalTransport from './externalTransport'
import { getMainSettings } from '../settings/main'

export type Entity = {
	id: string
	contactRequestRdvSeed?: string
	accountPk: string
	devicePk: string
	accountGroupPk: string
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
	delete: (state: State, action: { payload: { id: string } }) => State
}

export type Queries = {
	get: (state: GlobalState, payload: { id: string }) => Entity
	getAll: (state: GlobalState) => Entity[]
}

export type Events = evgen.Events<State> & {
	started: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				accountPk: string
				devicePk: string
				accountGroupPk: string
			}
		},
	) => State
	contactRequestRdvSeedUpdated: (
		state: State,
		action: {
			payload: {
				aggregateId: string
				publicRendezvousSeed: string
			}
		},
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
} & {
	listenToGroupMetadata: (payload: { clientId: string; groupPk: Uint8Array }) => Generator
	listenToGroupMessages: (payload: { clientId: string; groupPk: Uint8Array }) => Generator
	listenToGroup: (payload: { clientId: string; groupPk: Uint8Array }) => Generator
	start: (payload: { id: string }) => Generator
	deleteService: (payload: { id: string }) => Generator
	restart: (payload: { id: string }) => Generator
}

const initialState: State = {
	aggregates: {},
}

const commandsNames = [...Object.keys(gen.Methods), 'start', 'delete']

const commandHandler = createSlice<State, Commands>({
	name: 'protocol/client/command',
	initialState,
	// we don't change state on commands
	reducers: makeDefaultReducers(commandsNames),
})

const eventsNames = [
	...Object.keys(evgen.EventsNames),
	'started',
	'deleted',
	'contactRequestRdvSeedUpdated',
]

const eventHandler = createSlice<State, Events>({
	name: 'protocol/client/event',
	initialState,
	reducers: {
		...makeDefaultReducers(eventsNames),
		started: (state, action) => {
			if (!state.aggregates[action.payload.aggregateId]) {
				state.aggregates[action.payload.aggregateId] = {
					id: action.payload.aggregateId,
					accountPk: action.payload.accountPk,
					devicePk: action.payload.devicePk,
					accountGroupPk: action.payload.accountGroupPk,
				}
			}
			return state
		},
		contactRequestRdvSeedUpdated: (state, { payload }) => {
			const client = state.aggregates[payload.aggregateId]
			if (client) {
				client.contactRequestRdvSeed = payload.publicRendezvousSeed
			}
			return state
		},
		deleted: (state, action) => {
			delete state.aggregates[action.payload.aggregateId]
			return state
		},
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
	return api.berty.types.EventType[value]
}

export const services: { [key: string]: ProtocolServiceClient } = {}
export const getService = (id: string) => {
	const service = services[id]
	if (!service) {
		throw new Error(`Service ${id} not found`)
	}
	return service
}

export const decodeMetadataEvent = (response: api.berty.types.IGroupMetadataEvent) => {
	const eventType = response?.metadata?.eventType
	if (eventType == null) {
		return undefined
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
	const protocol: { [key: string]: any } = api.berty.types
	const event = protocol[eventName.replace('EventType', '')] || protocol[eventsMap[eventName]]
	if (!event) {
		console.warn("Don't know how to decode", eventName)
		return undefined
	}
	const decodedEvent = event.decode(response.event)
	return decodedEvent
}

const makeMetadataHandler = (id: string, eventsChannel: Channel<unknown>) => (
	error: Error | null,
	response?: api.berty.types.IGroupMetadataEvent,
) => {
	if (error) {
		// TODO: log error
		throw error
	}
	if (!response) {
		eventsChannel.close()
		return
	}
	if (!response.event) {
		console.warn('No event')
		return
	}
	if (!response.eventContext?.id) {
		console.warn('No event cid')
		return
	}

	if (!response.metadata?.eventType) {
		console.warn('No eventtype')
		return
	}
	// if the event is defined by chat

	const eventType = response.metadata?.eventType
	if (eventType == null) {
		return
	}
	if (eventType === api.berty.types.EventType.EventTypeGroupMetadataPayloadSent) {
		eventsChannel.put(
			events.groupMetadataPayloadSent({
				aggregateId: id,
				eventContext: response.eventContext || {},
				metadata: response.metadata,
				event: bufToJSON(response.event),
			}),
		)
		return
	}
	const eventName = eventNameFromValue(eventType)
	if (eventName === undefined) {
		throw new Error(`Invalid event type ${eventType}`)
	}
	const type = `${eventHandler.name}/${Case.camel(eventName.replace('EventType', ''))}`
	eventsChannel.put({
		type,
		payload: {
			aggregateId: id,
			eventContext: response.eventContext,
			headers: response.metadata,
			event: decodeMetadataEvent(response),
		},
	})
}

const makeMessageHandler = (id: string, eventsChannel: Channel<unknown>) => (
	error: Error | null,
	response?: api.berty.types.IGroupMessageEvent,
) => {
	if (error) {
		// TODO: log error
		throw error
	}

	if (response === undefined) {
		eventsChannel.close()
		return
	}

	if (!response.eventContext?.id) {
		console.error('No event cid')
		return
	}

	const type = 'protocol/GroupMessageEvent'
	eventsChannel.put({
		type,
		payload: {
			aggregateId: id,
			eventContext: response.eventContext,
			headers: response.headers,
			message: response.message,
		},
	})
}

// call cps on the service method by default
const defaultTransactions = (Object.keys(gen.Methods) as (keyof gen.Commands<State>)[]).reduce(
	(txs, methodName) => {
		txs[methodName] = function*({ id, ...payload }: { id: string }) {
			return yield (cps as any)(getService(id)[methodName], payload)
		}
		return txs
	},
	{} as Transactions,
) as Transactions

export type BertyNodeConfig =
	| { type: 'external'; host: string; port: number }
	| { type: 'embedded'; opts: GoBridgeOpts }

export const defaultExternalBridgeConfig: BertyNodeConfig = {
	type: 'external',
	host: '127.0.0.1',
	port: 1337,
}

export const defaultBridgeOpts = {
	swarmListeners: ['/ip4/0.0.0.0/tcp/0', '/ip6/0.0.0.0/tcp/0'],
	grpcListeners: ['/ip4/127.0.0.1/tcp/0/grpcws'],
	logLevel: 'info',
	persistance: true,
}

export const transactions: Transactions = {
	...defaultTransactions,
	start: function*({ id }) {
		if (services[id] != null) {
			console.warn('service already exists')
			return
		}

		const { nodeConfig } = yield* getMainSettings(id)

		let brdg

		if (nodeConfig.type === 'external') {
			brdg = bridge({
				host: `http://${nodeConfig.host}:${nodeConfig.port}`,
				transport: ExternalTransport(),
			})
		} else {
			try {
				yield call(GoBridge.startProtocol, nodeConfig.opts)
			} catch (e) {
				if (e.domain !== 'already started') {
					throw new Error(e.domain)
				}
			}
			const addr = (yield call(GoBridge.getProtocolAddr)) as string
			brdg = bridge({
				host: `http://${addr}`,
				transport: WebsocketTransport(),
				debug: __DEV__,
			})
		}

		services[id] = new ProtocolServiceClient(brdg)

		// try to connect repeatedly since startBridge can return before the bridge is ready to serve
		let reply: api.berty.types.InstanceGetConfiguration.IReply
		while (true) {
			try {
				reply = (yield cps(
					services[id]?.instanceGetConfiguration,
					{},
				)) as api.berty.types.InstanceGetConfiguration.IReply
				break
			} catch (e) {
				console.warn(e)
			}
			yield delay(1000)
		}

		const { accountPk, devicePk, accountGroupPk } = reply
		if (!(accountPk && devicePk && accountGroupPk)) {
			throw new Error('Invalid instance data')
		}
		yield putResolve(
			events.started({
				aggregateId: id,
				accountPk: bufToStr(accountPk),
				devicePk: bufToStr(devicePk),
				accountGroupPk: bufToStr(accountGroupPk),
			}),
		)
	},
	deleteService: function*({ id }) {
		const service = getService(id)
		service.end()
		delete services[id]
	},
	restart: function*(payload) {
		yield* transactions.delete({ id: payload.id })
		yield call(GoBridge.stopProtocol)
		yield* transactions.start(payload)
	},
	delete: function*({ id }) {
		yield* transactions.deleteService({ id })
		yield put(events.deleted({ aggregateId: id }))
	},
	contactRequestReference: function*(payload) {
		const reply = (yield cps(
			getService(payload.id).contactRequestReference,
			{},
		)) as api.berty.types.ContactRequestReference.IReply
		if (reply.publicRendezvousSeed) {
			yield put(
				events.contactRequestRdvSeedUpdated({
					aggregateId: payload.id,
					publicRendezvousSeed: bufToStr(reply.publicRendezvousSeed),
				}),
			)
		}
		return reply
	},
	contactRequestEnable: function*(payload) {
		const reply = (yield cps(
			getService(payload.id).contactRequestEnable,
			{},
		)) as api.berty.types.ContactRequestEnable.IReply
		if (!reply.publicRendezvousSeed) {
			throw new Error(`Invalid reference ${reply.publicRendezvousSeed}`)
		}
		yield put(
			events.contactRequestRdvSeedUpdated({
				aggregateId: payload.id,
				publicRendezvousSeed: bufToStr(reply.publicRendezvousSeed),
			}),
		)
		return reply
	},
	groupMetadataSubscribe: function*({ id, groupPk }) {
		const eventsChannel = channel()
		getService(id).groupMetadataSubscribe({ groupPk }, makeMetadataHandler(id, eventsChannel))
		return eventsChannel
	},
	groupMessageSubscribe: function*({ id, groupPk }) {
		const eventsChannel = channel()
		getService(id).groupMessageSubscribe({ groupPk }, makeMessageHandler(id, eventsChannel))
		return eventsChannel
	},
	groupMetadataList: function*({ id, groupPk }) {
		const eventsChannel = channel()
		getService(id).groupMetadataList({ groupPk }, makeMetadataHandler(id, eventsChannel))
		return eventsChannel
	},
	groupMessageList: function*({ id, groupPk }) {
		const eventsChannel = channel()
		getService(id).groupMessageList({ groupPk }, makeMessageHandler(id, eventsChannel))
		return eventsChannel
	},
	listenToGroupMetadata: function*({ clientId, groupPk }) {
		const chan1 = yield* transactions.groupMetadataSubscribe({
			id: clientId,
			groupPk,
			// TODO: use last cursor
			since: new Uint8Array(),
			until: new Uint8Array(),
			goBackwards: false,
		})
		yield takeEvery(chan1, function*(action) {
			yield put(action)
			if (action.type === events.groupMetadataPayloadSent.type) {
				yield put((action as any).payload.event)
			}
		})
		const chan2 = yield* transactions.groupMetadataList({
			id: clientId,
			groupPk,
		})
		yield takeEvery(chan2, function*(action) {
			yield put(action)
			if (action.type === events.groupMetadataPayloadSent.type) {
				yield put((action as any).payload.event)
			}
		})
	},
	listenToGroupMessages: function*({ clientId, groupPk }) {
		const chan1 = yield* transactions.groupMessageSubscribe({
			id: clientId,
			groupPk,
			// TODO: use last cursor
			since: new Uint8Array(),
			until: new Uint8Array(),
			goBackwards: false,
		})
		yield takeEvery(chan1, function*(action) {
			yield put(action)
			if (action.type === events.groupMetadataPayloadSent.type) {
				yield put((action as any).payload.event)
			}
		})
		const chan2 = yield* transactions.groupMessageList({
			id: clientId,
			groupPk,
		})
		yield takeEvery(chan2, function*(action) {
			yield put(action)
			if (action.type === events.groupMetadataPayloadSent.type) {
				yield put((action as any).payload.event)
			}
		})
	},
	listenToGroup: function*(payload) {
		yield* transactions.listenToGroupMetadata(payload)
		yield* transactions.listenToGroupMessages(payload)
	},
}

export function* orchestrator() {
	yield all([...makeDefaultCommandsSagas(commands, transactions)])
}
