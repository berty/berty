import { createSlice, CaseReducer, PayloadAction } from '@reduxjs/toolkit'
import { composeReducers } from 'redux-compose'
import { put, all, select, takeLeading, takeEvery } from 'redux-saga/effects'
import { berty, google } from '@berty-tech/api'
import { Buffer } from 'buffer'

import * as protocol from '../protocol'
import { contact } from '../chat'

export type Entity = {
	id: string
	title: string
	pk: string | null
	kind: berty.chatmodel.Conversation.Kind // Unknown, Self, OneToOne, PrivateGroup
	createdAt: google.protobuf.ITimestamp | string
	members: Array<number>
	messages: Array<number>
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
		conversation: State
	}
}

export namespace Command {
	export type Generate = void
	export type Create = {}
	export type Delete = { id: string }
	export type DeleteAll = void
}

export namespace Query {
	export type List = void
	export type Get = { id: string }
	export type GetLength = void
}

export namespace Event {
	export type Deleted = { aggregateId: string }
	export type Created = {
		aggregateId: string
		title: string
		pk: Uint8Array
		kind: berty.chatmodel.Conversation.Kind
	}
}

type SimpleCaseReducer<P> = CaseReducer<State, PayloadAction<P>>

export type CommandsReducer = {
	generate: SimpleCaseReducer<Command.Generate>
	create: SimpleCaseReducer<Command.Create>
	delete: SimpleCaseReducer<Command.Delete>
	deleteAll: SimpleCaseReducer<Command.DeleteAll>
}

export type QueryReducer = {
	list: (state: GlobalState, query: Query.List) => Array<Entity>
	get: (state: GlobalState, query: Query.Get) => Entity
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

const initialState: State = {
	events: [],
	aggregates: {},
}

const commandHandler = createSlice<State, CommandsReducer>({
	name: 'chat/conversation/command',
	initialState,
	reducers: {
		generate: (state) => state,
		create: (state) => state,
		delete: (state) => state,
		deleteAll: (state) => state,
	},
})

const getAggregateId: (kwargs: { accountId: string; groupPk: Uint8Array }) => string = ({
	accountId,
	groupPk,
}) => Buffer.concat([Buffer.from(accountId, 'utf-8'), Buffer.from(groupPk)]).toString('base64')

const eventHandler = createSlice<State, EventsReducer>({
	name: 'chat/conversation/event',
	initialState,
	reducers: {
		deleted: (state, { payload }) => {
			// Delete conversation
			delete state.aggregates[payload.aggregateId]
			return state
		},
		created: (state, { payload }) => {
			const { aggregateId, pk, title, kind } = payload
			// Create id
			const id = getAggregateId({ accountId: aggregateId, groupPk: pk })
			if (!state.aggregates[id]) {
				state.aggregates[id] = {
					id,
					title,
					pk: new Buffer(pk).toString('base64'),
					kind,
					createdAt: '9:21',
					members: [],
					messages: [],
				}
			}
			return state
		},
	},
})

export const reducer = composeReducers(commandHandler.reducer, eventHandler.reducer)
export const commands = commandHandler.actions
export const events = eventHandler.actions
export const queries: QueryReducer = {
	list: (state) => Object.values(state.chat.conversation.aggregates),
	get: (state, { id }) => state.chat.conversation.aggregates[id],
	getLength: (state) => Object.keys(state.chat.conversation.aggregates).length,
}

export const transactions: Transactions = {
	generate: function*() {
		// TODO: conversation generate
	},
	create: function*() {
		// TODO: conversation create
	},
	delete: function*({ id }) {
		yield put(
			events.deleted({
				aggregateId: id,
			}),
		)
	},
	deleteAll: function*() {
		// Recup conversations
		const conversations = (yield select(queries.list)) as Entity[]
		// Delete conversations
		for (const conversation of conversations) {
			yield* transactions.delete({ id: conversation.id })
		}
	},
}

export function* orchestrator() {
	yield all([
		takeLeading(commands.generate, function*(action) {
			yield* transactions.generate(action.payload)
		}),
		takeLeading(commands.create, function*(action) {
			yield* transactions.create(action.payload)
		}),
		takeLeading(commands.delete, function*(action) {
			yield* transactions.delete(action.payload)
		}),
		takeLeading(commands.deleteAll, function*() {
			yield* transactions.deleteAll()
		}),
		// Events
		takeEvery(protocol.events.client.accountContactRequestIncomingAccepted, function*({ payload }) {
			const {
				event: { contactPk, groupPk },
				aggregateId: accountId,
			} = payload
			// Recup the request (for requester name)
			const request = (yield select((state) =>
				contact.queries.getWithId(state, { contactPk, accountId }),
			)) as contact.Entity | undefined
			if (!request) {
				return
			}
			const aggregateId = getAggregateId({ accountId, groupPk })
			yield put(
				events.created({
					aggregateId,
					title: request.name,
					pk: groupPk,
					kind: berty.chatmodel.Conversation.Kind.OneToOne,
				}),
			)
		}),
		takeEvery(protocol.events.client.accountContactRequestOutgoingEnqueued, function*({ payload }) {
			const {
				aggregateId: accountId,
				event: { groupPk, contactMetadata },
			} = payload
			// Create id
			const aggregateId = getAggregateId({ accountId, groupPk })
			// Recup metadata
			const metadata = JSON.parse(new Buffer(contactMetadata).toString('utf-8'))
			yield put(
				events.created({
					aggregateId,
					title: metadata.givenName,
					pk: groupPk,
					kind: berty.chatmodel.Conversation.Kind.OneToOne,
				}),
			)
		}),
	])
}
