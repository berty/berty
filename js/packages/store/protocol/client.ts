import { WebsocketTransport } from '@berty-tech/grpc-bridge'
import GoBridge, { GoBridgeOpts, GoLogLevel } from '@berty-tech/go-bridge'
import { createSlice, PayloadAction, Action, CaseReducer } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import {
	all,
	put,
	putResolve,
	call,
	delay,
	take,
	fork,
	join,
	takeEvery,
	race,
	select,
	cancelled,
} from 'redux-saga/effects'
import { Task } from 'redux-saga'
import * as gen from './client.gen'
import * as messengerGen from '../messenger/client.gen'
import * as api from '@berty-tech/api'
import Case from 'case'
import * as evgen from '../types/events.gen'
import { makeDefaultReducers, makeDefaultCommandsSagas, bufToStr, bufToJSON } from '../utils'
import ExternalTransport from './externalTransport'
import { getMainSettings } from '../settings/main'
import ProtocolServiceSagaClient from './ProtocolServiceSagaClient.gen'
import { grpc } from '@improbable-eng/grpc-web'
import { unaryChan, EventChannelOutput } from '../sagaUtils'
import MessengerServiceSagaClient from '../messenger/MessengerServiceSagaClient.gen'
import { transactions as groupsTransactions, events as groupsEvents } from '../groups'

export type State = {
	contactRequestRdvSeed?: string
	deepLink?: string
	htmlUrl?: string
	accountPk: string
	devicePk: string
	accountGroupPk: string
} | null

export type GlobalState = {
	protocol: {
		client: State
	}
}

export type Commands = gen.Commands<State> &
	messengerGen.Commands<State> & {
		delete: CaseReducer<State, PayloadAction>
	}

export type Queries = {
	get: (state: GlobalState) => State
}

export type Events = evgen.Events<State> & {
	started: CaseReducer<
		State,
		PayloadAction<{
			accountPk: string
			devicePk: string
			accountGroupPk: string
		}>
	>
	contactRequestRdvSeedUpdated: CaseReducer<
		State,
		PayloadAction<{
			publicRendezvousSeed: string
		}>
	>
	instanceShareableBertyIdUpdated: CaseReducer<
		State,
		PayloadAction<{
			instanceShareableBertyId: api.berty.messenger.v1.InstanceShareableBertyID.IReply
		}>
	>
	deleted: CaseReducer<State, Action>
}

type MethodKey = keyof typeof gen.Methods
const protocolMethodsKeys = Object.keys(gen.Methods) as MethodKey[]
type MessengerMethodKey = keyof typeof messengerGen.Methods
const messengerMethodsKeys = Object.keys(messengerGen.Methods) as MessengerMethodKey[]

type DefaultTxs = Record<
	MethodKey,
	(...args: Parameters<ReturnType<typeof getProtocolService>[MethodKey]>) => Generator
>

type DefaultMessengerTxs = Record<
	MessengerMethodKey,
	(...args: Parameters<ReturnType<typeof getMessengerService>[MessengerMethodKey]>) => Generator
>

export type Transactions = DefaultTxs &
	DefaultMessengerTxs & {
		listenToGroupMetadata: (payload: { groupPk: Uint8Array }) => Generator
		listenToGroupMessages: (payload: { groupPk: Uint8Array }) => Generator
		listenToGroup: (payload: { groupPk: Uint8Array }) => Generator
		start: (payload: { name: string }) => Generator
		stop: () => Generator
		restart: () => Generator
		delete: () => Generator
	}

const initialState: State = null

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

const eventHandler = createSlice<State, Events>({
	name: 'protocol/client/event',
	initialState,
	reducers: {
		...makeDefaultReducers(eventsNames),
		started: (state, action) => {
			if (!state) {
				state = {
					accountPk: action.payload.accountPk,
					devicePk: action.payload.devicePk,
					accountGroupPk: action.payload.accountGroupPk,
				}
			}
			return state
		},
		contactRequestRdvSeedUpdated: (state, { payload }) => {
			const client = state
			if (client) {
				client.contactRequestRdvSeed = payload.publicRendezvousSeed
			}
			return state
		},
		instanceShareableBertyIdUpdated: (state, { payload }) => {
			const client = state
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
		deleted: () => {
			return null
		},
	},
})

export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)
export const commands = commandHandler.actions
export const events = eventHandler.actions
export const queries: Queries = {
	get: (state) => state.protocol.client,
}

const eventNameFromValue = (value: number) => {
	if (typeof value !== 'number') {
		throw new Error(`client.ts: eventNameFromValue: expected number argument, got ${typeof value}`)
	}
	return api.berty.types.v1.EventType[value]
}

export let services:
	| {
			protocol: ProtocolServiceSagaClient
			messenger: MessengerServiceSagaClient
	  }
	| undefined
export const getProtocolService = (): ProtocolServiceSagaClient => {
	if (!services) {
		throw new Error('Protocol service not found')
	}
	return services.protocol
}
export const getMessengerService = (): MessengerServiceSagaClient => {
	if (!services) {
		throw new Error('Messenger service not found')
	}
	return services.messenger
}

export const decodeMetadataEvent = (response: api.berty.types.v1.IGroupMetadataEvent) => {
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
		EventTypeGroupMetadataPayloadSent: 'AppMetadata',
	}
	const eventName = eventNameFromValue(eventType)
	if (eventName === undefined) {
		throw new Error(`Invalid event type ${eventType}`)
	}
	const protocol: { [key: string]: any } = api.berty.types.v1
	const event = protocol[eventName.replace('EventType', '')] || protocol[eventsMap[eventName]]
	if (!event) {
		console.warn("Don't know how to decode", eventName)
		return undefined
	}
	const decodedEvent = event.decode(response.event)
	if (eventName === 'EventTypeGroupMetadataPayloadSent') {
		if (!decodedEvent?.message) {
			return {}
		}
		try {
			return bufToJSON(decodedEvent.message) // <---- Not secure
		} catch (e) {
			console.warn('Received invalid JSON in group metadata', e)
		}
		return {}
	}
	return decodedEvent
}

const groupMetadataEventToReduxAction = (e: api.berty.types.v1.IGroupMetadataEvent) => {
	if (!(e.metadata && e.metadata.eventType)) {
		throw new Error('Invalid reply, missing eventType')
	}
	const { eventType } = e.metadata
	const eventName = eventNameFromValue(eventType)
	if (eventName === undefined) {
		throw new Error(`Invalid event type ${eventType}`)
	}
	const cid = e.eventContext?.id && bufToStr(e.eventContext.id)
	console.log('received', eventName, ', cid:', cid)
	const type = `${eventHandler.name}/${Case.camel(eventName.replace('EventType', ''))}`
	return {
		type,
		payload: {
			eventContext: e.eventContext,
			headers: e.metadata,
			event: decodeMetadataEvent(e),
		},
	}
}

const groupMessageEventToReduxAction = (response: api.berty.types.v1.IGroupMessageEvent) => {
	if (!(response.eventContext && response.eventContext.id)) {
		throw new Error('No event cid')
	}
	const type = 'protocol/GroupMessageEvent'
	const cid = response.eventContext?.id && bufToStr(response.eventContext.id)
	console.log('received GroupMessageEvent with cid:', cid)
	return {
		type,
		payload: {
			eventContext: response.eventContext,
			headers: response.headers,
			message: response.message,
		},
	}
}

// call unaryChan on the service method by default
const defaultTransactions = {
	...protocolMethodsKeys.reduce(
		(txs, methodName) => ({
			...txs,
			[methodName]: function* (
				payload: Parameters<ReturnType<typeof getProtocolService>[typeof methodName]>[0],
			) {
				const f = getProtocolService()[methodName]
				const reply = yield* unaryChan(f, payload)
				return reply
			},
		}),
		{} as DefaultTxs,
	),
	...messengerMethodsKeys.reduce(
		(txs, methodName) => ({
			...txs,
			[methodName]: function* (
				payload: Parameters<ReturnType<typeof getMessengerService>[typeof methodName]>[0],
			) {
				const f = getMessengerService()[methodName]
				return yield* unaryChan(f, payload)
			},
		}),
		{} as DefaultMessengerTxs,
	),
}

export function* getProtocolClient() {
	const client = (yield select(queries.get)) as State
	if (!client) {
		throw new Error('client is not defined')
	}
	return client
}

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
	poiDebug: true,
	persistance: true,
	tracing: true,
	tracingPrefix: '',
	localDiscovery: true,
}

const ensureNodeStarted = async (opts: GoBridgeOpts) => {
	try {
		console.log('Starting node..')
		await GoBridge.startProtocol(opts)
		console.log('Done starting node!')
	} catch (e) {
		if (e.domain === 'already started') {
			console.warn('Node already started!')
			return
		}
		console.log('error', e)
		throw e
	}
}

export const transactions: Transactions = {
	...defaultTransactions,
	start: function* () {
		const { nodeConfig } = yield* getMainSettings()

		let address
		let transport: () => grpc.TransportFactory

		if (nodeConfig.type === 'external') {
			address = `http://${nodeConfig.host}:${nodeConfig.port}`
			transport = ExternalTransport
		} else {
			yield call(ensureNodeStarted, nodeConfig.opts)
			const addr = (yield call(GoBridge.getProtocolAddr)) as string
			transport = WebsocketTransport
			address = `http://${addr}`
		}

		const protocolService = new ProtocolServiceSagaClient(address, transport())
		const messengerService = new MessengerServiceSagaClient(address, transport())
		services = {
			protocol: protocolService,
			messenger: messengerService,
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
			yield delay(1000)
		}
		yield fork(function* watchdogRace() {
			yield race({
				watchdog: call(function* () {
					console.log('starting watchdog')
					function* testAvailability(...conf: [Parameters<typeof unaryChan>[0], string][]) {
						for (const [method, name] of conf) {
							try {
								yield* unaryChan(method)
							} catch (e) {
								console.warn(`${name} service watchdog failed:`, e)
								yield call(transactions.restart)
								return true
							} finally {
								if (yield cancelled()) {
									console.log('watchdog cancelled')
									return true // eslint-disable-line no-unsafe-finally
								}
							}
						}
						return false
					}
					try {
						while (true) {
							if (
								yield* testAvailability(
									[protocolService.instanceGetConfiguration, 'protocol'],
									//[messengerService.systemInfo, 'messenger'],
								)
							) {
								console.log('watchdog stoped!')
								return
							}
							yield delay(2000)
						}
					} catch (e) {
						throw e
					} finally {
						yield put({ type: 'WATCHDOG_STOPED' })
					}
				}),
				stop: call(function* () {
					yield take('STOP_CLIENT')
					console.log('stoping watchdog..')
				}),
			})
		})
		const { accountPk, devicePk, accountGroupPk } = instanceConf
		if (!(accountPk && devicePk && accountGroupPk)) {
			throw new Error('Invalid instance data')
		}

		const { timeout } = (yield race({
			ready: call(function* checkReady() {
				while (true) {
					try {
						yield* transactions.instanceGetConfiguration()
						break
					} catch (e) {
						console.warn(e)
					}
					yield delay(1000)
				}
			}),
			timeout: delay(10000),
		})) as any

		if (timeout) {
			throw new Error('Failed to start node\nPlease restart the app')
		}

		yield putResolve(
			events.started({
				accountPk: bufToStr(accountPk),
				devicePk: bufToStr(devicePk),
				accountGroupPk: bufToStr(accountGroupPk),
			}),
		)
	},
	stop: function* () {
		yield put({ type: 'STOP_CLIENT' })
		yield take('WATCHDOG_STOPED')
		console.log('watchdog stoped')
		yield take('GROUPS_STOPED')
		console.log('groups stoped')
		console.log('stoping protocol')
		yield call(GoBridge.stopProtocol)
		console.log('protocol stoped')
		yield call(transactions.delete)
		console.log('client deleted')
	},
	restart: function* () {
		yield* transactions.stop()
		console.log('put restart root saga')
		yield put({ type: 'RESTART_ROOT_SAGA' })
	},
	delete: function* () {
		yield put(events.deleted())
	},
	contactRequestReference: function* () {
		const reply = yield* unaryChan(getProtocolService().contactRequestReference)
		if (reply.publicRendezvousSeed) {
			yield put(
				events.contactRequestRdvSeedUpdated({
					publicRendezvousSeed: bufToStr(reply.publicRendezvousSeed),
				}),
			)
		}
		return reply
	},
	instanceShareableBertyID: function* (payload) {
		const reply = yield* unaryChan(getMessengerService().instanceShareableBertyID, payload)
		if (reply) {
			yield put(
				events.instanceShareableBertyIdUpdated({
					instanceShareableBertyId: reply,
				}),
			)
		}
		return reply
	},
	contactRequestEnable: function* () {
		const reply = yield* unaryChan(getProtocolService().contactRequestEnable)
		if (!reply.publicRendezvousSeed) {
			throw new Error(`Invalid reference ${reply.publicRendezvousSeed}`)
		}
		yield put(
			events.contactRequestRdvSeedUpdated({
				publicRendezvousSeed: bufToStr(reply.publicRendezvousSeed),
			}),
		)
		return reply
	},
	groupMetadataSubscribe: function* (req: any) {
		const chan = getProtocolService().groupMetadataSubscribe(req)
		try {
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
						const action = groupMetadataEventToReduxAction(reply)
						yield put(action)
						yield put(groupsEvents.cidRead({ cid: cidStr, publicKey: pkStr }))
					}
				}
			}
		} catch (e) {
			throw e
		} finally {
			chan.close()
		}
	},
	groupMessageSubscribe: function* (req) {
		const chan = getProtocolService().groupMessageSubscribe(req)
		try {
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
						const action = groupMessageEventToReduxAction(reply)
						yield put(action)
						yield put(groupsEvents.cidRead({ cid: cidStr, publicKey: pkStr }))
					}
				}
			}
		} catch (e) {
			throw e
		} finally {
			chan.close()
		}
	},
	groupMetadataList: function* (req) {
		const chan = getProtocolService().groupMetadataList(req)
		try {
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
						const action = groupMetadataEventToReduxAction(reply)
						yield put(action)
						yield put(groupsEvents.cidRead({ cid: cidStr, publicKey: pkStr }))
					}
				}
			}
		} catch (e) {
			throw e
		} finally {
			chan.close()
		}
	},
	groupMessageList: function* (req) {
		const chan = getProtocolService().groupMessageList(req)
		try {
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
						const action = groupMessageEventToReduxAction(reply)
						yield put(action)
						yield put(groupsEvents.cidRead({ cid: cidStr, publicKey: pkStr }))
					}
				}
			}
		} catch (e) {
			throw e
		} finally {
			chan.close()
		}
	},
	listenToGroupMetadata: function* ({ groupPk }) {
		console.log('starting listenToGroupMetadata')
		const subscribeTask = (yield fork(function* () {
			let run = true
			while (run) {
				try {
					yield call(transactions.groupMetadataSubscribe, {
						groupPk,
						// TODO: use last cursor
						since: new Uint8Array(),
						until: new Uint8Array(),
						goBackwards: false,
					})
				} catch (e) {
					console.warn('listenToGroupMetadata error:', e)
				} finally {
					if (yield cancelled()) {
						console.log('listenToGroupMetadata cancelled')
						run = false
					}
				}
				if (run) {
					yield delay(1000)
				}
			}
		})) as Task

		let run = false
		while (run) {
			try {
				yield call(transactions.groupMetadataList, { groupPk })
				run = false
			} catch (e) {
				console.warn(e)
			} finally {
				if (yield cancelled()) {
					run = false
				}
			}
			if (run) {
				yield delay(1000)
			}
		}

		yield join(subscribeTask)
	},
	listenToGroupMessages: function* ({ groupPk }) {
		console.log('starting listenToGroupMessages')
		const subscribeTask = (yield fork(function* () {
			let run = true
			while (run) {
				try {
					yield call(transactions.groupMessageSubscribe, {
						groupPk,
						// TODO: use last cursor
						since: new Uint8Array(),
						until: new Uint8Array(),
						goBackwards: false,
					})
				} catch (e) {
					console.warn('listenToGroupMessages error:', e)
				} finally {
					if (yield cancelled()) {
						console.log('listenToGroupMessages cancelled')
						run = false
					}
				}
				if (run) {
					yield delay(1000)
				}
			}
		})) as Task

		let run = false
		while (run) {
			try {
				yield call(transactions.groupMessageSubscribeList, { groupPk })
				run = false
			} catch (e) {
				console.warn(e)
			} finally {
				if (yield cancelled()) {
					run = false
				}
			}
			if (run) {
				yield delay(1000)
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
		takeEvery('settings/main/event/nodeConfigUpdated', function* () {
			yield call(transactions.restart)
		}),
	])
}
