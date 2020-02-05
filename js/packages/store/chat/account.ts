import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { put, all, takeLeading, select, takeEvery } from 'redux-saga/effects'
import faker from 'faker'
import { Buffer } from 'buffer'

import * as protocol from '../protocol'

export type Entity = {
	id: string
	configuration: {
		accountPk: string
		devicePk: string
		accountGroupPk: string
	}
	contactRequestReference?: string
	name: string
	requests: Array<string>
	conversations: Array<string>
	contacts: Array<string>
}

export type Event = {
	id: string
	version: number
	aggregateId: string
}

export type State = {
	events: Array<Event>
	aggregates: { [key: string]: Entity }
}

export type GlobalState = {
	chat: {
		account: State
	}
}

export namespace Command {
	export type Generate = void
	export type Create = { name: string }
	export type Delete = { id: string }
	export type SendContactRequest = { id: string; otherReference: string }
}

export namespace Query {
	export type List = {}
	export type Get = { id: string }
	export type GetLength = undefined
}

export namespace Event {
	export type Created = { aggregateId: string; name: string }
	export type Deleted = { aggregateId: string }
	export type ConfigurationUpdated = {
		aggregateId: string
		configuration: {
			accountPk: string
			devicePk: string
			accountGroupPk: string
		}
	}
}

type SimpleCaseReducer<P> = CaseReducer<State, PayloadAction<P>>

export type CommandsReducer = {
	generate: SimpleCaseReducer<Command.Generate>
	create: SimpleCaseReducer<Command.Create>
	delete: SimpleCaseReducer<Command.Delete>
	sendContactRequest: SimpleCaseReducer<Command.SendContactRequest>
}

export type QueryReducer = {
	list: (state: GlobalState, query: Query.List) => Array<Entity>
	get: (state: GlobalState, query: Query.Get) => Entity
	getLength: (state: GlobalState) => number
}

export type EventsReducer = {
	created: SimpleCaseReducer<Event.Created>
	deleted: SimpleCaseReducer<Event.Deleted>
	configurationUpdated: SimpleCaseReducer<Event.ConfigurationUpdated>
}

const initialState = {
	events: [],
	aggregates: {},
}

const commandHandler = createSlice<State, CommandsReducer>({
	name: 'chat/account/command',
	initialState,
	reducers: {
		generate: (state) => state,
		create: (state) => state,
		delete: (state) => state,
		sendContactRequest: (state) => state,
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

const eventHandler = createSlice<State, EventsReducer>({
	name: 'chat/account/event',
	initialState,
	reducers: {
		created: (state, { payload }) => {
			state.aggregates[payload.aggregateId] = {
				id: payload.aggregateId,
				configuration: {
					accountPk: '',
					devicePk: '',
					accountGroupPk: '',
				},
				name: payload.name,
				requests: [],
				conversations: [],
				contacts: [],
			}
			return state
		},
		deleted: (state, { payload }) => {
			delete state.aggregates[payload.aggregateId]
			return state
		},
		configurationUpdated: (state, { payload }) => {
			if (state.aggregates[payload.aggregateId]) {
				state.aggregates[payload.aggregateId].configuration = payload.configuration
			}
			return state
		},
	},
	extraReducers: {
		[protocol.events.client.contactRequestReferenceUpdated.type]: (state, { payload }) => {
			if (state.aggregates[payload.aggregateId]) {
				state.aggregates[payload.aggregateId].contactRequestReference = intoBuffer(
					payload.reference,
				).toString('base64')
			}
			return state
		},
	},
})

export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)
export const commands = commandHandler.actions
export const events = eventHandler.actions
export const queries: QueryReducer = {
	list: (state) => Object.values(state.chat.account.aggregates),
	get: (state, { id }) => state.chat.account.aggregates[id],
	getLength: (state) => Object.keys(state.chat.account.aggregates).length,
}

export function* orchestrator() {
	yield all([
		takeLeading(commands.generate, function*() {
			yield put(commands.create({ name: faker.name.firstName() }))
		}),

		takeLeading(commands.create, function*({ payload: { name } }) {
			// create an id for the account
			const id = yield select(queries.getLength)

			yield put(protocol.commands.client.instanceGetConfiguration({ id }))

			// send event
			yield put(
				events.created({
					aggregateId: id,
					name,
				}),
			)
		}),

		takeLeading(commands.delete, function*() {
			// TODO: delete account
			// yield put(events.deleted())
		}),

		// send every chat account related events to protocol account log
		takeEvery(Object.values(events), function*(action: { type: string; payload: Event }) {
			// infinite loop ??? accountContactRequestIncomingReceived <-> contactRequestIncomingReceived
			const account = yield select((state) =>
				queries.get(state, { id: action.payload.aggregateId }),
			)
			yield put(
				protocol.commands.client.appMetadataSend({
					id: account.id,
					groupPk: account.configuration.accountGroupPk,
					payload: new Buffer(JSON.stringify(action)),
				}),
			)
		}),

		takeEvery(protocol.events.client.instanceGotConfiguration, function*(action) {
			yield put(
				events.configurationUpdated({
					aggregateId: action.payload.aggregateId,
					configuration: {
						accountPk: Buffer.from(action.payload.accountPk).toString(),
						devicePk: Buffer.from(action.payload.devicePk).toString(),
						accountGroupPk: Buffer.from(action.payload.accountGroupPk).toString(),
					},
				}),
			)
		}),

		takeEvery(commands.sendContactRequest, function*({ payload }) {
			const account = yield select((state) => queries.get(state, { id: payload.id }))
			const metadata = {
				name: account.name,
			}
			yield put(
				protocol.commands.client.contactRequestSend({
					id: payload.id,
					contactMetadata: Buffer.from(JSON.stringify(metadata), 'utf-8'),
					reference: Buffer.from(payload.otherReference, 'base64'),
				}),
			)
		}),

		takeEvery(events.configurationUpdated, function*(action) {
			const account = yield select((state) =>
				queries.get(state, { id: action.payload.aggregateId }),
			)
			yield put(protocol.commands.client.contactRequestEnable({ id: account.id }))
		}),
	])
}
