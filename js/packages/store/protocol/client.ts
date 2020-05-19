import { WebsocketTransport } from '@berty-tech/grpc-bridge'
import GoBridge, { GoBridgeOpts } from '@berty-tech/go-bridge'
import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { all, put, putResolve, call, delay, take, fork, join } from 'redux-saga/effects'
import { Task } from 'redux-saga'
import * as gen from './client.gen'
import * as api from '@berty-tech/api'
import Case from 'case'
import * as evgen from '../types/events.gen'
import { makeDefaultReducers, makeDefaultCommandsSagas, bufToStr } from '../utils'
import ExternalTransport from './externalTransport'
import { getMainSettings } from '../settings/main'
import ProtocolServiceSagaClient from './ProtocolServiceSagaClient.gen'
import * as bertytypes from './grpc-web-gen/bertytypes_pb'
import { grpc } from '@improbable-eng/grpc-web'
import { unaryChan, EventChannelOutput } from '../sagaUtils'

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

export const services: {
	[key: string]: ProtocolServiceSagaClient
} = {}
export const getService = (id: string) => {
	const service = services[id]
	if (!service) {
		throw new Error(`Service ${id} not found`)
	}
	return service
}

export const decodeMetadataEvent = (
	response: bertytypes.GroupMetadataEvent.AsObject | api.berty.types.IGroupMetadataEvent,
) => {
	const eventType = response.metadata?.eventType
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
	console.log('response.event', response.event)
	const decodedEvent = event.decode(response.event)
	return decodedEvent
}

const groupMetadataEventToReduxAction = (
	id: string,
	e: bertytypes.GroupMetadataEvent.AsObject | api.berty.types.IGroupMetadataEvent,
) => {
	if (!e.metadata?.eventType) {
		throw new Error('Invalid reply, missing eventType')
	}
	const { eventType } = e.metadata
	const eventName = eventNameFromValue(eventType)
	if (eventName === undefined) {
		throw new Error(`Invalid event type ${eventType}`)
	}
	const type = `${eventHandler.name}/${Case.camel(eventName.replace('EventType', ''))}`
	return {
		type,
		payload: {
			aggregateId: id,
			eventContext: e.eventContext,
			headers: e.metadata,
			event: decodeMetadataEvent(e),
		},
	}
}

const groupMessageEventToReduxAction = (
	id: string,
	response: api.berty.types.IGroupMessageEvent,
) => {
	if (!response.eventContext?.id) {
		throw new Error('No event cid')
	}

	const type = 'protocol/GroupMessageEvent'
	return {
		type,
		payload: {
			aggregateId: id,
			eventContext: response.eventContext,
			headers: response.headers,
			message: response.message,
		},
	}
}

// call cps on the service method by default
const defaultTransactions = (Object.keys(gen.Methods) as (keyof gen.Commands<State>)[]).reduce(
	(txs, methodName) => {
		txs[methodName] = function* ({ id, ...payload }: { id: string }) {
			return yield* unaryChan(getService(id)[methodName], payload)
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
	start: function* ({ id }) {
		if (services[id] != null) {
			console.warn('service already exists')
			return
		}

		const { nodeConfig } = yield* getMainSettings(id)

		let address
		let transport: () => grpc.TransportFactory

		if (nodeConfig.type === 'external') {
			address = `http://${nodeConfig.host}:${nodeConfig.port}`
			transport = ExternalTransport
		} else {
			try {
				yield call(GoBridge.startProtocol, nodeConfig.opts)
			} catch (e) {
				if (e.domain !== 'already started') {
					throw e
				}
			}
			const addr = (yield call(GoBridge.getProtocolAddr)) as string
			transport = WebsocketTransport
			address = `http://${addr}`
		}

		services[id] = new ProtocolServiceSagaClient(address, transport())

		const service = getService(id)

		console.log('getting conf')

		// try to connect repeatedly since startBridge can return before the bridge is ready to serve
		const reply = yield* unaryChan(service.instanceGetConfiguration)
		console.log('reply', reply)
		const { accountPk, devicePk, accountGroupPk } = reply
		console.log('accountPk', typeof accountPk, accountPk)
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
	deleteService: function* ({ id }) {
		delete services[id]
	},
	restart: function* (payload) {
		yield* transactions.delete({ id: payload.id })
		yield call(GoBridge.stopProtocol)
		yield* transactions.start(payload)
	},
	delete: function* ({ id }) {
		yield* transactions.deleteService({ id })
		yield put(events.deleted({ aggregateId: id }))
	},
	contactRequestReference: function* (payload) {
		const reply = yield* unaryChan(getService(payload.id).contactRequestReference)
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
	contactRequestEnable: function* (payload) {
		const reply = yield* unaryChan(getService(payload.id).contactRequestEnable)
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
	groupMetadataSubscribe: function* ({ id, ...req }) {
		const chan = getService(id).groupMetadataSubscribe(req)
		while (true) {
			const reply = (yield take(chan)) as EventChannelOutput<typeof chan>
			yield put(groupMetadataEventToReduxAction(id, reply))
		}
	},
	groupMessageSubscribe: function* ({ id, ...req }) {
		const chan = getService(id).groupMessageSubscribe(req)
		while (true) {
			const reply = (yield take(chan)) as EventChannelOutput<typeof chan>
			yield put(groupMessageEventToReduxAction(id, reply))
		}
	},
	groupMetadataList: function* ({ id, ...req }) {
		const chan = getService(id).groupMetadataList(req)
		while (true) {
			const reply = (yield take(chan)) as EventChannelOutput<typeof chan>
			yield put(groupMetadataEventToReduxAction(id, reply))
		}
	},
	groupMessageList: function* ({ id, ...req }) {
		const chan = getService(id).groupMessageList(req)
		while (true) {
			const reply = (yield take(chan)) as EventChannelOutput<typeof chan>
			yield put(groupMessageEventToReduxAction(id, reply))
		}
	},
	listenToGroupMetadata: function* ({ clientId, groupPk }) {
		const subscribeTask = (yield fork(function* () {
			while (true) {
				try {
					yield call(transactions.groupMetadataSubscribe, {
						id: clientId,
						groupPk,
						// TODO: use last cursor
						since: new Uint8Array(),
						until: new Uint8Array(),
						goBackwards: false,
					})
				} catch (e) {
					console.warn(e)
				}
				yield delay(1000)
			}
		})) as Task

		let done = false
		while (!done) {
			try {
				yield call(transactions.groupMetadataList, {
					id: clientId,
					groupPk,
				})
				done = true
			} catch (e) {
				console.warn(e)
			}
		}

		yield join(subscribeTask)
	},
	listenToGroupMessages: function* ({ clientId, groupPk }) {
		const subscribeTask = (yield fork(function* () {
			while (true) {
				try {
					yield call(transactions.groupMessageSubscribe, {
						id: clientId,
						groupPk,
						// TODO: use last cursor
						since: new Uint8Array(),
						until: new Uint8Array(),
						goBackwards: false,
					})
				} catch (e) {
					console.warn(e)
				}
				yield delay(1000)
			}
		})) as Task

		let done = false
		while (!done) {
			try {
				yield call(transactions.groupMessageList, {
					id: clientId,
					groupPk,
				})
				done = true
			} catch (e) {
				console.warn(e)
			}
		}

		yield join(subscribeTask)
	},
	listenToGroup: function* (payload) {
		const metadataTask = (yield fork(transactions.listenToGroupMetadata, payload)) as Task
		const messagesTask = (yield fork(transactions.listenToGroupMessages, payload)) as Task
		yield join([metadataTask, messagesTask])
	},
}

export function* orchestrator() {
	yield all([...makeDefaultCommandsSagas(commands, transactions)])
}
