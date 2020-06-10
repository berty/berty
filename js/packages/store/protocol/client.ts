import { WebsocketTransport } from '@berty-tech/grpc-bridge'
import GoBridge, { GoBridgeOpts, GoLogLevel } from '@berty-tech/go-bridge'
import { createSlice, PayloadAction, CaseReducer } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { all, put, putResolve, call, delay, take, fork, join, takeEvery } from 'redux-saga/effects'
import { Task } from 'redux-saga'
import * as gen from './client.gen'
import * as messengerGen from '../messenger/client.gen'
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
import MessengerServiceSagaClient from '../messenger/MessengerServiceSagaClient.gen'
import { transactions as groupsTransactions, events as groupsEvents } from '../groups'

export type Entity = {
	id: string
	contactRequestRdvSeed?: string
	deepLink?: string
	htmlUrl?: string
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

export type Commands = gen.Commands<State> &
	messengerGen.Commands<State> & {
		delete: CaseReducer<State, PayloadAction<{ id: string }>>
	}

export type Queries = {
	get: (state: GlobalState, payload: { id: string }) => Entity
	getAll: (state: GlobalState) => Entity[]
}

export type Events = evgen.Events<State> & {
	started: CaseReducer<
		State,
		PayloadAction<{
			aggregateId: string
			accountPk: string
			devicePk: string
			accountGroupPk: string
		}>
	>
	contactRequestRdvSeedUpdated: CaseReducer<
		State,
		PayloadAction<{
			aggregateId: string
			publicRendezvousSeed: string
		}>
	>
	instanceShareableBertyIdUpdated: CaseReducer<
		State,
		PayloadAction<{
			aggregateId: string
			instanceShareableBertyId: api.berty.messenger.InstanceShareableBertyID.IReply
		}>
	>
	deleted: CaseReducer<State, PayloadAction<{ aggregateId: string }>>
}

export type Transactions = {
	[K in keyof Commands]: Commands[K] extends CaseReducer<State, PayloadAction<infer TPayload>>
		? (payload: TPayload) => Generator
		: never
} & {
	listenToGroupMetadata: (payload: { clientId: string; groupPk: Uint8Array }) => Generator
	listenToGroupMessages: (payload: { clientId: string; groupPk: Uint8Array }) => Generator
	listenToGroup: (payload: { clientId: string; groupPk: Uint8Array }) => Generator
	start: (payload: { id: string; name: string }) => Generator
	deleteService: (payload: { id: string }) => Generator
	restart: (payload: { id: string }) => Generator
}

const initialState: State = {
	aggregates: {},
}

const commandsNames = [...Object.keys(gen.Methods), ...Object.keys(messengerGen.Methods), 'delete']

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

const started: CaseReducer<
	State,
	PayloadAction<{
		aggregateId: string
		accountPk: string
		devicePk: string
		accountGroupPk: string
	}>
> = (state, action) => {
	if (!state.aggregates[action.payload.aggregateId]) {
		state.aggregates[action.payload.aggregateId] = {
			id: action.payload.aggregateId,
			accountPk: action.payload.accountPk,
			devicePk: action.payload.devicePk,
			accountGroupPk: action.payload.accountGroupPk,
		}
	}
	return state
}

const eventHandler = createSlice<State, Events>({
	name: 'protocol/client/event',
	initialState,
	reducers: {
		...makeDefaultReducers(eventsNames),
		started,
		contactRequestRdvSeedUpdated: (state, { payload }) => {
			const client = state.aggregates[payload.aggregateId]
			if (client) {
				client.contactRequestRdvSeed = payload.publicRendezvousSeed
			}
			return state
		},
		instanceShareableBertyIdUpdated: (state, { payload }) => {
			const client = state.aggregates[payload.aggregateId]
			if (client) {
				client.htmlUrl =
					(payload.instanceShareableBertyId && payload.instanceShareableBertyId.htmlUrl) ||
					undefined
				client.deepLink =
					(payload.instanceShareableBertyId && payload.instanceShareableBertyId.deepLink) ||
					undefined
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
	[key: string]: { protocol: ProtocolServiceSagaClient; messenger: MessengerServiceSagaClient }
} = {}
export const getProtocolService = (id: string): ProtocolServiceSagaClient => {
	const service = services[id]
	if (!service) {
		throw new Error(`Services for ${id} not found`)
	}
	return service.protocol
}
export const getMessengerService = (id: string): MessengerServiceSagaClient => {
	const service = services[id]
	if (!service) {
		throw new Error(`Services for ${id} not found`)
	}
	return service.messenger
}

export const decodeMetadataEvent = (
	response: bertytypes.GroupMetadataEvent.AsObject | api.berty.types.IGroupMetadataEvent,
) => {
	const eventType = response.metadata && response.metadata.eventType
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

const groupMetadataEventToReduxAction = (id: string, e: api.berty.types.IGroupMetadataEvent) => {
	if (!(e.metadata && e.metadata.eventType)) {
		throw new Error('Invalid reply, missing eventType')
	}
	const { eventType } = e.metadata
	const eventName = eventNameFromValue(eventType)
	if (eventName === undefined) {
		throw new Error(`Invalid event type ${eventType}`)
	}
	const cid = e.eventContext?.id && bufToStr(e.eventContext.id)
	console.log('received', eventName, 'on', id, ', cid:', cid)
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
	if (!(response.eventContext && response.eventContext.id)) {
		throw new Error('No event cid')
	}
	const type = 'protocol/GroupMessageEvent'
	const cid = response.eventContext?.id && bufToStr(response.eventContext.id)
	console.log('received GroupMessageEvent on', id, ', cid:', cid)
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

// call unaryChan on the service method by default
const defaultTransactions = {
	...Object.keys(gen.Methods).reduce((txs, methodName) => {
		const t = txs as any
		t[methodName] = function* ({ id, ...payload }: { id: string }) {
			return yield call(unaryChan, (getProtocolService(id) as any)[methodName], payload)
		}
		return txs
	}, {}),
	...Object.keys(messengerGen.Methods).reduce((txs, methodName) => {
		const t = txs as any
		t[methodName] = function* ({ id, ...payload }: { id: string }) {
			return yield call(unaryChan, (getMessengerService(id) as any)[methodName], payload)
		}
		return txs
	}, {}),
} as Transactions

export type BertyNodeConfig =
	| { type: 'external'; host: string; port: number }
	| { type: 'embedded'; opts: GoBridgeOpts }

export const defaultExternalBridgeConfig: BertyNodeConfig = {
	type: 'external',
	host: '127.0.0.1',
	port: 1337,
}

export const defaultBridgeOpts: GoBridgeOpts = {
	swarmListeners: ['/ip4/0.0.0.0/tcp/0', '/ip6/0.0.0.0/tcp/0'],
	grpcListeners: ['/ip4/127.0.0.1/tcp/0/grpcws'],
	logLevel: GoLogLevel.debug,
	persistance: true,
	tracing: true,
	tracingPrefix: '',
}

export const transactions: Transactions = {
	...defaultTransactions,
	start: function* ({ id }) {
		if (services[id] != null) {
			console.warn(`services for ${id} already exist`)
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

		const protocolService = new ProtocolServiceSagaClient(address, transport())
		services[id] = {
			protocol: protocolService,
			messenger: new MessengerServiceSagaClient(address, transport()),
		}

		// try to connect repeatedly since startBridge can return before the bridge is ready to serve
		let instanceConf
		while (true) {
			try {
				instanceConf = yield* unaryChan(protocolService.instanceGetConfiguration)
				break
			} catch (e) {
				console.warn(e)
			}
		}
		const { accountPk, devicePk, accountGroupPk } = instanceConf
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
		yield call(transactions.delete, { id: payload.id })
		yield call(GoBridge.stopProtocol)
		yield put({ type: 'RESTART_ROOT_SAGA' })
	},
	delete: function* ({ id }) {
		yield call(transactions.deleteService, { id })
		yield put(events.deleted({ aggregateId: id }))
	},
	contactRequestReference: function* (payload) {
		const reply = yield* unaryChan(getProtocolService(payload.id).contactRequestReference)
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
	instanceShareableBertyID: function* (payload) {
		const { id, ...params } = payload
		const reply = yield* unaryChan(getMessengerService(payload.id).instanceShareableBertyID, params)
		if (reply) {
			yield put(
				events.instanceShareableBertyIdUpdated({
					aggregateId: payload.id,
					instanceShareableBertyId: reply,
				}),
			)
		}
		return reply
	},
	contactRequestEnable: function* (payload) {
		const reply = yield* unaryChan(getProtocolService(payload.id).contactRequestEnable)
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
		const chan = getProtocolService(id).groupMetadataSubscribe(req)
		while (true) {
			const reply = (yield take(chan)) as EventChannelOutput<typeof chan>
			const cid = reply.eventContext?.id
			if (cid) {
				const cidStr = bufToStr(cid)
				const pkStr = bufToStr(req.groupPk)
				const alreadyRead = yield* groupsTransactions.isCIDRead({
					publicKey: pkStr,
					cid: cidStr,
				})
				if (!alreadyRead) {
					const action = groupMetadataEventToReduxAction(id, reply)
					yield put(action)
					yield put(groupsEvents.cidRead({ cid: cidStr, publicKey: pkStr }))
				}
			}
		}
	},
	groupMessageSubscribe: function* ({ id, ...req }) {
		const chan = getProtocolService(id).groupMessageSubscribe(req)
		while (true) {
			const reply = (yield take(chan)) as EventChannelOutput<typeof chan>
			const cid = reply.eventContext?.id
			if (cid) {
				const cidStr = bufToStr(cid)
				const pkStr = bufToStr(req.groupPk)
				const alreadyRead = yield* groupsTransactions.isCIDRead({
					publicKey: pkStr,
					cid: cidStr,
				})
				if (!alreadyRead) {
					const action = groupMessageEventToReduxAction(id, reply)
					yield put(action)
					yield put(groupsEvents.cidRead({ cid: cidStr, publicKey: pkStr }))
				}
			}
		}
	},
	groupMetadataList: function* ({ id, ...req }) {
		const chan = getProtocolService(id).groupMetadataList(req)
		while (true) {
			const reply = (yield take(chan)) as EventChannelOutput<typeof chan>
			const cid = reply.eventContext?.id
			if (cid) {
				const cidStr = bufToStr(cid)
				const pkStr = bufToStr(req.groupPk)
				const alreadyRead = yield* groupsTransactions.isCIDRead({
					publicKey: pkStr,
					cid: cidStr,
				})
				if (!alreadyRead) {
					const action = groupMetadataEventToReduxAction(id, reply)
					yield put(action)
					yield put(groupsEvents.cidRead({ cid: cidStr, publicKey: pkStr }))
				}
			}
		}
	},
	groupMessageList: function* ({ id, ...req }) {
		const chan = getProtocolService(id).groupMessageList(req)
		while (true) {
			const reply = (yield take(chan)) as EventChannelOutput<typeof chan>
			const cid = reply.eventContext?.id
			if (cid) {
				const cidStr = bufToStr(cid)
				const pkStr = bufToStr(req.groupPk)
				const alreadyRead = yield* groupsTransactions.isCIDRead({
					publicKey: pkStr,
					cid: cidStr,
				})
				if (!alreadyRead) {
					const action = groupMessageEventToReduxAction(id, reply)
					yield put(action)
					yield put(groupsEvents.cidRead({ cid: cidStr, publicKey: pkStr }))
				}
			}
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
	yield all([
		...makeDefaultCommandsSagas(commands, transactions),
		takeEvery('settings/main/event/nodeConfigUpdated', function* (
			action: PayloadAction<BertyNodeConfig & { id: string }>,
		) {
			yield call(transactions.restart, action.payload)
		}),
	])
}
