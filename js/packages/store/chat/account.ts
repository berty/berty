import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { fork, put, all, takeLeading, select, takeEvery, take } from 'redux-saga/effects'
import faker from 'faker'
import { Buffer } from 'buffer'
import { simpleflake } from 'simpleflakes/lib/simpleflakes-legacy'
import { berty } from '@berty-tech/api'

import { contact, conversation } from '../chat'
import * as protocol from '../protocol'

export type Entity = {
	id: string
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
	export type SendContactRequest = {
		id: string
		contactName: string
		contactRdvSeed: string
		contactPublicKey: string
	}
	export type Replay = { id: string }
	export type Open = { id: string }
}

export namespace Query {
	export type List = {}
	export type Get = { id: string }
	export type GetRequestReference = { id: string }
	export type GetAll = void
	export type GetLength = undefined
}

export namespace Event {
	export type Created = {
		aggregateId: string
		name: string
	}
	export type Deleted = { aggregateId: string }
}

type SimpleCaseReducer<P> = CaseReducer<State, PayloadAction<P>>

export type CommandsReducer = {
	generate: SimpleCaseReducer<Command.Generate>
	create: SimpleCaseReducer<Command.Create>
	delete: SimpleCaseReducer<Command.Delete>
	sendContactRequest: SimpleCaseReducer<Command.SendContactRequest>
	replay: SimpleCaseReducer<Command.Replay>
	open: SimpleCaseReducer<Command.Open>
}

export type QueryReducer = {
	list: (state: GlobalState, query: Query.List) => Array<Entity>
	get: (state: GlobalState, query: Query.Get) => Entity
	getRequestRdvSeed: (
		state: protocol.client.GlobalState,
		query: Query.GetRequestReference,
	) => string | undefined
	getAll: (state: GlobalState, query: Query.GetAll) => Array<Entity>
	getLength: (state: GlobalState) => number
}

export type EventsReducer = {
	created: SimpleCaseReducer<Event.Created>
	deleted: SimpleCaseReducer<Event.Deleted>
}

export type Transactions = {
	[K in keyof CommandsReducer]: CommandsReducer[K] extends SimpleCaseReducer<infer TPayload>
		? (payload: TPayload) => Generator
		: never
}

const initialState = {
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
		replay: (state) => state,
		open: (state) => state,
	},
})

const eventHandler = createSlice<State, EventsReducer>({
	name: 'chat/account/event',
	initialState,
	reducers: {
		created: (state, { payload }) => {
			state.aggregates[payload.aggregateId] = {
				id: payload.aggregateId,
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
	},
})

export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)
export const commands = commandHandler.actions
export const events = eventHandler.actions
export const queries: QueryReducer = {
	list: (state) => Object.values(state.chat.account.aggregates),
	get: (state, { id }) => state.chat.account.aggregates[id],
	getRequestRdvSeed: (state, { id }) =>
		protocol.queries.client.get(state, { id })?.contactRequestRdvSeed,
	getAll: (state) => Object.values(state.chat.account.aggregates),
	getLength: (state) => Object.keys(state.chat.account.aggregates).length,
}

export const getProtocolClient = function*(id: string): Generator<unknown, protocol.Client, void> {
	const client = (yield select((state) => protocol.queries.client.get(state, { id }))) as
		| protocol.Client
		| undefined
	if (client == null) {
		throw new Error('client is not defined')
	}
	return client
}

export const transactions: Transactions = {
	open: function*({ id }) {
		yield* protocol.transactions.client.start({ id })
		yield* conversation.transactions.open({ accountId: id })

		// subcribe to account log
		const client = yield* getProtocolClient(id)
		yield fork(function*() {
			const chan = yield* protocol.transactions.client.groupMetadataSubscribe({
				id: client.id,
				groupPk: new Buffer(client.accountGroupPk),
				// TODO: use last cursor
				since: new Uint8Array(),
				until: new Uint8Array(),
				goBackwards: false,
			})
			while (1) {
				const action = yield take(chan)
				yield put(action)
				if (action.type === protocol.events.client.groupMetadataPayloadSent.type) {
					yield put(action.payload.event)
				}
			}
		})
		yield* protocol.transactions.client.contactRequestEnable({ id })
	},
	generate: function*() {
		yield* transactions.create({ name: faker.name.firstName() })
	},
	create: function*({ name }) {
		// create an id for the account
		const id = simpleflake().toString()

		const event = events.created({
			aggregateId: id,
			name,
		})
		// open account
		yield* transactions.open({ id })
		// get account PK
		const client = yield* getProtocolClient(id)

		yield* protocol.transactions.client.appMetadataSend({
			id,
			groupPk: new Buffer(client.accountGroupPk),
			payload: new Buffer(JSON.stringify(event)),
		})
	},
	delete: function*() {
		yield put({ type: 'CLEAR_STORE' })
	},
	replay: function*({ id }) {
		const account = select((state) => queries.get(state, { id }))
		if (account == null) {
			console.error('account does not exist')
			return
		}

		const client = yield* getProtocolClient(id)

		// replay log from first event
		const chan = yield* protocol.transactions.client.groupMetadataSubscribe({
			id: client.id,
			groupPk: new Buffer(client.accountGroupPk),
			// TODO: use last cursor
			since: new Uint8Array(),
			until: new Uint8Array(),
			goBackwards: false,
		})
		yield takeEvery(chan, function*(
			action: protocol.client.Commands extends {
				[key: string]: (
					state: protocol.client.State,
					action: infer UAction,
				) => protocol.client.State
			}
				? UAction
				: { type: string; payload: { event: any } },
		) {
			yield put(action)
			if (action.type === protocol.events.client.groupMetadataPayloadSent.type) {
				yield put(action.payload.event)
			}
		})
	},
	sendContactRequest: function*(payload) {
		const account = (yield select((state) => queries.get(state, { id: payload.id }))) as
			| Entity
			| undefined
		if (account == null) {
			throw new Error("account doesn't exist")
		}

		const metadata = {
			name: account.name,
			givenName: payload.contactName,
		}

		const contact: berty.types.IShareableContact = {
			pk: Buffer.from(payload.contactPublicKey, 'utf-8'),
			publicRendezvousSeed: Buffer.from(payload.contactRdvSeed, 'utf-8'),
			metadata: Buffer.from(JSON.stringify(metadata), 'utf-8'),
		}

		yield* protocol.transactions.client.contactRequestSend({
			id: payload.id,
			contact,
		})
	},
}

export function* orchestrator() {
	yield all([
		fork(function*() {
			yield take('persist/REHYDRATE')
			// start protocol clients
			const accounts = (yield select(queries.getAll)) as Entity[]
			for (const account of accounts) {
				yield* transactions.open({ id: account.id })
				yield* contact.transactions.open({ accountId: account.id })
			}
		}),

		takeLeading(commands.open, function*(action) {
			yield* transactions.open(action.payload)
		}),

		takeLeading(commands.generate, function*(action) {
			yield* transactions.generate(action.payload)
		}),
		// TODO: fix create account with takeLeading
		takeEvery(commands.create, function*(action) {
			yield* transactions.create(action.payload)
		}),
		takeLeading(commands.delete, function*(action) {
			yield* transactions.delete(action.payload)
		}),
		takeLeading(commands.replay, function*(action) {
			yield* transactions.replay(action.payload)
		}),
		takeLeading(commands.sendContactRequest, function*(action) {
			yield* transactions.sendContactRequest(action.payload)
		}),
	])
}
